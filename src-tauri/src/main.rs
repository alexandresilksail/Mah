#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

//! Mah Le Mah —— Tauri 2 绿色单文件外壳
//!
//! v2.0.0 三条硬规则（安全验收核心）：
//!   1. **零注册表**：不读不写 HKLM / HKCU。连「WebView2 是否安装」都不再查注册表，
//!      改为直接启动 + 失败时弹原生提示。
//!   2. **零 AppData**：存档与 WebView2 缓存全部落在 `<exe 同级>/MahLeMah_Data`。
//!   3. **最小权限 / 不自毁**：不再注册 fs 插件，不再给前端任何文件删除 capability，
//!      删除 `uninstall_app` 与 `schedule_self_delete()`。前端只能通过 4 个白名单命令
//!      （load_state / save_state / reset_state / data_dir_path）读写
//!      `MahLeMah_Data/save.json`；卸载完全交给 NSIS 安装器生成的卸载程序。
//!
//! 产物：`cargo build --release`（或 `npm run tauri build`，bundle.targets=["nsis"]）。

use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};

/// 与 exe 同级的数据目录名（对外承诺的唯一落点）
const DATA_DIR: &str = "MahLeMah_Data";

fn exe_path() -> Result<PathBuf, String> {
    std::env::current_exe().map_err(|e| format!("无法定位程序路径: {e}"))
}

fn exe_dir() -> Result<PathBuf, String> {
    let exe = exe_path()?;
    exe.parent()
        .map(Path::to_path_buf)
        .ok_or_else(|| "无法定位程序目录".to_string())
}

/// `<exe 同级>/MahLeMah_Data`，不存在时自动创建。
pub fn data_dir() -> Result<PathBuf, String> {
    let dir = exe_dir()?.join(DATA_DIR);
    fs::create_dir_all(&dir).map_err(|e| format!("无法创建数据目录: {e}"))?;
    Ok(dir)
}

/* ------------------------------------------------------------------ */
/* IPC 命令                                                            */
/* ------------------------------------------------------------------ */

/// 前端用它做「数据目录」展示与 fs 插件的目标路径
#[tauri::command]
fn data_dir_path() -> Result<String, String> {
    Ok(data_dir()?.to_string_lossy().to_string())
}

/// 读取存档；文件不存在时返回空串（前端按"无存档"处理）
#[tauri::command]
fn load_state() -> Result<String, String> {
    let path = data_dir()?.join("save.json");
    match fs::read_to_string(&path) {
        Ok(s) if !s.trim().is_empty() => Ok(s),
        Ok(_) => Ok(String::new()),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(String::new()),
        Err(e) => Err(format!("读取存档失败: {e}")),
    }
}

/// 原子写：先写 .tmp 再 rename，避免断电/崩溃导致存档损坏
#[tauri::command]
fn save_state(data: String) -> Result<(), String> {
    let dir = data_dir()?;
    let path = dir.join("save.json");
    let tmp = dir.join("save.json.tmp");
    {
        let mut f = fs::File::create(&tmp).map_err(|e| format!("创建临时文件失败: {e}"))?;
        f.write_all(data.as_bytes())
            .map_err(|e| format!("写入失败: {e}"))?;
        let _ = f.sync_all();
    }
    fs::rename(&tmp, &path).map_err(|e| format!("保存失败: {e}"))?;
    Ok(())
}

/// 清空存档（"重置进度"）
#[tauri::command]
fn reset_state() -> Result<(), String> {
    let dir = data_dir()?;
    for name in ["save.json", "save.json.tmp"] {
        let p = dir.join(name);
        if p.exists() {
            let _ = fs::remove_file(p);
        }
    }
    Ok(())
}

/* v2.0.0：删除 uninstall_app / schedule_self_delete。
   前端不允许触发自删除、启动 cmd 或删除任意路径；卸载由 NSIS 卸载程序负责。 */

/* ------------------------------------------------------------------ */
/* 原生提示（WebView2 缺失时用，不读注册表）                            */
/* ------------------------------------------------------------------ */

#[cfg(windows)]
mod native {
    use std::os::windows::process::CommandExt;
    use std::process::Command;

    const CREATE_NO_WINDOW: u32 = 0x0800_0000;
    pub const WEBVIEW2_URL: &str = "https://go.microsoft.com/fwlink/p/?LinkId=2124703";

    fn wide(s: &str) -> Vec<u16> {
        s.encode_utf16().chain(std::iter::once(0)).collect()
    }

    pub fn message(title: &str, text: &str) {
        use windows_sys::Win32::UI::WindowsAndMessaging::{
            MessageBoxW, MB_ICONWARNING, MB_OK, MB_SETFOREGROUND,
        };
        let t = wide(title);
        let c = wide(text);
        unsafe {
            MessageBoxW(
                std::mem::zeroed(),
                c.as_ptr(),
                t.as_ptr(),
                MB_OK | MB_ICONWARNING | MB_SETFOREGROUND,
            );
        }
    }

    pub fn open_download_page() {
        let _ = Command::new("cmd")
            .args(["/C", "start", "", WEBVIEW2_URL])
            .creation_flags(CREATE_NO_WINDOW)
            .spawn();
    }
}

/* ------------------------------------------------------------------ */

/// WebView2 的用户数据（缓存 / IndexedDB / GPU cache）也放进 MahLeMah_Data，
/// 否则默认会落到 `%LOCALAPPDATA%\<exe名>.WebView2`。
fn configure_webview_data_dir() {
    if let Ok(dir) = data_dir() {
        let web = dir.join("webview");
        let _ = fs::create_dir_all(&web);
        // WebView2 官方支持的环境变量，必须在创建 webview 之前设置。
        std::env::set_var("WEBVIEW2_USER_DATA_FOLDER", &web);
    }
}

fn main() {
    configure_webview_data_dir();

    let result = tauri::Builder::default()
        // 不再注册 tauri_plugin_fs：前端没有任何文件系统 capability。
        .invoke_handler(tauri::generate_handler![
            load_state,
            save_state,
            reset_state,
            data_dir_path
        ])
        .run(tauri::generate_context!());

    if let Err(err) = result {
        #[cfg(windows)]
        {
            native::message(
                "Mah Le Mah",
                &format!(
                    "启动失败：{err}\n\n\
                     如果提示缺少 WebView2 运行时，请先安装 Microsoft Edge WebView2 Runtime\n\
                     （Windows 11 已内置；安装后无需重启）。"
                ),
            );
            native::open_download_page();
        }
        std::process::exit(1);
    }
}
