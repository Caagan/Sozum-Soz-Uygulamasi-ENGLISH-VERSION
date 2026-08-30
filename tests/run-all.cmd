@echo off
rem SÖZÜM SÖZ test runner: runs every test file in sequence.
rem The only requirement is node on PATH. (jsdom is installed via npm.)
setlocal
cd /d "%~dp0"
node test-app.js
node test-offtopic.js
node test-ai-stamp.js
node test-kvkk-full.js