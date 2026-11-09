@echo off
rem Portable launcher: opens the single-file game in a chromeless Edge/Chrome window.
setlocal
set "HERE=%~dp0"
set "HTML=%HERE%MahLeMah.html"
if not exist "%HTML%" set "HTML=%HERE%index.html"
if not exist "%HTML%" (
  echo [x] MahLeMah.html not found next to this script.
  pause
  exit /b 1
)
set "BROWSER="
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "BROWSER=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER (
  start "" "%HTML%"
  exit /b 0
)
start "" "%BROWSER%" --app="file:///%HTML:\=/%" --window-size=760,1320
exit /b 0
