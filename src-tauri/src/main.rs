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
//! 产物：
//!   · Portable 绿色版 = `cargo build --release` 直接得到的 MahLeMah.exe
//!     （+ 运行时自建的 MahLeMah_Data，无需安装）；
//!   · NSIS 正式安装版 = `npm run build:nsis`（tauri bundle targets=["nsis"]，
//!     或 tools/make_release.py 用 64 位 makensis 编译 tools/make_installer.nsi），
//!     提供标准卸载入口（控制面板 / 开始菜单）与卸载确认流程。
//!   两种产物分别构建、分别命名，互不混淆。
//!
//! 最终生产版（2026-11-10）：前端已从 ../src 中整体移除背景音乐模块，
//! 只保留 Web Audio 音效。此处同步标注以触发重新编译，确保 exe 重新嵌入最新前端资源。

use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};

/// 与 exe 同级的数据目录名（对外承诺的唯一落点）
const DATA_DIR: &str = "MahLeMah_Data";

/// 存档大小上限：64 KB（每关只存最近 5 条元数据，远小于该上限；本轮不放宽）
const MAX_SAVE_BYTES: usize = 64 * 1024;

/// 存档 JSON 字段白名单：出现任何未知字段一律拒绝
/// p1 / p2 = 两关当前档位 id；level1RecentGames / level2RecentGames = 各关最近五局历史；
/// musicMap = 背景音乐映射（场景 → 文件名数组），本轮新增。
/// 旧存档（v1/v2/v3）缺这些字段时按缺省处理，不判非法。
const SAVE_FIELDS: [&str; 12] = [
    "v", "level", "best", "sound", "sfxVol", "music", "musicVol", "p1", "p2",
    "level1RecentGames", "level2RecentGames", "musicMap",
];

/// 单条历史记录的字段白名单（与 src/game/recent_games.js 的 RECORD_FIELDS 一一对应）
const RECORD_FIELDS: [&str; 12] = [
    "gameId", "level", "difficultyId", "seed", "totalTiles", "tileTypeCount",
    "layoutSignature", "geometrySignature", "distributionSignature",
    "generatedAt", "generationReason", "validationResult",
];
const GENERATION_REASONS: [&str; 4] = [
    "application_restart", "title_screen_restart", "failure_restart", "new_game",
];
/// 每关保留最近 3 局（本轮规格；与 src/game/recent_games.js 的 HISTORY_LIMIT 一致）
const HISTORY_LIMIT: usize = 3;

/* ---- 背景音乐（第 4.4 节）白名单与上限，与 src/game/music_store.js 逐条对应 ---- */
/// 固定 6 个场景，存档里的 musicMap 只允许这些 key
const MUSIC_SCENES: [&str; 6] = ["title", "level1", "level2", "win", "lose", "graduated"];
/// 扩展名白名单
const MUSIC_EXTS: [&str; 3] = ["mp3", "ogg", "wav"];
/// 单文件上限 20 MB
const MUSIC_MAX_BYTES: usize = 20 * 1024 * 1024;
/// 音乐总数上限 24 首
const MUSIC_MAX_FILES: usize = 24;
/// 文件名长度上限
const MUSIC_MAX_NAME: usize = 96;
/// musicMap 序列化后的整体大小上限 4 KB
const MUSIC_MAP_MAX_BYTES: usize = 4 * 1024;
/// Windows 保留设备名
const MUSIC_RESERVED: [&str; 22] = [
    "CON", "PRN", "AUX", "NUL",
    "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
    "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9",
];

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

/// 最近五局历史校验：
///  · 必须是数组、最多 5 条（防止存档无限制膨胀）；
///  · 每条记录的字段必须在白名单内，且 12 个字段全部存在（拒绝半写入记录）；
///  · 字符串长度、签名格式、整数范围、reason 枚举、校验结果严格检查；
///  · 损坏记录一律拒绝整份存档，绝不让非法布局数据进入游戏。
fn validate_history_field(
    obj: &serde_json::Map<String, serde_json::Value>,
    key: &str,
) -> Result<(), String> {
    let arr = match obj.get(key) {
        Some(v) => v.as_array().ok_or_else(|| format!("{key} 必须是数组"))?,
        None => return Ok(()), // 旧存档无历史字段：合法
    };
    if arr.len() > HISTORY_LIMIT {
        return Err(format!("{key} 最多 {HISTORY_LIMIT} 条，实际 {}", arr.len()));
    }
    for (i, rec) in arr.iter().enumerate() {
        let r = rec
            .as_object()
            .ok_or_else(|| format!("{key}[{i}] 必须是对象"))?;
        for k in r.keys() {
            if !RECORD_FIELDS.contains(&k.as_str()) {
                return Err(format!("{key}[{i}] 包含未知字段: {k}"));
            }
        }
        for f in RECORD_FIELDS {
            if !r.contains_key(f) {
                return Err(format!("{key}[{i}] 缺少字段 {f}（疑似半写入）"));
            }
        }
        let game_id = r["gameId"]
            .as_str()
            .ok_or_else(|| format!("{key}[{i}].gameId 必须是字符串"))?;
        if game_id.is_empty() || game_id.len() > 128 {
            return Err(format!("{key}[{i}].gameId 长度非法"));
        }
        for f in ["layoutSignature", "geometrySignature", "distributionSignature"] {
            let s = r[f]
                .as_str()
                .ok_or_else(|| format!("{key}[{i}].{f} 必须是字符串"))?;
            let hex = s.len() == 64
                && s.bytes().all(|b| b.is_ascii_digit() || (b'a' <= b && b <= b'f'));
            if !hex {
                return Err(format!("{key}[{i}].{f} 不是 64 位小写 SHA-256"));
            }
        }
        for (f, lo, hi) in [
            ("level", 1i64, 2i64),
            ("difficultyId", 0, 63),
            ("seed", 0, 4_294_967_295),
            ("totalTiles", 1, 10_000),
            ("tileTypeCount", 0, 16),
        ] {
            let n = r[f]
                .as_i64()
                .ok_or_else(|| format!("{key}[{i}].{f} 必须是整数"))?;
            if !(lo..=hi).contains(&n) {
                return Err(format!("{key}[{i}].{f} 超出范围 {lo}..{hi}: {n}"));
            }
        }
        let generated = r["generatedAt"]
            .as_str()
            .ok_or_else(|| format!("{key}[{i}].generatedAt 必须是字符串"))?;
        if generated.is_empty() || generated.len() > 64 {
            return Err(format!("{key}[{i}].generatedAt 长度非法"));
        }
        let reason = r["generationReason"]
            .as_str()
            .ok_or_else(|| format!("{key}[{i}].generationReason 必须是字符串"))?;
        if !GENERATION_REASONS.contains(&reason) {
            return Err(format!("{key}[{i}].generationReason 非法: {reason}"));
        }
        let result = r["validationResult"]
            .as_str()
            .ok_or_else(|| format!("{key}[{i}].validationResult 必须是字符串"))?;
        if result != "PASS" && result != "FAIL" {
            return Err(format!("{key}[{i}].validationResult 非法: {result}"));
        }
    }
    Ok(())
}

/// 音乐文件名净化（与 src/game/music_store.js 的 sanitizeMusicName 逐条对应）。
/// 只做「拒绝」，绝不悄悄改名。
fn sanitize_music_name(name: &str) -> Result<(), String> {
    if name.is_empty() {
        return Err("文件名为空".into());
    }
    if name.len() > MUSIC_MAX_NAME {
        return Err(format!("文件名过长（上限 {MUSIC_MAX_NAME}）"));
    }
    if name.contains('/') || name.contains('\\') {
        return Err("文件名不得包含路径分隔符".into());
    }
    if name.contains("..") {
        return Err("文件名不得包含 ..".into());
    }
    for ch in name.chars() {
        let c = ch as u32;
        if c < 0x20 || c == 0x7f {
            return Err("文件名包含控制字符".into());
        }
        if matches!(ch, '<' | '>' | ':' | '"' | '|' | '?' | '*') {
            return Err("文件名包含 Windows 非法字符".into());
        }
    }
    if name.starts_with('.') || name.ends_with('.') || name.starts_with(' ') {
        return Err("文件名首尾非法".into());
    }
    let dot = match name.rfind('.') {
        Some(i) if i > 0 && i < name.len() - 1 => i,
        _ => return Err("文件名缺少扩展名".into()),
    };
    let ext = name[dot + 1..].to_ascii_lowercase();
    if !MUSIC_EXTS.contains(&ext.as_str()) {
        return Err(format!("扩展名不在白名单（mp3/ogg/wav）: {ext}"));
    }
    let stem = name[..dot].to_ascii_uppercase();
    if MUSIC_RESERVED.contains(&stem.as_str()) {
        return Err(format!("文件名是 Windows 保留名: {stem}"));
    }
    Ok(())
}

/// musicMap 校验：只允许 6 个固定场景名，值是文件名数组，
/// 每个文件名走同一套净化规则，整体大小 ≤ 4 KB。
fn validate_music_map(obj: &serde_json::Map<String, serde_json::Value>) -> Result<(), String> {
    let val = match obj.get("musicMap") {
        Some(v) => v,
        None => return Ok(()), // 旧存档无 musicMap：合法
    };
    let map = val.as_object().ok_or_else(|| "musicMap 必须是对象".to_string())?;
    let raw = serde_json::to_string(val).map_err(|e| format!("musicMap 序列化失败: {e}"))?;
    if raw.len() > MUSIC_MAP_MAX_BYTES {
        return Err(format!("musicMap 过大：{} 字节 > {MUSIC_MAP_MAX_BYTES}", raw.len()));
    }
    for (scene, list) in map {
        if !MUSIC_SCENES.contains(&scene.as_str()) {
            return Err(format!("musicMap 包含非法场景名: {scene}"));
        }
        let arr = list
            .as_array()
            .ok_or_else(|| format!("musicMap.{scene} 必须是数组"))?;
        if arr.len() > MUSIC_MAX_FILES {
            return Err(format!("musicMap.{scene} 最多 {MUSIC_MAX_FILES} 首，实际 {}", arr.len()));
        }
        for (i, item) in arr.iter().enumerate() {
            let name = item
                .as_str()
                .ok_or_else(|| format!("musicMap.{scene}[{i}] 必须是字符串"))?;
            sanitize_music_name(name)
                .map_err(|e| format!("musicMap.{scene}[{i}] 非法: {e}"))?;
        }
    }
    Ok(())
}

/// 存档 JSON 严格校验：
///   1. 大小 ≤ 64 KB；
///   2. 必须是合法 JSON 对象；
///   3. 字段白名单（未知字段直接拒绝）；
///   4. 版本号 v ∈ {1, 2, 3}（v1/v2 = 旧档兼容，v3 = 含最近三局历史）；
///   5. 各字段类型 / 数值范围严格检查，任何异常数据一律拒绝；
///   6. 两关历史各自独立校验，最多 3 条、字段完整、签名格式合法。
fn validate_save_json(data: &str) -> Result<(), String> {
    if data.len() > MAX_SAVE_BYTES {
        return Err(format!("存档过大：{} 字节 > 上限 {MAX_SAVE_BYTES}", data.len()));
    }
    let value: serde_json::Value =
        serde_json::from_str(data).map_err(|e| format!("存档 JSON 非法: {e}"))?;
    let obj = value
        .as_object()
        .ok_or_else(|| "存档必须是 JSON 对象".to_string())?;

    for key in obj.keys() {
        if !SAVE_FIELDS.contains(&key.as_str()) {
            return Err(format!("存档包含未知字段: {key}"));
        }
    }

    // 版本号：必须是 1..=4 的整数（v4 = 含 music / musicVol / musicMap，旧档仍兼容）
    let v = match obj.get("v") {
        Some(serde_json::Value::Number(n)) => n.as_i64(),
        _ => None,
    }
    .ok_or_else(|| "存档缺少合法的版本号 v".to_string())?;
    if v != 1 && v != 2 && v != 3 && v != 4 {
        return Err(format!("不支持的存档版本: {v}"));
    }

    // level / best：非负整数（level 上限 999，best 上限 1_000_000）
    for (key, max) in [("level", 999i64), ("best", 1_000_000i64)] {
        if let Some(val) = obj.get(key) {
            let n = val.as_i64().ok_or_else(|| format!("{key} 必须是整数"))?;
            if n < 0 || n > max {
                return Err(format!("{key} 超出范围 0..{max}: {n}"));
            }
        }
    }

    // p1 / p2：档位 id，必须是 0..=63 的整数；缺失（旧存档）时跳过，不判非法
    for key in ["p1", "p2"] {
        if let Some(val) = obj.get(key) {
            let n = val.as_i64().ok_or_else(|| format!("{key} 必须是整数"))?;
            if !(0..=63).contains(&n) {
                return Err(format!("{key} 超出范围 0..63: {n}"));
            }
        }
    }

    // sound / music：布尔
    for key in ["sound", "music"] {
        if let Some(val) = obj.get(key) {
            if !val.is_boolean() {
                return Err(format!("{key} 必须是布尔值"));
            }
        }
    }

    // sfxVol / musicVol：0.0..=1.0 的有限数
    for key in ["sfxVol", "musicVol"] {
        if let Some(val) = obj.get(key) {
            let f = val.as_f64().filter(|f| f.is_finite());
            match f {
                Some(f) if (0.0..=1.0).contains(&f) => {}
                _ => return Err(format!("{key} 必须是 0..1 的数值")),
            }
        }
    }

    // 两关历史：独立校验，损坏 / 半写入 / 超量一律拒绝
    validate_history_field(obj, "level1RecentGames")?;
    validate_history_field(obj, "level2RecentGames")?;
    // 背景音乐映射（本轮新增；旧存档没有该字段时跳过）
    validate_music_map(obj)?;
    Ok(())
}

/// 前端用它做「数据目录」展示（只读；v2 起前端不再据此做任何文件操作）
#[tauri::command]
fn data_dir_path() -> Result<String, String> {
    Ok(data_dir()?.to_string_lossy().to_string())
}

/// 读取存档；文件不存在 / 为空 / 损坏（校验不过）时返回空串（前端按"无存档"处理）
#[tauri::command]
fn load_state() -> Result<String, String> {
    let path = data_dir()?.join("save.json");
    match fs::read_to_string(&path) {
        Ok(s) if !s.trim().is_empty() => {
            if validate_save_json(&s).is_ok() {
                Ok(s)
            } else {
                // 损坏 / 异常存档：视作无存档，不让脏数据进游戏
                Ok(String::new())
            }
        }
        Ok(_) => Ok(String::new()),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(String::new()),
        Err(e) => Err(format!("读取存档失败: {e}")),
    }
}

/// 保存存档：严格校验 + 原子写入。
/// 路径固定为 <exe 同级>/MahLeMah_Data/save.json —— 前端不能指定任何保存路径。
#[tauri::command]
fn save_state(data: String) -> Result<(), String> {
    validate_save_json(&data)?;
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
/* 背景音乐（第 4.4 节）：4 个白名单命令，只动 <exe>/MahLeMah_Data/music */
/* ------------------------------------------------------------------ */

/// `<exe 同级>/MahLeMah_Data/music`，不存在时自动创建。
fn music_dir() -> Result<PathBuf, String> {
    let dir = data_dir()?.join("music");
    fs::create_dir_all(&dir).map_err(|e| format!("无法创建音乐目录: {e}"))?;
    Ok(dir)
}

fn music_path(name: &str) -> Result<PathBuf, String> {
    sanitize_music_name(name)?;
    Ok(music_dir()?.join(name))
}

/// 标准 base64（含 `=` 填充）解码；非法输入拒绝。
fn base64_decode(s: &str) -> Result<Vec<u8>, String> {
    fn val(c: u8) -> Option<u8> {
        match c {
            b'A'..=b'Z' => Some(c - b'A'),
            b'a'..=b'z' => Some(c - b'a' + 26),
            b'0'..=b'9' => Some(c - b'0' + 52),
            b'+' => Some(62),
            b'/' => Some(63),
            _ => None,
        }
    }
    let bytes: Vec<u8> = s.bytes().filter(|b| !b" \t\r\n".contains(b)).collect();
    if bytes.is_empty() {
        return Err("base64 为空".into());
    }
    if bytes.len() % 4 != 0 {
        return Err("base64 长度不是 4 的倍数".into());
    }
    let mut out = Vec::with_capacity(bytes.len() / 4 * 3);
    for chunk in bytes.chunks(4) {
        let pad = chunk.iter().filter(|b| **b == b'=').count();
        if pad > 2 {
            return Err("base64 填充非法".into());
        }
        let mut acc: u32 = 0;
        for i in 0..4 {
            let c = chunk[i];
            let v = if c == b'=' { 0 } else { val(c).ok_or("base64 含非法字符")? as u32 };
            acc = (acc << 6) | v;
        }
        out.push((acc >> 16) as u8);
        if pad < 2 {
            out.push((acc >> 8) as u8);
        }
        if pad < 1 {
            out.push(acc as u8);
        }
    }
    Ok(out)
}

/// 标准 base64 编码（供 read_music 回传给前端做 dataURL）
fn base64_encode(data: &[u8]) -> String {
    const TBL: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = String::with_capacity((data.len() + 2) / 3 * 4);
    for chunk in data.chunks(3) {
        let b0 = chunk[0] as u32;
        let b1 = *chunk.get(1).unwrap_or(&0) as u32;
        let b2 = *chunk.get(2).unwrap_or(&0) as u32;
        let acc = (b0 << 16) | (b1 << 8) | b2;
        out.push(TBL[(acc >> 18) as usize & 63] as char);
        out.push(TBL[(acc >> 12) as usize & 63] as char);
        if chunk.len() > 1 {
            out.push(TBL[(acc >> 6) as usize & 63] as char);
        } else {
            out.push('=');
        }
        if chunk.len() > 2 {
            out.push(TBL[acc as usize & 63] as char);
        } else {
            out.push('=');
        }
    }
    out
}

/// 列出已导入的音乐文件名（只列合法扩展名，按名字排序）
#[tauri::command]
fn list_music() -> Result<Vec<String>, String> {
    let dir = music_dir()?;
    let mut out = Vec::new();
    let rd = fs::read_dir(&dir).map_err(|e| format!("读取音乐目录失败: {e}"))?;
    for entry in rd.flatten() {
        let name = match entry.file_name().into_string() {
            Ok(n) => n,
            Err(_) => continue, // 非 UTF-8 文件名一律忽略
        };
        if name.ends_with(".tmp") {
            continue; // 半写入的临时文件不暴露给前端
        }
        if sanitize_music_name(&name).is_ok() {
            out.push(name);
        }
    }
    out.sort();
    Ok(out)
}

/// 导入一首：base64 → 字节 → 先写 .tmp 再原子重命名。
/// 拒绝：非法文件名 / 非法扩展名 / 超 20MB / 超过 24 首（覆盖同名不算新增）。
#[tauri::command]
fn import_music(name: String, base64: String) -> Result<(), String> {
    let dir = music_dir()?;
    sanitize_music_name(&name)?;
    let bytes = base64_decode(&base64)?;
    if bytes.is_empty() {
        return Err("文件内容为空".into());
    }
    if bytes.len() > MUSIC_MAX_BYTES {
        return Err(format!("文件过大：{} 字节 > {MUSIC_MAX_BYTES}", bytes.len()));
    }
    let target = dir.join(&name);
    if !target.exists() {
        let mut count = 0usize;
        if let Ok(rd) = fs::read_dir(&dir) {
            for entry in rd.flatten() {
                if let Ok(n) = entry.file_name().into_string() {
                    if !n.ends_with(".tmp") && sanitize_music_name(&n).is_ok() {
                        count += 1;
                    }
                }
            }
        }
        if count >= MUSIC_MAX_FILES {
            return Err(format!("音乐数量已达上限 {MUSIC_MAX_FILES} 首"));
        }
    }
    let tmp = dir.join(format!("{name}.tmp"));
    {
        let mut f = fs::File::create(&tmp).map_err(|e| format!("创建临时文件失败: {e}"))?;
        f.write_all(&bytes).map_err(|e| format!("写入失败: {e}"))?;
        let _ = f.sync_all();
    }
    fs::rename(&tmp, &target).map_err(|e| format!("保存失败: {e}"))?;
    Ok(())
}

/// 读取一首，返回 base64（前端拼成 dataURL 给 <audio>）
#[tauri::command]
fn read_music(name: String) -> Result<String, String> {
    let path = music_path(&name)?;
    let bytes = fs::read(&path).map_err(|e| format!("读取失败: {e}"))?;
    if bytes.len() > MUSIC_MAX_BYTES {
        return Err(format!("文件过大：{} 字节", bytes.len()));
    }
    Ok(base64_encode(&bytes))
}

/// 删除一首（只允许删 music 目录下的合法文件名，绝不接受路径）
#[tauri::command]
fn delete_music(name: String) -> Result<(), String> {
    let path = music_path(&name)?;
    if path.exists() {
        fs::remove_file(&path).map_err(|e| format!("删除失败: {e}"))?;
    }
    Ok(())
}

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
            data_dir_path,
            list_music,
            import_music,
            read_music,
            delete_music
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
