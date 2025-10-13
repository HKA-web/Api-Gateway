@echo off
setlocal ENABLEDELAYEDEXPANSION

:: ==========================================================
:: Portable Node.js + Yarn Environment Bootstrap
:: ==========================================================

:: Root folder (folder di mana script ini berada)
set "ROOT=%~dp0"

:: Path ke portable Node.js
set "NODEJS_PORTABLE=%ROOT%bin\nodejs"

:: Path ke npm/yarn/corepack
set "NODE_GLOBALS=%NODEJS_PORTABLE%\node_modules\npm\bin"
set "COREPACK_BIN=%NODEJS_PORTABLE%\node_modules\corepack\dist"
set "YARN_BIN=%NODEJS_PORTABLE%\node_modules\yarn\bin"

:: Tambahkan PATH sementara
set "PATH=%NODEJS_PORTABLE%;%NODE_GLOBALS%;%COREPACK_BIN%;%YARN_BIN%;%PATH%"

echo ===============================================
echo   Portable Node.js + Yarn Environment
echo -----------------------------------------------
echo   Node exe path: "%NODEJS_PORTABLE%\node.exe"
echo -----------------------------------------------

:: Cek apakah node bisa dijalankan
"%NODEJS_PORTABLE%\node.exe" -v >nul 2>&1
if errorlevel 1 (
  echo [ERROR] node.exe tidak bisa dijalankan dari "%NODEJS_PORTABLE%"
  echo Pastikan file node.exe ada di folder tsb.
  echo.
  pause
  endlocal
  exit /b 1
)

:: Tampilkan versi Node
for /f "delims=" %%v in ('"%NODEJS_PORTABLE%\node.exe" -v 2^>nul') do set "NODE_VERSION=%%v"
echo   Node Version : %NODE_VERSION%

:: Coba cek npm dan yarn
for /f "delims=" %%v in ('npm -v 2^>nul') do set "NPM_VERSION=%%v"
if defined NPM_VERSION (
    echo   NPM  Version : %NPM_VERSION%
) else (
    echo   [WARN] npm tidak terdeteksi di PATH.
)

for /f "delims=" %%v in ('yarn -v 2^>nul') do set "YARN_VERSION=%%v"
if defined YARN_VERSION (
    echo   Yarn Version : %YARN_VERSION%
) else (
    echo   [WARN] yarn tidak terdeteksi di PATH.
)
echo ===============================================
echo.

:: ==========================================================
:: Argument parser (untuk eksekusi langsung tanpa menu)
:: ==========================================================
set "choice="
if /i "%~1"=="1" set "choice=1"
if /i "%~1"=="2" set "choice=2"
if /i "%~1"=="3" set "choice=3"

if defined choice (
    echo [INFO] Argumen mendeteksi pilihan: %choice%
    goto DO_CHOICE_DIRECT
)

:: ==========================================================
:: Menu interaktif
:: ==========================================================
:MENU
echo Pilih tindakan:
echo   1. Buka interactive shell (cmd)
echo   2. Jalankan "yarn start"
echo   3. Keluar
set /P choice=Choice [1-3]: 

:DO_CHOICE
if "%choice%"=="1" goto INTERACTIVE
if "%choice%"=="2" goto YARN_START
if "%choice%"=="3" goto END
echo Pilihan tidak valid.
echo.
goto MENU

:: ==========================================================
:: Eksekusi langsung (argumen)
:: ==========================================================
:DO_CHOICE_DIRECT
if "%choice%"=="1" goto INTERACTIVE
if "%choice%"=="2" goto YARN_START
if "%choice%"=="3" goto END
goto END

:: ==========================================================
:: MODE 1 - Interactive CMD Shell
:: ==========================================================
:INTERACTIVE
echo Membuka interactive shell dengan Node.js portable environment.
echo.
cmd /k "cd /d %ROOT% && title Portable Node.js Shell && echo [Node Portable] Environment aktif. && echo."
goto END

:: ==========================================================
:: MODE 2 - Jalankan yarn start
:: ==========================================================
:YARN_START
echo Menjalankan "yarn start" (foreground)...
cd /d "%ROOT%"
call yarn start
echo.
echo [INFO] "yarn start" keluar dengan code %ERRORLEVEL%
if not defined choice (
    echo Tekan tombol apapun untuk kembali ke menu...
    pause >nul
    goto MENU
)
goto END

:: ==========================================================
:: Selesai
:: ==========================================================
:END
endlocal
exit /b 0
