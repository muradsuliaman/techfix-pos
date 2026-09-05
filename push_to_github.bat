@echo off
echo ===================================================
echo Pushing TechFix POS to GitHub: muradsuliaman/techfix-pos
echo ===================================================
set PATH=C:\Users\Murad\AppData\Local\Programs\Git\cmd;C:\Users\Murad\AppData\Local\Programs\Kimi\resources\resources\runtime;%PATH%
cd /d C:\Users\Murad\.gemini\antigravity\scratch\techfix-pos
git push -u origin main
echo.
echo ===================================================
echo Done! Your site is deploying online via GitHub Pages:
echo https://muradsuliaman.github.io/techfix-pos/
echo ===================================================
pause
