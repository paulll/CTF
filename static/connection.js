var request, events;
function reconnect () {
    connection = new WebSocket('ws://127.0.0.1:1337');
    // тут остановился, коммитну перед выходом
}