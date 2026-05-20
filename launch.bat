@echo off
pushd "%~dp0"
start "" "http://localhost:3000"
python server.py
popd
