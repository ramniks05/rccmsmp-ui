@echo off
echo Creating new branch and committing all changes...
echo.

REM Check if git is initialized
git status >nul 2>&1
if errorlevel 1 (
    echo Error: Git repository not found. Please initialize git first.
    pause
    exit /b 1
)

REM Get current branch name
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
echo Current branch: %CURRENT_BRANCH%

REM Create new branch name with timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set BRANCH_NAME=feature/citizen-home-%datetime:~0,8%-%datetime:~8,6%
set BRANCH_NAME=%BRANCH_NAME: =%

REM Create and checkout new branch
echo.
echo Creating new branch: %BRANCH_NAME%
git checkout -b %BRANCH_NAME%

REM Add all changes
echo.
echo Adding all changes...
git add .

REM Show status
echo.
echo Changes to be committed:
git status --short

REM Commit changes
echo.
echo Committing changes...
git commit -m "feat: Add citizen home page and authentication flow

- Created CitizenModule with routing for /citizen/home
- Implemented CitizenHomeComponent with welcome page
- Added quick actions (My Cases, New Case, Case History, My Profile)
- Integrated mobile OTP verification during registration
- Updated login component to redirect citizens to /citizen/home
- Added refresh token API integration
- Updated registration to use registration-specific OTP endpoint
- Added authentication check and user data display
- Implemented responsive design for citizen home page"

echo.
echo Commit completed successfully!
echo.
echo Branch: %BRANCH_NAME%
echo.
echo To push to remote:
echo   git push -u origin %BRANCH_NAME%
echo.
pause

