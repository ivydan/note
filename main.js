// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, MenuItem, Tray, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const template = require('./sys/appMenu');
const contextMenu = require('./sys/contextMenu');

const { ioAddFolder, ioChangeTitle, ioChangeContent } = require('./sysFile/io');

//托盘对象
var appTray = null;


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 1200, height: 650 })

  // and load the index.html of the app.
  // mainWindow.loadFile('http://localhost:8080/index.html')
  mainWindow.loadURL('http://localhost:8080/index.html')

  // 打开开发工具
  mainWindow.openDevTools();

  //创建菜单
  const appMenu = Menu.buildFromTemplate(template)
  // 设置程序菜单
  Menu.setApplicationMenu(appMenu);

  //系统托盘右键菜单
  var trayMenuTemplate = [
    {
      label: '退出',
      click: function () {
        //ipc.send('close-main-window');
        app.quit();
      }
    }
  ];

  //系统托盘图标目录
  trayIcon = path.join(__dirname, 'sys');
  appTray = new Tray(path.join(trayIcon, 'favicon.ico'));
  //图标的上下文菜单
  const trayContextMenu = Menu.buildFromTemplate(trayMenuTemplate);
  //设置此托盘图标的悬停提示内容
  appTray.setToolTip('note');
  //设置此图标的上下文菜单
  appTray.setContextMenu(trayContextMenu);

  mainWindow.webContents.on('did-finish-load', function () {
    const leftList = JSON.parse(fs.readFileSync( './sysFile/menuList.json' ));
    const rightData = JSON.parse(fs.readFileSync( './sysFile/fileList.json' ));
    mainWindow.webContents.send('event-left-list', leftList, rightData);
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

function findReopenMenuItem() {
  const menu = Menu.getApplicationMenu()
  if (!menu) return

  let reopenMenuItem
  menu.items.forEach(function (item) {
    if (item.submenu) {
      item.submenu.items.forEach(function (item) {
        if (item.key === 'reopenMenuItem') {
          reopenMenuItem = item
        }
      })
    }
  })
  return reopenMenuItem
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

app.on('browser-window-created', function (event, win) {
  let reopenMenuItem = findReopenMenuItem();
  if (reopenMenuItem) reopenMenuItem.enabled = false;

  // 右键查看上下文菜单
  // win.webContents.on('context-menu', function (e, params) {
  //   contextMenu.popup(win, params.x, params.y)
  // })
});

ipcMain.on('show-context-menu', function (event) {
  const win = BrowserWindow.fromWebContents(event.sender)
  contextMenu.popup(win)
});

function getMenuListJson(){
  return JSON.parse(fs.readFileSync('./sysFile/menuList.json'));
}

function changeNewLeftList(data, content){
  if(!data){
    data = getMenuListJson();
  }else{
    fs.writeFileSync('./sysFile/menuList.json', JSON.stringify(data));
  }
  if(content){
    fs.writeFileSync('./sysFile/fileList.json', JSON.stringify(content));
  }
  mainWindow.webContents.send('event-left-list', data, content);
}

// 新建文件或文件夹
function newFolderOrFile(type, lineId){
  changeNewLeftList(ioAddFolder(getMenuListJson(), type, lineId))
}

function changeFolderTitle(fileId){
  console.log(fileId)
}

//上下文菜单
ipcMain.on('left-context-menu', (event, type, parentId, fileId) => {
  //! 生成菜单
  const menu = new Menu();
  menu.append(new MenuItem({ label: '新建文件夹', click: newFolderOrFile.bind(this, type, parentId)}));
  if(!type){
    menu.append(new MenuItem({ type: 'separator' }));
    menu.append(new MenuItem({ label: '新建文件', click: newFolderOrFile.bind(this, type, parentId) }));
  }else{
    menu.append(new MenuItem({ type: 'separator' }));
    menu.append(new MenuItem({ label: '重命名', click: changeFolderTitle.bind(this, fileId)}));
  }
  const win = BrowserWindow.fromWebContents(event.sender);
  menu.popup(win);
});

//更改文件title
ipcMain.on('change-file-title', (even, id, title) => {
  changeNewLeftList(ioChangeTitle(id, title));
})

//更改文件内容
ipcMain.on('change-file-content', (even, id, content) => {
  changeNewLeftList(null, ioChangeContent(id, content));
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
  let reopenMenuItem = findReopenMenuItem()
  if (reopenMenuItem) reopenMenuItem.enabled = true
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
