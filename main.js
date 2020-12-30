// Modules to control application life and create native browser window
const { app, ipcMain, BrowserView, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow, view;
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
  mainWindow.on('will-resize', (_event, newBounds) => { //const viewAnchor = { x: 0, y: 100 };
    //     view.setBounds({...viewAnchor, width: newBounds.width, height: newBounds.height - viewAnchor.y });
    //console.log(mainWindow.getBounds().height, mainWindow.getContentBounds().height);
  });

  view = new BrowserView();
  mainWindow.setBrowserView(view);
  view.setBounds({ x: 0, y: 200, width: mainWindow.getContentBounds().width, height: mainWindow.getContentBounds().height });
  view.setAutoResize({ x: true, y: true, horizontal: true, vertical: true });

  let status
    // view.webContents.on('did-fail-load', (event) => {
    //   status = false
    //   console.log('did-fail-load');
    //   mainWindow.webContents.send("fromMain", 'did-fail-load');
    //   console.log(event.sender.getURL());

  //   // In main process.
  // });

  view.webContents.once('did-finish-load', (event) => {
    //console.log(event, status, 'ready-to-show');
    console.log(event.sender.getTitle());
    if (event.sender.getTitle() == 'Account history - Winamax') {
      mainWindow.webContents.send("fromMain", 'did-finish-load');
      contentload(view)
    }

    // In main process.
  });

  view.webContents.loadURL('https://www.winamax.fr/en/my-account_account-history');
  //view.webContents.loadURL('https://www.google.com/');

}


// This method will be called when Electron has finished initialization and is ready to create browser windows.
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






//------------------------- Trigger Function -------------------------
function contentload(webview) {
  console.log('contentload', webview);

  webview.executeJavaScript({
    code: `( () => {
                    var parse = {};
                    var temp = document.querySelector('#user-block .identity .name');
                    temp === null? parse.nickname = "" : parse.nickname = temp.textContent;
                    return parse;
            })()`
  }, (val) => {
    if (val[0].nickname == "") noAuth();
    else {
      nickname = val[0].nickname;
      if (webview.src.includes('parser')) {
        webview.executeScript({
          code: `( () => {
                            var parse = {};
                            var temp1 = document.querySelector('#page-content table');
                            temp1 === null? parse.table = "<table><tbody></tbody></table>" : parse.table = temp1.outerHTML;
                            var temp2 = document.querySelectorAll('#page-content .pagination li');
                            temp2.length > 1 ? ( temp2[temp2.length - 1].textContent == 'Next' ? parse.page = temp2[temp2.length - 2].textContent : parse.page = temp2[temp2.length - 1].textContent ) : parse.page = '1';
                            return parse;
                          })()`
        }, (res) => {
          var category = /to_display=\w+/gm.exec(webview.src.toString())[0].replace('to_display=', '');
          var page = /page=\d+/gm.exec(webview.src.toString())[0].replace('page=', '');
          console.log(page);

          switch (category) {
            case 'deposits':
              arr.deposits.push(res[0].table);
              page == res[0].page ? goPage('withdrawals', 1) : goPage(category, page = +page + 1)
              break;
            case 'withdrawals':
              arr.withdrawals.push(res[0].table);
              page == res[0].page ? goPage('bonuses', 1) : goPage(category, page = +page + 1)
              break;
            case 'bonuses':
              arr.bonuses.push(res[0].table);
              page == res[0].page ? goPage('tournaments', 1) : goPage(category, page = +page + 1)
              break;
            case 'tournaments':
              arr.tournaments.push(res[0].table);
              page == res[0].page ? goPage('sitngo', 1) : goPage(category, page = +page + 1)
              break;
            case 'sitngo':
              arr.sitngo.push(res[0].table);
              page == res[0].page ? goPage('cashgame', 1) : goPage(category, page = +page + 1)
              break;
            case 'cashgame':
              arr.cashgame.push(res[0].table);
              page == res[0].page ? goPage('betting', 1) : goPage(category, page = +page + 1)
              break;
            case 'betting':
              arr.betting.push(res[0].table);
              page == res[0].page ? finishParse(arr) : goPage(category, page = +page + 1)
              break;
          }
        });

      } else {
        $("#noAuth").addClass("transition hidden");
        $("#Auth").removeClass("transition hidden");

        arr = {
          deposits: [],
          withdrawals: [],
          bonuses: [],
          tournaments: [],
          sitngo: [],
          cashgame: [],
          betting: [],
        };

        //------------------------- Date Setting -------------------------
        var today = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        today.setDate(today.getDate() - 1);
        var sDate = new Date(today.getFullYear(), today.getMonth(), 1);
        var fDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        $('#startDate').calendar({
          type: 'date',
          endCalendar: $('#finishDate'),
          initialDate: sDate,
          formatter: formatter,
          today: true,
          firstDayOfWeek: 1,
          selectAdjacentDays: true,
          text: dateText
        });

        $('#finishDate').calendar({
          type: 'date',
          startCalendar: $('#startDate'),
          initialDate: fDate,
          formatter: formatter,
          today: true,
          firstDayOfWeek: 1,
          selectAdjacentDays: true,
          text: dateText
        });

        $('#month_year_calendar')
          .calendar({
            type: 'month',
            initialDate: sDate,
            text: dateText,
            onChange: (val) => {
              iDate(val)
            },
          });
      }
    }
  });

}