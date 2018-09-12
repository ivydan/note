const electron = require('electron');
const { app, Menu } = electron;

const menu = [
    {
        label: '文件',
        submenu: [{
            role: 'close',
            label: '关闭'
        }]
    },
    {
        label: '编辑',
        submenu: [
            {
                role: 'undo',
                label: '撤销'
            },
            {
                role: 'redo',
                label: '重做'
            },
            {
                type: 'separator'
            },
            {
                role: 'cut',
                label: '剪切'
            },
            {
                role: 'copy',
                label: '复制'
            },
            {
                role: 'paste',
                label: '粘贴'
            },
            {
                role: 'pasteandmatchstyle',
                label: '格式化粘贴'
            },
            {
                role: 'delete',
                label: '删除'
            },
            {
                role: 'selectall',
                label: '全选'
            }
        ]
    },
    {
        label: '查看',
        submenu: [
            {
                role: 'reload',
                label: '重载'
            },
            {
                role: 'forcereload',
                label: '忽略缓存并重载'
            },
            {
                // role: 'toggledevtools',
                label: '切换开发者工具',
                accelerator: (function () {
                    if (process.platform === 'darwin') {
                        return 'Alt+Command+I'
                    } else {
                        return 'Ctrl+Shift+I'
                    }
                })(),
                click: function (item, focusedWindow) {
                    if (focusedWindow) {
                        focusedWindow.toggleDevTools()
                    }
                }

            },
            {
                type: 'separator'
            },
            {
                role: 'resetzoom',
                label: '重置缩放级别'
            },
            {
                role: 'zoomin',
                label: '放大'
            },
            {
                role: 'zoomout',
                label: '缩小'
            },
            {
                type: 'separator'
            },
            {
                // role: 'togglefullscreen',
                label: '切换全屏',
                accelerator: (function () {
                    if (process.platform === 'darwin') {
                        return 'Ctrl+Command+F'
                    } else {
                        return 'F11'
                    }
                })(),
                click: function (item, focusedWindow) {
                    if (focusedWindow) {
                        focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
                    }
                }
            },
            {
                label: '应用程序菜单演示',
                click: function (item, focusedWindow) {
                    if (focusedWindow) {
                        const options = {
                            type: 'info',
                            title: '应用程序菜单演示',
                            buttons: ['好的'],
                            message: '此演示用于 "菜单" 部分, 展示如何在应用程序菜单中创建可点击的菜单项.'
                        }
                        electron.dialog.showMessageBox(focusedWindow, options, function () { })
                    }
                }
            }
        ]
    }, {
        label: '窗口',
        role: 'window',
        submenu: [{
            label: '最小化',
            accelerator: 'CmdOrCtrl+M',
            role: 'minimize'
            // }, {
            //     label: '关闭',
            //     accelerator: 'CmdOrCtrl+W',
            //     role: 'close'
        }, {
            label: '重新打开窗口',
            accelerator: 'CmdOrCtrl+Shift+T',
            enabled: false,
            key: 'reopenMenuItem',
            click: function () {
                app.emit('activate')
            }
        },
        {
            type: 'separator'
        },
        {
            label: '学习更多',
            click: function () {
                electron.shell.openExternal('http://electron.atom.io')
            }
        }]
    }
];

// const newMenu = new Menu(); //创建新的菜单

module.exports = menu;