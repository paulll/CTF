var adminConnection = new WebSocket('ws://127.0.0.1:1338');

adminConnection.onmessage = function (messageText) {
    var message = JSON.parse(messageText);
    console.log(message);
}