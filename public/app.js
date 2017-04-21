;
jQuery(function($){
	'use strict'


	///////////CANVAS SETUPS //////////
	var canvas = document.getElementById('canvas'),
                context = canvas.getContext('2d');

     window.addEventListener('resize', resizeCanvas, false);

     function resizeCanvas() {
                canvas.width = window.innerWidth-20;
                canvas.height = window.innerHeight-100;
                
            
                //drawStuff(); 
      }
     resizeCanvas();





	var IO = {

		init: function(){
			IO.socket = io.connect();
			IO.bindEvents();
		},

		bindEvents: function(){
			IO.socket.on('connected', IO.onConnected);
			IO.socket.on('newGameCreated', IO.onNewGameCreated);
			IO.socket.on('playerJoinedRoom', IO.playerJoinedRoom );
		},

		onConnected: function(data){
			App.mySocketId = IO.socket.socket.sessionid;
			console.log(data.message);
		},

		onNewGameCreated: function(data){
			App.Host.gameInit(data);
		},

		playerJoinedRoom : function(data) {
   			console.log("heyoooo)");
            App[App.myRole].updateWaitingScreen(data);
        },
		

	};

	var App = {

		gameId: 0,

		myRole: '', //player or host

		mySocketId: '',

		init: function(){
			App.cacheElements();
			App.showInitScreen();
			App.bindEvents();

		},

		cacheElements: function(){
			App.$doc = $(document);

			App.$gameArea = $('#gameArea');
			App.$templateIntroScreen = $('#intro-screen-template').html();
			App.$templateNewGame = $('#create-game-template').html();
			App.$templateJoinGame = $('#join-game-template').html();
		},

		bindEvents: function(){
			//events
			App.$doc.on('click', '#btnCreateGame', App.Host.onCreateClick);
			App.$doc.on('click', '#btnJoinGame', App.Player.onJoinClick);
			App.$doc.on('click', '#btnStart', App.Player.onStartClick);
		},

		/////GAME LOGIC///

		showInitScreen: function(){
			App.$gameArea.html(App.$templateIntroScreen);
		},

		////HOST////
		Host : {
			players : [],
			isNewGame : false,
			numPlayersInRoom: 0,
			board : {'steps':5},

			onCreateClick: function(){
				IO.socket.emit('hostCreateNewGame');
			},

			gameInit: function(data){
				App.gameId = data.gameId;
				App.mySocketId = data.mySocketId;
				App.myIp = data.ip;
				App.myRole = 'Host';
				App.Host.numPlayersInRoom = 0;

				console.log("game started with ID:" + App.gameId + "my role is:" +App.myRole);
				App.Host.renderBoard();
				App.Host.displayNewGameScreen();
			},

			displayNewGameScreen: function(){
				//show new game screeen
				App.$gameArea.html(App.$templateNewGame);

				$('#spanNewGameCode').text(App.gameId + " on " + App.myIp);

			},

			updateWaitingScreen: function(data){
				console.log("host got joining");
				$('#playersWaiting')
					.append('</p>')
					.text('Player '+data.playerName+' joined the game');

				App.Host.players.push(data);

				App.Host.numPlayersInRoom += 1;

				App.Host.renderBoard();

				console.log('Player '+data.playerName+' joined the game');
			},

			renderBoard: function(){
				App.Host.renderBackground();

    			context.fillStyle = "green";
    			for(var i = 0; i < App.Host.players.length ; i++){
    				context.fillRect(App.Host.players[i].x,(110*i), 100,100);
    			}

    			
    			
			},

			renderBackground: function(){
				context.fillStyle = '#231C24';      
    			context.fillRect(0,0,canvas.width,canvas.height);

				var boardSteps = App.Host.board.steps;
    			context.fillStyle = "red";
    			
    			for(var i=0; i < boardSteps;i++){
    				context.fillRect((canvas.width/boardSteps)*i, 200, 20,20);
    			}
			}
		},



		///player//////

		Player : {
			hostSocketId:'',
			myName:'',

			onJoinClick: function(){
				App.$gameArea.html(App.$templateJoinGame);
			},

			onStartClick: function(){
				//collect data to send to the server
				var data = {
					gameId : +($('#inputGameId').val()),
					playerName : $('#inputPlayerName').val(),
					x : 0,
					y : 0
				};

				//send the gameId and playername to the server
				IO.socket.emit('playerJoinGame', data);

				App.myRole = 'Player';
				App.Player.myName = data.playerName;

				
			},

			updateWaitingScreen: function(data){
				if(IO.socket.socket.sessionid === data.mySocketId){
					App.myRole = 'Player';
					App.gameId = data.gameId;

					console.log("joined game waiting...");
				}
			}
		}


	}

	IO.init();
	App.init();
});