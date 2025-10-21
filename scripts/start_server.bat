@echo off
echo 로컬 서버를 시작합니다...
echo 브라우저에서 http://localhost:8000 으로 접속하세요
echo.
echo 서버를 중지하려면 Ctrl+C를 누르세요
echo.
python -m http.server 8000
