var io;
var gameSocket;


exports.initGame = function(sio, socket){
	io = sio;
	gameSocket = socket;
	gameSocket.emit('connected', {message: "you are connected"});

	//host events
	gameSocket.on('hostCreateNewGame', hostCreateNewGame);
}

////HOST FUNCTIONS

///start button
function hostCreateNewGame(){
    var thisGameId = ( Math.random() * 100000 ) | 0;

	this.emit('newGameCreated', {gameId:thisGameId, mySocketId: this.id});

	this.join(thisGameId.toString());
}