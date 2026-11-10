; =========================================================================
; Mah了个Mah —— Windows 正式安装版（NSIS）
;
; 交付策略（与 Portable 绿色版严格分开）：
;   · 本脚本产物 = NSIS 安装程序 MahLeMah-Setup-vX.Y.Z.exe；
;   · 安装到 %LOCALAPPDATA%\Programs\MahLeMah（当前用户，免管理员）；
;   · 写入标准卸载入口：控制面板 / 设置 → 应用 →「Mah了个Mah」→ 卸载；
;   · 卸载有确认流程：卸载前询问、删除存档再询问（默认保留存档）；
;   · 用户数据保留策略：存档位于 <安装目录>\MahLeMah_Data\，
;     卸载默认保留，只有用户在卸载时明确选择删除才会清除。
;
; 编译（需要 64 位 makensis，见 tools/build_nsis.mjs）：
;   makensis /DVERSION=2.0.0 /DBUILD_DIR=..\dist\MahLeMah-Portable-v2.0.0 ^
;            /DOUTFILE=..\dist\MahLeMah-Setup-v2.0.0.exe make_installer.nsi
; =========================================================================

!ifndef VERSION
  !define VERSION "2.0.0"
!endif
!ifndef BUILD_DIR
  !define BUILD_DIR "..\dist\MahLeMah-Portable-v${VERSION}"
!endif
!ifndef OUTFILE
  !define OUTFILE "..\dist\MahLeMah-Setup-v${VERSION}.exe"
!endif

!define PRODUCT_NAME "Mah了个Mah"
!define PRODUCT_PUBLISHER "MahLeMah"
!define PRODUCT_EXE "MahLeMah.exe"
!define REG_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\MahLeMah"

; 64 位原生安装包（本机禁跑 32 位 PE；amd64 在 x64 Windows 上通用）
Target "amd64-unicode"
Unicode true
SetCompressor /SOLID lzma
RequestExecutionLevel user

Name "${PRODUCT_NAME} ${VERSION}"
OutFile "${OUTFILE}"
InstallDir "$LOCALAPPDATA\Programs\MahLeMah"
InstallDirRegKey HKCU "${REG_KEY}" "InstallLocation"
BrandingText "${PRODUCT_NAME} v${VERSION}"

!include "MUI2.nsh"
!include "LogicLib.nsh"
!include "FileFunc.nsh"

!define MUI_ABORTWARNING
!define MUI_ICON "${NSISDIR}\Contrib\Graphics\Icons\modern-install.ico"
!define MUI_UNICON "${NSISDIR}\Contrib\Graphics\Icons\modern-uninstall.ico"
!define MUI_FINISHPAGE_TEXT "安装完成。$\n$\n游戏存档与缓存保存在安装目录的 MahLeMah_Data 文件夹。$\n首次运行如提示缺少 Microsoft Edge WebView2 Runtime，请按游戏内提示安装。$\n$\n卸载：开始菜单 →「卸载 Mah了个Mah」，或 Windows 设置 → 应用。"

!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "SimpChinese"
!insertmacro MUI_LANGUAGE "English"

Section "Install"
  SetOutPath "$INSTDIR"

  ; 主程序 + WebView2 加载器（两种产物的文件清单一致，但分发形态不同）
  File "${BUILD_DIR}\${PRODUCT_EXE}"
  File "${BUILD_DIR}\WebView2Loader.dll"

  ; 卸载程序（标准卸载入口的核心）
  WriteUninstaller "$INSTDIR\Uninstall.exe"

  ; 标准卸载注册表项（控制面板 / 设置 → 应用 可见）
  WriteRegStr HKCU "${REG_KEY}" "DisplayName" "${PRODUCT_NAME}"
  WriteRegStr HKCU "${REG_KEY}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKCU "${REG_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
  WriteRegStr HKCU "${REG_KEY}" "DisplayIcon" "$INSTDIR\${PRODUCT_EXE}"
  WriteRegStr HKCU "${REG_KEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "${REG_KEY}" "UninstallString" '"$INSTDIR\Uninstall.exe"'
  WriteRegStr HKCU "${REG_KEY}" "QuietUninstallString" '"$INSTDIR\Uninstall.exe" /S'
  WriteRegDWORD HKCU "${REG_KEY}" "NoModify" 1
  WriteRegDWORD HKCU "${REG_KEY}" "NoRepair" 1
  ; 估算体积（KB）
  ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
  IntFmt $0 "0x%08X" $0
  WriteRegDWORD HKCU "${REG_KEY}" "EstimatedSize" "$0"

  ; 开始菜单：游戏 + 卸载入口
  CreateDirectory "$SMPROGRAMS\MahLeMah"
  CreateShortCut "$SMPROGRAMS\MahLeMah\${PRODUCT_NAME}.lnk" "$INSTDIR\${PRODUCT_EXE}"
  CreateShortCut "$SMPROGRAMS\MahLeMah\卸载 ${PRODUCT_NAME}.lnk" "$INSTDIR\Uninstall.exe"
SectionEnd

Section "Uninstall"
  ; ── 卸载确认流程（MUI_UNPAGE_CONFIRM 已有一次确认；这里再明确数据策略） ──
  ; 末尾 /SD IDNO：静默卸载（/S）时默认保留存档
  MessageBox MB_YESNO|MB_ICONQUESTION|MB_DEFBUTTON2 \
    "是否同时删除游戏存档？$\n$\n存档位置：$INSTDIR\MahLeMah_Data$\n选「否」保留存档（以后重装可继续进度）。" \
    /SD IDNO IDYES del_data IDNO keep_data

  del_data:
    RMDir /r "$INSTDIR\MahLeMah_Data"
    Goto after_data
  keep_data:
    DetailPrint "已保留存档目录 MahLeMah_Data"
  after_data:

  ; 删除程序文件与快捷方式（不动保留下来的 MahLeMah_Data）
  Delete "$INSTDIR\${PRODUCT_EXE}"
  Delete "$INSTDIR\WebView2Loader.dll"
  Delete "$INSTDIR\Uninstall.exe"
  Delete "$SMPROGRAMS\MahLeMah\${PRODUCT_NAME}.lnk"
  Delete "$SMPROGRAMS\MahLeMah\卸载 ${PRODUCT_NAME}.lnk"
  RMDir "$SMPROGRAMS\MahLeMah"
  RMDir "$INSTDIR"

  ; 清理卸载注册表项
  DeleteRegKey HKCU "${REG_KEY}"
SectionEnd
