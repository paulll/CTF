
// Initializing system

var connection = require('./connection');
var events = require('./events');
var db = require('./database');
var admin = require('./admin');

events._setDbHandler(db);
events._setBroadcaster(connection.broadcast);

connection._setDbHandler(db);

connection.listeners = events;

//
// ** Starting http server ** //
//

var fs = require("fs");
var http = require("http");

// to store files data in memory

var cache = {};

// load files to memory

var files = [
    {
        original: 'admin.html',
        dist: '/admin/'+admin.password,
        type: 'text/html'
    },
    {
        original: 'index.html',
        dist: '/',
        type: 'text/html'
    },
    {
        original: 'connection.js',
        dist: '/js/connection.js',
        type: 'text/javascript'
    },
    {
        original: 'ui.js',
        dist: '/js/ui.js',
        type: 'text/javascript'
    },
    {
        original: 'style.css',
        dist: '/css/style.css',
        type: 'text/css'
    },
    {
        original: 'admin.js',
        dist: '/js/admin.js',
        type: 'text/javascript'
    },
    {
        original: 'events.js',
        dist: '/js/events.js',
        type: 'text/html'
    },
    {
        original: '404.html',
        dist: '/404',
        type: 'text/html'
    },
    {
        original: 'bg.png',
        dist: '/img/bg.png',
        type: 'image/png'
    }
];

function loadCache (datas) {
    datas.forEach(function(data){
        fs.readFile(__dirname + "/static/" + data.original, function (error, datan) {
            cache[data.dist] = {
                data: datan,
                type: data.type
            };
        });
    });
}

setInterval(function(){loadCache(files)}, 5000);

loadCache(files);

// start server

http.createServer(function(request, response) {

    admin.log('[HTTP]', request.method, request.url, 'from', request.socket.remoteAddress);

    if (cache[request.url]) {
        response.writeHead(200, {"Content-Type": cache[request.url].type});
        response.write(cache[request.url].data);
    } else {
        response.writeHead(404, {"Content-Type": "text/html"});
        response.write(cache['/404'].data);
    }

    response.end();
}).listen(require('./config').HTTPWebInterfacePort);

admin.log('[HTTP]', 'listening HTTP at', require('./config').HTTPWebInterfacePort);