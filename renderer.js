// Called when message received from main process
window.api.receive("fromMain", (data) => {
  console.log(`Received ${data} from main process`);
});

// Send a message to the main process
window.api.send("toMain", "some data");


$('.top.menu .item').tab({
  'onLoad': function(path, arr, history) {
    noAuth()
      //if (path != 'third')
  }
});

//------------------------- WebSocket -------------------------
var socket = null;
var onServer = false;

function connect() {

  if (socket !== null)
    return;

  socket = new WebSocket('wss://auditor.vpluseteam.com/v1');

  socket.onopen = function() {
    console.log('open');
    onServer = true;
  };

  socket.onmessage = function(e) {
    console.log('onmessage');
  };

  socket.onclose = function(e) {
    console.log(e);
    console.log('onclose');
    onServer = false;
  };

  socket.onerror = function(e) {
    console.log(e);
    onServer = false;
  };
}

function disconnect() {
  onServer = false;

  if (socket === null)
    return;

  socket.close();
  socket = null;
}

function send(msg) {
  if (socket !== null) {
    socket.send(
      msg
    );
  }
}


//------------------------- Main Function -------------------------
let nickname = '';
var ref = 'https://www.winamax.fr/en/my-account_account-history';
var startParsing = document.getElementById('startParsing');
var startDate = $('#startDate').calendar('get date');
var finishDate = $('#finishDate').calendar('get date');
let webview = document.getElementById('view-wm');

var formatter = {
  date: function(date, settings) {
    if (!date) return '';
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    return day + '.' + (month < 10 ? 0 : '') + month + '.' + year;
  }
}
var dateText = {
  days: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  monthsShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
  today: 'Сегодня',
}


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
/*webview.addEventListener('contentload', function(e) {
    //console.log('contentload', e);
        
    webview.executeScript({
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
        
});
*/
startParsing.onclick = function(element) {
  connect();
  $("#msg").removeClass("transition hidden");
  $(".start").removeClass("transition hidden");
  $(".finishOff").addClass("transition hidden");
  $(".finishOn").addClass("transition hidden");

  startDate = $('#startDate').calendar('get date');
  finishDate = $('#finishDate').calendar('get date');

  goPage('deposits', 1);
};

//------------------------- App Function -------------------------
function noAuth() {
  $("#Auth").addClass("transition hidden");
  $("#noAuth").removeClass("transition hidden");
}

function goPage(category, page) {
  $('#status').text('Категория:  ' + category + ',  стр.  ' + page);
  var url = ref +
    '?to_display=' + category + '&page=' + page +
    '&history_date_from_day=' + startDate.getDate() +
    '&history_date_from_month=' + (startDate.getMonth() + 1) +
    '&history_date_from_year=' + startDate.getFullYear() +
    '&history_date_to_day=' + finishDate.getDate() +
    '&history_date_to_month=' + (finishDate.getMonth() + 1) +
    '&history_date_to_year=' + finishDate.getFullYear() +
    '&parser=true';
  webview.executeScript({
    code: 'location.href = "' + url + '"'
  });
}

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

function iDate(today) {
  $('#startDate').calendar('set date', new Date(today.getFullYear(), today.getMonth(), 1));
  var temp = today;
  today.setDate(today.getDate() + 31);
  today.setDate(1);
  today.setDate(today.getDate() - 1);
  $('#finishDate').calendar('set date', new Date(temp.getFullYear(), temp.getMonth(), today.getDate()));
}