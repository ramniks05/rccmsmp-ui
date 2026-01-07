@echo off
echo Initializing Git repository...
git init

echo Adding remote repository...
git remote add origin https://github.com/ramniks05/rccmsmp-ui.git

echo Adding all files...
git add .

echo Making first commit...
git commit -m "Initial commit: Angular 16+ project setup with Material UI"

echo Pushing to remote repository...
git branch -M main
git push -u origin main

echo Done!
pause

