// import express
var express = require('express');
// import path
var path = require('path');

//express instace
var app = express();

//import game logic
var sr = require('./spaceracegame');

//express setup
app.configure(function() {
	//serve
	app.use(express.static(path.join(__dirname,'public')));

});

//create server
var server = require('http').createServer(app).listen(process.env.PORT || 8080);

//socketio server
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket){
	console.log('[SOCKET]client connected');
	sr.initGame(io, socket);
})