@echo off
rem 设置当前控制台为UTF-8编码
chcp 65001 >> nul

vsce package

rem 插件发布地址

cmd /c start "" "https://marketplace.visualstudio.com/manage/publishers/angcyo"
cmd /c start "" "https://open-vsx.org/user-settings/extensions"