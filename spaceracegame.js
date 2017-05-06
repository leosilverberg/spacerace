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
	gameSocket.on('hostStartGame', hostStartAGame);
	gameSocket.on('roundEnd', hostStartAGame);

	//player event
	gameSocket.on('playerJoinGame', playerJoinGame);
	gameSocket.on('playerAnswer', playerAnswer);
	gameSocket.on('playerRoundEnd', playerRoundEnd);
}

////HOST FUNCTIONS

function hostStartAGame(gameId){
	console.log("host start a game");
	sendQuestion(gameId);
}

///start button
function hostCreateNewGame(){
    var thisGameId = ( Math.random() * 100000 ) | 0;

	this.emit('newGameCreated', {gameId:thisGameId, mySocketId: this.id, ip: myIp + ":8080"});



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
};

function playerAnswer(data){
	io.sockets.in(data.gameId).emit('hostCheckAnswer', data);
};

function playerRoundEnd(data){
	io.sockets.in(data.gameId).emit('playerEndRound', data);
}


///GAME LOGIC /////////

function sendQuestion(gameId){
	console.log("send question");
	var data = getQuestion();
	io.sockets.in(gameId).emit('newQuestionData', data);
};

function getQuestion(){
	console.log("get question");
	var q = qPool[getRandomInt(0,qPool.length-1)];
	var qData = {
		question : q.question,
		answer : q.answer,
		decoys : q.decoys
	};

	return qData;
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var qPool = [
	{"question" : "Which star is at the center of our Solar System?",
	"answer": "The Sun",
	"decoys": ["Proxima Centauri", "Tau Ceti", "Alpha Centauri A"]},

	{"question" : "What is the diameter of the Sun?",
	"answer": "1,392,684 km",
	"decoys": ["2,342,123 km", "4,124,126 km", "9,422,902 km"]},

	{"question" : "What percent of the solar system’s mass does the Sun hold?",
	"answer": "99.8%",
	"decoys": ["53.2%", "20.1%", "10.2%"]},

	{"question" : "How much time does sun rays take to reach earth?",
	"answer": "8 minutes",
	"decoys": ["8 seconds", "8 hours", "8 days"]},

	{"question" : "Which planet is known as the Morning Star?",
	"answer": "Venus",
	"decoys": ["Mars", "Mercury", "Pluto"]}
];


