// Modules to control application life and create native browser window
const { app, ipcMain, BrowserView, BrowserWindow } = require('electron');
const path = require('path')
const fs = require('fs')

let mainWindow;
async function createWindow() {

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#fff', // always set a bg color to enable font antialiasing!
    webPreferences: {
      contextIsolation: true, // protect against prototype pollution
      preload: path.join(__dirname, './preload.js'),
    }
  });

  mainWindow.loadFile('index.html'); // and load the index.html of the app.
  mainWindow.webContents.openDevTools(); // Open the DevTools.

  let view = new BrowserView();
  mainWindow.setBrowserView(view);
  view.setBounds({ x: 0, y: 200, width: mainWindow.getContentBounds().width, height: mainWindow.getContentBounds().height });
  view.setAutoResize({ x: true, y: true, horizontal: true, vertical: true });

  view.webContents.on('did-fail-load', (event) => {
    console.log(event, 'did-fail-load');
    mainWindow.webContents.send("fromMain", 'did-fail-load');

    // In main process.
  });

  view.webContents.on('ready-to-show', (event) => {
    console.log(event, 'ready-to-show');
    //mainWindow.webContents.send("fromMain", 'did-fail-load');

    // In main process.
  });

  view.webContents.loadURL('https://www.winamax.fr/en/my-account_account-history');

  //const viewAnchor = { x: 0, y: 100 };
  mainWindow.on('will-resize', (_event, newBounds) => {
    //     view.setBounds({...viewAnchor, width: newBounds.width, height: newBounds.height - viewAnchor.y });
    //console.log(mainWindow.getBounds().height, mainWindow.getContentBounds().height);
  });
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits                  for applications and their menu bar to stay active until the user quitsfor applications and their menu bar to stay active until the user quitsfor applications and their menu bar to stay active until the user quitsfor applications and their menu bar to stay active until the user quitsfor applications and their menu bar to stay active until the user quitsfor applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') app.quit()
})


ipcMain.on("toMain", (event, args) => {
  mainWindow.webContents.send("fromMain", 'responseObj');
});

// ipcMain.on("toMain", (event, args) => {
//   console.log(event, args);
//   /*fs.readFile("path/to/file", (error, data) => {
//       // Do something with file contents

//       // Send result back to renderer process
//       mainWindow.webContents.send("fromMain", responseObj);
//   });*/
// });

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.