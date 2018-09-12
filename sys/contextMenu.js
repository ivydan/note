const electron = require('electron');
const { app, Menu, MenuItem  } = electron;

const menu = new Menu()
menu.append(new MenuItem({ label: 'test' }));
menu.append(new MenuItem({ type: 'separator' }));

// menu.append(new MenuItem({ label: 'Electron', type: 'checkbox', checked: true }))

module.exports = menu;