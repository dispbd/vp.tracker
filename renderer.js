//const { inherits } = require('util');

window.api.receive("from", (key, data) => { // Called when message received from main process
    console.log(`Received ${data} from main process`);

    switch (key) {
        case 'noAuth':
            noAuth(data);
            break;
        case 'auth':
            auth(data);
            break;
        case 'status':
            $('#status').text(data);
            break;

        default:
            break;
    }
});

window.api.send("to", "some data"); // Send a message to the main process


$('.top.menu .item').tab({
    'onLoad': function(path, arr, history) {
        ///noAuth()
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
//let webview = document.getElementById('view-wm');

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

startParsing.onclick = function(element) {
    console.log('goParse');
    connect();
    $("#msg").removeClass("transition hidden");
    $(".start").removeClass("transition hidden");
    $(".finishOff").addClass("transition hidden");
    $(".finishOn").addClass("transition hidden");

    startDate = $('#startDate').calendar('get date');
    finishDate = $('#finishDate').calendar('get date');

    //goPage('deposits', 1);
    window.api.send("to", { f: "goParse", startDate, finishDate }); // Send a message to the main process
};

//------------------------- App Function -------------------------

function auth(nick) {
    nickname = nick;

    $("#noAuth").addClass("transition hidden");
    $("#Auth").removeClass("transition hidden");

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

    $('#month_year_calendar').calendar({
        type: 'month',
        initialDate: sDate,
        text: dateText,
        onChange: (val) => {
            iDate(val)
        },
    });
}

function noAuth() {
    $("#Auth").addClass("transition hidden");
    $("#noAuth").removeClass("transition hidden");
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