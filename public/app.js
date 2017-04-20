;
jQuery(function($){
	'use strict'

	var IO = {

		init: function(){
			IO.socket = io.connect();
			IO.bindEvents();
		},

		bindEvents: function(){
			IO.socket.on('connected', IO.onConnected);
			IO.socket.on('newGameCreated', IO.onNewGameCreated);
		},

		onConnected: function(data){
			App.mySocketId = IO.socket.socket.sessionid;
			console.log(data.message);
		},

		onNewGameCreated: function(data){
			App.Host.gameInit(data);
		}
		

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

			onCreateClick: function(){
				IO.socket.emit('hostCreateNewGame');
			},

			gameInit: function(data){
				App.gameId = data.gameId;
				App.mySocketId = data.mySocketId;
				App.myRole = 'Host';
				App.Host.numPlayersInRoom = 0;

				console.log("game started with ID:" + App.gameId);
				App.Host.displayNewGameScreen();
			},

			displayNewGameScreen: function(){
				//show new game screeen
				App.$gameArea.html(App.$templateNewGame);

				$('#spanNewGameCode').text(App.gameId);

			}
		},

		Player : {
			hostSocketId:'',
			myName:'',

			onJoinClick: function(){
				App.$gameArea.html(App.$templateJoinGame);
			},

			onPlayerStartClick: function(){
				//collect data to send to the server
				var data = {
					gameId : +($('#inputGameId').val()),
					playerName : $('#inputPlayerName').val()
				};

				//send the gameId and playername to the server
				IO.socket.emit('playerJoinGame', data);

				
			}
		}


	}

	IO.init();
	App.init();
});