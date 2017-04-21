var io;
var gameSocket;
var myIp;


exports.initGame = function(sio, socket, ip){
	io = sio;
	myIp = ip;
	gameSocket = socket;
	gameSocket.emit('connected', {message: "you are connected"});

	//host events
	gameSocket.on('hostCreateNewGame', hostCreateNewGame);

	//player event
	gameSocket.on('playerJoinGame', playerJoinGame);
}

////HOST FUNCTIONS

///start button
function hostCreateNewGame(){
    var thisGameId = ( Math.random() * 100000 ) | 0;

	this.emit('newGameCreated', {gameId:thisGameId, mySocketId: this.id, ip: myIp});



	this.join(thisGameId);
	console.log("host joining game:" +"test");
};

////// PLAYER FUNCS

function playerJoinGame(data) {
	console.log("player attempting to join game");

	var sock = this;

	var room = gameSocket.manager.rooms["/"+data.gameId];

	//if the room exists
	if (room != undefined){
		data.mySocketId = sock.id;

		sock.join(data.gameId);

		console.log("player joining game");

		// sock.to('test').emit('playerJoinedRoom', data);
		io.sockets.in(data.gameId).emit('playerJoinedRoom', data);
		console.log("player sent joining game");
	} else {
		console.log("player failed to join game");
		this.emit('error', {message: "this room is not"});
	}
}