@echo off
echo Accepting all changes from dev-harsh branch...
echo.

git checkout --theirs .
git add .
git commit -m "Merge dev-harsh: Accept all changes from dev-harsh branch"

echo.
echo Merge completed! All conflicts resolved by accepting dev-harsh changes.
echo You can now push with: git push origin main
pause
