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

/* ---------- 桌面版：数据目录（只读展示） ---------- */

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
 * v2.0.0 安全边界：前端不再执行任何文件删除、不再调用 uninstall_app、
 * 不再启动任何系统命令。FS 插件已从 Tauri 侧整体移除，capability 只剩
 * core:default。卸载完全由 NSIS 安装器生成的卸载程序（开始菜单 /
 * Windows「应用和功能」）负责，游戏内只展示操作指引。
 *
 * 保留一个纯内存/本地存档的清理入口，供「重置进度」使用；它不会碰
 * MahLeMah_Data 里的任何文件，也不触发任何卸载类 IPC。
 */
export function clearLocalProgress() {
  clearSave();
  resetDesktopSave();
}
