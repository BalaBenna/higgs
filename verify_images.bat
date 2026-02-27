@echo off
REM Quick verification script for image retrieval from Supabase
REM Run this from the root directory: verify_images.bat

echo.
echo ========================================
echo Supabase Image Retrieval Verification
echo ========================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    exit /b 1
)

REM Run the verification script
python verify_supabase_images.py

echo.
echo ========================================
echo Verification Complete
echo ========================================
echo.

pause
