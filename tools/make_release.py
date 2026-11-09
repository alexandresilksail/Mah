"""
Package the green / portable release.

This project deliberately ships **no installer**: no MSI, no NSIS, no setup.exe,
and nothing is ever written to the Windows registry. The deliverable is a single
self-contained MahLeMah.exe produced by Tauri (`bundle.targets = ["app"]`).

dist/MahLeMah-1.0.0-portable.zip
    MahLeMah.exe     double-click to run; writes only <exe dir>/MahLeMah_Data
    README.txt       usage + one-click uninstall notes

If the exe has not been built yet, the script falls back to zipping the
single-file web build (dist/MahLeMah.html) so something is always publishable.

Usage:  python tools/make_release.py
"""

import os
import sys
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
VERSION = "1.0.0"
ZIP_NAME = f"MahLeMah-{VERSION}-portable.zip"
EXE_CANDIDATES = [
    os.path.join(ROOT, "src-tauri", "target", "release", "MahLeMah.exe"),
    os.path.join(
        ROOT, "src-tauri", "target", "x86_64-pc-windows-gnu", "release", "MahLeMah.exe"
    ),
]
EXE = next((p for p in EXE_CANDIDATES if os.path.isfile(p)), EXE_CANDIDATES[0])
WEB = os.path.join(DIST, "MahLeMah.html")

README_TXT = """Mah了个Mah —— 堆叠卡牌三消（绿色单文件版）
================================================

【运行】
  双击 MahLeMah.exe 即可，没有安装向导、不写注册表、不需要管理员权限。
  Windows 11 自带 WebView2 运行时；Windows 10 若缺失，程序会提示并打开
  微软官方下载页。

【数据位置】
  首次启动时，在 exe 同级目录创建 MahLeMah_Data 文件夹：
    MahLeMah_Data\\save.json   存档
    MahLeMah_Data\\webview\\    WebView2 缓存
  不写 %APPDATA%、不写 %LOCALAPPDATA%、不写注册表。
  想换机器玩，把 exe 和 MahLeMah_Data 一起拷走即可。

【卸载】
  方式一（推荐）：进入游戏 → 标题页或暂停面板 → 「卸载并删除数据」→
                  二次确认「确定要彻底删除本游戏及所有存档吗？」→
                  程序会删除 MahLeMah_Data、退出，并在退出后删除 exe 自身。
  方式二：直接删除 MahLeMah.exe 和 MahLeMah_Data 文件夹，系统里不留任何痕迹。

【玩法】
  点击没有被压住的牌 → 进入底部 7 格槽位 → 三张相同延迟 200ms 自动消除。
  同花色牌自动插到最右侧那张同花色之后；槽位放满且无法消除即失败；
  清空牌桌即通关。遮挡按几何相交面积判定（超过 10% 即被压住），
  被压牌不可点并整体压暗。

  两关共用 54 x 72（严格 3:4）牌面，不按关卡 / 层数 / 数量放大缩小。

  第 1 关：18 张 / 2 层 / 6 种花色各 3 张，教学关，正常玩必过（10 秒）。
  第 2 关：222 张 / 7 层 / 15 种花色。主堆 150 张由 3~5 个簇组成
           （T 字形 / 回字形 / 锥子形随机选，层间半格偏移 + 小抖动），
           左右侧堆各 36 张，每条竖向队列只有队首可点。
           花色按「剥离顺序」反向生成：前 15 组是开局就能连消的诱饵，
           后 57 张是陷阱区，同花色三张被拉远，制造「差一张」的死局。
           每局都存在完整通关路径（20 个种子回放 20/20）。
           200 局模拟：随机机器人 0% 通关，贪心机器人平均消除进度 68.7%。

  道具（第 2 关各 3 次）：洗牌 / 撤销 / 移出 3 张。
  复活（每局 1 次）：清空槽位，不赠送额外道具。

【运行环境】
  Windows 10 1809+ / Windows 11（x64）。完全离线，无外部图片、字体、
  音频文件与服务器依赖。
"""


FALLBACK_TXT = """【注意：本包为单文件网页版】
  当前压缩包里没有 MahLeMah.exe（本机没有 MSVC 生成工具，且安全策略会拦截
  Rust 构建脚本的执行，无法在本机产出原生 exe）。
  请双击 MahLeMah.html，用浏览器（Edge / Chrome / Firefox）打开即可游玩，
  存档保存在该浏览器的 localStorage 中。
  需要 Windows 原生绿色 exe 时，在装有 Visual Studio 2022 C++ 生成工具的
  机器上执行：npm install && npm run build，产物为
  src-tauri\\target\\release\\MahLeMah.exe（单文件、无需安装）。
  再执行 python tools/make_release.py 即可重新生成本压缩包。

================================================

"""


def main() -> int:
    os.makedirs(DIST, exist_ok=True)
    out = os.path.join(DIST, ZIP_NAME)
    if os.path.exists(out):
        os.remove(out)

    files = []
    readme = README_TXT
    if os.path.isfile(EXE):
        files.append((EXE, "MahLeMah.exe"))
        print(f"[ok] exe: {os.path.getsize(EXE) / 1024 / 1024:.2f} MB")
    else:
        print("[!] MahLeMah.exe not built yet - run: npm run build")
        if os.path.isfile(WEB):
            files.append((WEB, "MahLeMah.html"))
            readme = FALLBACK_TXT + README_TXT
            print("[!] falling back to the single-file web build")

    if not files:
        print("[x] nothing to package")
        return 1

    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for src, arc in files:
            zf.write(src, arc)
        zf.writestr("README.txt", readme.replace("\n", "\r\n"))

    size = os.path.getsize(out)
    print(f"[ok] {out}  ({size / 1024:.1f} KB, {len(files) + 1} 个文件)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
