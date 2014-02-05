var request;
function reconnect () {
    var requests = [];
    var connection = new WebSocket('ws://127.0.0.1:1337');
    connection.onclose = function () {
        setTimeout(reconnect, 1000);
    };
    connection.onmessage = function (message) {
        var event = JSON.parse(message);
        requests[event.rid](event);
    };
    request = function (what, callback) {
        what.rid = requests.length;
        connection.send(JSON.stringify(what));
        requests.push(callback);
    };
}
reconnect();