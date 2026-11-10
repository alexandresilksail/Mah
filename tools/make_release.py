"""
MahLeMah —— 发布收口器（校验 + 交付清单 + SHA256）。

交付策略（两种产物分别构建、分别命名、互不混淆）：
  A. Portable 绿色便携版  = npm run build:portable
       dist/MahLeMah-Portable-vX.Y.Z.zip   （exe + WebView2Loader.dll + 说明，免安装）
  B. Windows 正式安装版   = npm run build:nsis
       dist/MahLeMah-Setup-vX.Y.Z.exe      （NSIS：标准卸载入口 + 卸载确认流程）

本脚本不构建、不打包、不生成任何安装器 —— 只做：
  1. 校验上述产物是否实际存在（缺什么就如实报什么，绝不谎报已交付）；
  2. 为 dist/ 下全部交付物生成 SHA256SUMS.txt；
  3. 打印交付清单（含用户数据保留策略摘要）。

用法：python tools/make_release.py
"""
import hashlib
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")

with open(os.path.join(ROOT, "src-tauri", "tauri.conf.json"), "r", encoding="utf-8") as f:
    VERSION = json.load(f)["version"]

# 交付物清单：(文件名, 类别, 说明)
DELIVERABLES = [
    (f"MahLeMah-Portable-v{VERSION}.zip", "A·便携版", "绿色免安装：解压双击 MahLeMah.exe；卸载=删目录（存档 MahLeMah_Data 可先备份）"),
    (f"MahLeMah-Setup-v{VERSION}.exe", "B·安装版", "NSIS 安装程序：标准卸载入口（设置→应用）+ 卸载确认 + 存档默认保留"),
    ("MahLeMah.html", "网页版", "单文件现代浏览器版（离线可玩）"),
    ("MahLeMah-legacy.html", "网页版", "IE8/老浏览器兼容版"),
    ("MahLeMah.html".replace("MahLeMah", "Mah了个Mah"), "网页版", "同 MahLeMah.html（中文名副本）"),
    ("RELEASE_NOTES.md", "文档", "更新日志（仓库根目录，随发布同步）"),
]


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def main():
    print(f"=== MahLeMah v{VERSION} 发布收口 ===\n")
    os.makedirs(DIST, exist_ok=True)

    present, missing = [], []
    for name, kind, desc in DELIVERABLES:
        # 文档类交付物在仓库根目录（如 RELEASE_NOTES.md），其余都在 dist/
        base = ROOT if kind == "文档" else DIST
        p = os.path.join(base, name)
        if os.path.isfile(p) and os.path.getsize(p) > 0:
            present.append((name, kind, desc, p))
        else:
            missing.append((name, kind, desc))

    print("【已生成的交付物】")
    for name, kind, desc, p in present:
        size = os.path.getsize(p)
        print(f"  ✓ [{kind}] {name}  ({size / 1024 / 1024:.2f} MB)")
        print(f"      {desc}")

    if missing:
        print("\n【未生成 / 缺失 —— 不得声称已交付】")
        for name, kind, desc in missing:
            print(f"  ✗ [{kind}] {name}")
            print(f"      {desc}")
        print("\n  补齐方式：")
        if any(n.startswith("MahLeMah-Portable") for n, _, _ in missing):
            print("    npm run build:portable   # 需 rustup GNU 工具链 + MinGW-w64（或 MSVC）")
        if any(n.startswith("MahLeMah-Setup") for n, _, _ in missing):
            print("    npm run build:nsis       # 需 64 位 makensis（脚本会自动下载 negrutiu/nsis）")

    # SHA256SUMS：对 dist/ 下全部文件（排除旧清单本身）
    sums_path = os.path.join(DIST, "SHA256SUMS.txt")
    lines = []
    for entry in sorted(os.listdir(DIST)):
        p = os.path.join(DIST, entry)
        if os.path.isfile(p) and entry != "SHA256SUMS.txt":
            lines.append(f"{sha256(p)}  {entry}")
    with open(sums_path, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines) + "\n")
    print(f"\n【校验和】{sums_path}（{len(lines)} 项）")

    print("\n【用户数据保留策略】")
    print("  · 存档 / WebView2 缓存 = <程序目录>\\MahLeMah_Data\\（两种产物一致）")
    print("  · 安装版卸载：默认保留存档，卸载时二次询问是否删除（MB_DEFBUTTON2=保留）")
    print("  · 便携版卸载：删除整个解压目录；要留档先备份 MahLeMah_Data")
    print("  · 游戏内不提供任何文件删除能力（能力面仅 core:default + 4 个白名单 IPC）")

    hard_missing = [m for m in missing if m[0].startswith("MahLeMah-Portable") or m[0].startswith("MahLeMah-Setup")]
    if hard_missing:
        print(f"\n结果：{len(hard_missing)} 个 Windows 产物缺失，未完成交付（如实上报）。")
        return 2
    print("\n结果：Portable 与 NSIS 安装包均已实际生成，交付清单完整。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
