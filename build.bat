@echo off
rem 设置当前控制台为UTF-8编码
chcp 65001 >> nul

vsce package

rem 插件发布地址

rem https://marketplace.visualstudio.com/manage/publishers/angcyo
rem https://open-vsx.org/user-settings/extensions