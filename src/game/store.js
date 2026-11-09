/**
 * 存档读写。
 *
 * 兼容策略：**同步优先，异步只做兜底**。
 *  - 所有浏览器（包括 IE7/IE8）走 localStorage，同步返回，启动即可生效；
 *  - 桌面端（Tauri / WebView2）额外把状态写进安装目录的 data/save.json，
 *    通过异步 IPC 完成，不阻塞启动；读回来的值稍晚覆盖一次。
 *  - 全文件不使用 async/await / Promise：老浏览器里 async 转译需要
 *    regeneratorRuntime + Promise 垫片，体积和复杂度都不划算。
 *
 * localStorage 在 file:// 或隐私模式下可能直接抛异常，全部包 try/catch：
 * 存不了档只是「下次从头开始」，绝不能让游戏白屏。
 */
const invoke =
  (typeof window !== 'undefined' && window.__TAURI__ && window.__TAURI__.core && window.__TAURI__.core.invoke) ||
  (typeof window !== 'undefined' && window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.invoke) ||
  null;

export const isDesktop = !!invoke;

const LS_KEY = 'mah-le-mah.save.v1';

export function loadSave() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    /* file:// / 隐私模式 / IE7 无 JSON -> 静默降级 */
  }
  return null;
}

export function writeSave(data) {
  let json;
  try {
    json = JSON.stringify(data);
  } catch (e) {
    return false;
  }
  try {
    localStorage.setItem(LS_KEY, json);
    return true;
  } catch (e) {
    return false;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(LS_KEY);
  } catch (e) {
    /* ignore */
  }
}

/* ---------- 桌面端异步桥（只有 Tauri 环境会执行到） ---------- */

export function syncDesktopSave(apply) {
  if (!invoke) return;
  try {
    const p = invoke('load_state');
    if (p && typeof p.then === 'function') {
      p.then((raw) => {
        if (!raw) return;
        try {
          apply(JSON.parse(raw));
        } catch (e) {
          /* ignore */
        }
      }, () => {});
    }
  } catch (e) {
    console.warn('[store] load_state failed', e);
  }
}

export function writeDesktopSave(data) {
  if (!invoke) return;
  try {
    invoke('save_state', { data: JSON.stringify(data) });
  } catch (e) {
    /* ignore */
  }
}

export function resetDesktopSave() {
  if (!invoke) return;
  try {
    invoke('reset_state');
  } catch (e) {
    /* ignore */
  }
}

/* ---------- 绿色版：数据目录 & 一键卸载 ---------- */

/** 桌面版的数据目录（<exe 同级>/MahLeMah_Data），浏览器版返回空串 */
export function fetchDataDir(apply) {
  if (!invoke) {
    apply('');
    return;
  }
  try {
    const p = invoke('data_dir_path');
    if (p && typeof p.then === 'function') {
      p.then((dir) => apply(dir || ''), () => apply(''));
    } else {
      apply('');
    }
  } catch (e) {
    apply('');
  }
}

/**
 * 一键卸载：
 *   1. 清掉 localStorage 里的存档；
 *   2. 优先用 Tauri fs 插件删除 MahLeMah_Data（插件受 capability scope 保护）；
 *   3. 无论插件是否成功，都调用 Rust 的 uninstall_app —— 它会再删一次数据目录、
 *      排一个"进程退出后删除 exe 自身"的脚本，然后退出进程。
 * 返回 true 表示已交给桌面端执行；浏览器里返回 false（不做事）。
 */
export function uninstallGame(dataDir) {
  clearSave();

  if (!invoke) return false;

  const fsApi = typeof window !== 'undefined' && window.__TAURI__ && window.__TAURI__.fs;
  if (fsApi && dataDir && typeof fsApi.remove === 'function') {
    try {
      const p = fsApi.remove(dataDir, { recursive: true });
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch (e) {
      /* Rust 侧会兜底 */
    }
  }

  try {
    invoke('uninstall_app');
  } catch (e) {
    return false;
  }
  return true;
}
