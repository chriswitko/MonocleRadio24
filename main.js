'use strict'

const menubar = require('menubar')
const electron = require('electron')
const isDev = require('electron-is-dev')
const firstRun = require('first-run')
const fixPath = require('fix-path')
const GA = require('electron-google-analytics')
const analytics = new GA.default('UA-111013708-1')
const {Menu, MenuItem} = require('electron')
const ipc = electron.ipcMain

const width = 300
const height = 360
const { app, shell } = electron

// Set the application's name
app.setName('Monocle Radio')

if (!isDev && firstRun()) {
  app.setLoginItemSettings({
    openAtLogin: true
  })
}

fixPath()

const mb = menubar({
  width: width,
  height: height,
  resizable: false,
  backgroundColor: '#000000'
})

mb.on('ready', _ => {
  return analytics.pageview('http://monocleradio.com', '/home', 'Home App')
    .then((response) => {
      return response
    }).catch((err) => {
      return err
    })
})

mb.on('after-show', _ => {
  ipc.emit('reset-player')
  mb.window.webContents.send('reset-player')
})

ipc.on('resize-window', (event, arg) => {
  mb.setOption('height', arg.height)
  mb.window.setContentSize(width, arg.height, true)
})

const menu = new Menu()

menu.append(new MenuItem({ label: 'Go to Monocle', click: () => shell.openExternal('https://monocle.com?ref=MonocleRadio') }))
menu.append(new MenuItem({ type: 'separator' }))
menu.append(new MenuItem({ label: 'About...', click: () => shell.openExternal('https://chriswitko.com') }))
menu.append(new MenuItem({ label: 'Support', click: () => shell.openExternal('https://medium.com/@chriswitko') }))
menu.append(new MenuItem({ type: 'separator' }))
menu.append(new MenuItem({ label: 'Restart radio', click: () => ipc.emit('reset-player') }))
menu.append(new MenuItem({ type: 'separator' }))
menu.append(new MenuItem({ label: 'Quit', click: () => mb.app.quit() }))

ipc.on('show-config-menu', (event) => {
  menu.popup(mb.window)
})
