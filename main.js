// Modules to control application life and create native browser window
const { app, ipcMain, BrowserView, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { eventNames } = require('process');

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

    view.webContents.on('did-stop-loading', (event) => {
        let url = event.sender.getURL();
        console.log(url);
        switch (url) {
            case 'https://www.winamax.fr/en/my-account_account-history':
                {
                    console.log(event.sender.getTitle());
                    if (event.sender.getTitle() == 'Account history - Winamax') {
                        //mainWindow.webContents.send("fromMain", 'did-finish-load');
                        contentload(url);
                    }
                }
                break;

            default:
                {
                    //console.log(event.sender.getTitle());
                    //if (event.sender.getTitle() == 'Account history - Winamax') {
                    //mainWindow.webContents.send("fromMain", 'did-finish-load');
                    contentload(url);
                    //}
                }
                break;
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





var startDate, finishDate;
var ref = 'https://www.winamax.fr/en/my-account_account-history';
var arr = {
    deposits: [],
    withdrawals: [],
    bonuses: [],
    tournaments: [],
    sitngo: [],
    cashgame: [],
    betting: [],
};

//------------------------- Trigger Function -------------------------

ipcMain.on("to", (event, data) => {
    startDate = data.startDate;
    finishDate = data.finishDate;
    console.log(data);
    if (data.f == 'goParse') goPage('deposits', 1);
    //mainWindow.webContents.send("from", 'responseObj');
});

function finishParse(results) {
    var sMsg = {};
    sMsg.typeMsg = "wx_Parse";
    sMsg.info = {
        nickname: nickname,
        startDate: [startDate.getDate(), (startDate.getMonth() + 1), startDate.getFullYear()],
        finishDate: [finishDate.getDate(), (finishDate.getMonth() + 1), finishDate.getFullYear()],
    }
    sMsg.data = results;
    $(".start").addClass("transition hidden");
    if (onServer) {
        send(encodeURIComponent(JSON.stringify(sMsg)));
        $(".finishOn").removeClass("transition hidden");
    } else {
        let path = require('os').homedir() + '\\Documents\\mnl_' + nickname + ' ' + sMsg.info.startDate.join('.') + '-' + sMsg.info.finishDate.join('.') + '.json';
        $('#path').text(path);
        require('fs').writeFileSync(path, JSON.stringify(sMsg));
        $(".finishOff").removeClass("transition hidden");
    }
    disconnect();

}

function goPage(category, page) {
    //$('#status').text('Категория:  ' + category + ',  стр.  ' + page);
    mainWindow.webContents.send("from", 'status', `Категория:  ${category},  стр.  ${page}`);
    var url = ref +
        '?to_display=' + category + '&page=' + page +
        '&history_date_from_day=' + startDate.getDate() +
        '&history_date_from_month=' + (startDate.getMonth() + 1) +
        '&history_date_from_year=' + startDate.getFullYear() +
        '&history_date_to_day=' + finishDate.getDate() +
        '&history_date_to_month=' + (finishDate.getMonth() + 1) +
        '&history_date_to_year=' + finishDate.getFullYear() +
        '&parser=true';
    // view.executeScript({
    //   code: 'location.href = "' + url + '"'
    // });
    // view.webContents.executeJavaScript(`location.href = "${url}"`, true).then(res => {
    //     console.log(res);
    // })
    view.webContents.loadURL(url);

    // window.api.send("toMain", "some data"); // Send a message to the main process
    // return 'location.href = "' + url + '"';
}

function contentload(url) {
    //console.log('contentload', view);

    view.webContents.executeJavaScript(`( () => {
				var parse = {};
				var temp = document.querySelector('#user-block .identity .name');
				temp === null? parse.nickname = "" : parse.nickname = temp.textContent;
				return parse;
    })()`, true).then(result => {
        console.log(result) // должен быть объект JSON  из запрашиваемого вызова
        if (result.nickname == "") mainWindow.webContents.send("from", 'noAuth');
        else if (url) {
            if (url.includes('parser')) {
                view.webContents.executeJavaScript(`( () => {
									var parse = {};
									var temp1 = document.querySelector('#page-content table');
									temp1 === null? parse.table = "<table><tbody></tbody></table>" : parse.table = temp1.outerHTML;
									var temp2 = document.querySelectorAll('#page-content .pagination li');
									temp2.length > 1 ? ( temp2[temp2.length - 1].textContent == 'Next' ? parse.page = temp2[temp2.length - 2].textContent : parse.page = temp2[temp2.length - 1].textContent ) : parse.page = '1';
									return parse;
								})()`, true).then(res => {
                    //console.log(res);
                    var category = /to_display=\w+/gm.exec(url.toString())[0].replace('to_display=', '');
                    var page = /page=\d+/gm.exec(url.toString())[0].replace('page=', '');
                    console.log(page);

                    switch (category) {
                        case 'deposits':
                            arr.deposits.push(res.table);
                            page == res.page ? goPage('withdrawals', 1) : goPage(category, page = +page + 1)
                            break;
                        case 'withdrawals':
                            arr.withdrawals.push(res.table);
                            page == res.page ? goPage('bonuses', 1) : goPage(category, page = +page + 1)
                            break;
                        case 'bonuses':
                            arr.bonuses.push(res.table);
                            page == res.page ? goPage('tournaments', 1) : goPage(category, page = +page + 1)
                            break;
                        case 'tournaments':
                            arr.tournaments.push(res.table);
                            page == res.page ? goPage('sitngo', 1) : goPage(category, page = +page + 1)
                            break;
                        case 'sitngo':
                            arr.sitngo.push(res.table);
                            page == res.page ? goPage('cashgame', 1) : goPage(category, page = +page + 1)
                            break;
                        case 'cashgame':
                            arr.cashgame.push(res.table);
                            page == res.page ? goPage('betting', 1) : goPage(category, page = +page + 1)
                            break;
                        case 'betting':
                            arr.betting.push(res.table);
                            page == res.page ? finishParse(arr) : goPage(category, page = +page + 1)
                            break;
                    }
                });

            } else {
                arr = {
                    deposits: [],
                    withdrawals: [],
                    bonuses: [],
                    tournaments: [],
                    sitngo: [],
                    cashgame: [],
                    betting: [],
                };
                mainWindow.webContents.send("from", 'auth', result.nickname);
            }
        }
    });

}