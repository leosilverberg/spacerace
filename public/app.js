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
			IO.socket.on('newQuestionData', IO.onNewQuestionData);
			IO.socket.on('hostCheckAnswer', IO.hostCheckAnswer)
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

        onNewQuestionData: function(data){
        	console.log("got new question");
        	App[App.myRole].newQuestion(data);
        },

        hostCheckAnswer: function(data){
        	console.log("host check answer");
        	if(App.myRole === 'Host'){
        		App.Host.checkAnswer(data);
        	}
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
			App.$doc.on('click', '#btnStartGame', App.Host.onStartGameClick);
			App.$doc.on('click', '.btnAnswer', App.Player.onPlayerAnswerClick);
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
			currentQuestionData : "",
			isQuestionActive: false,
			playerAnswered:0,
			playersRight:0,

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

			onStartGameClick: function(){
				console.log("starting game");
				 IO.socket.emit('hostStartGame', App.gameId);
			},

			newQuestion: function(data){
				App.Host.isQuestionActive = true;
				App.Host.currentQuestionData = data;
				App.Host.renderBoard();
			},

			checkAnswer: function(data){
				console.log("checking...");
				App.Host.playerAnswered++;
				if(App.Host.currentQuestionData.answer === data.answer){
					console.log("right!");
					for(var i =0; i<App.Host.players.length; i++){
						if(App.Host.players[i].playerId == data.playerId){
							console.log("player right");
							App.Host.playerRight(i);
						}
					}
				} else {
					for(var i =0; i<App.Host.players.length; i++){
						if(App.Host.players[i].playerId == data.playerId){
							console.log("player wrong");
							App.Host.playerWrong(i)
						}
					}
					
				}
			},

			playerRight: function(index){
				App.Host.players[index].step++;
				App.Host.players[index].prevX = App.Host.players[index].x;
				App.Host.players[index].x = App.Host.players[index].step*(canvas.width/App.Host.board.steps);
				App.Host.playersRight++;
				if(App.Host.playerAnswered == App.Host.numPlayersInRoom){
					App.Host.endRound();
				}
			},

			playerWrong: function(index){
				if(App.Host.playerAnswered == App.Host.numPlayersInRoom){
					App.Host.endRound();
				}
			},

			endRound: function(){
				App.Host.isQuestionActive = false;
				console.log("hiding");
				$('#currentQuestion').hide();
				if(App.Host.playersRight > 0){
					console.log("moving players");
					 //App.Host.movePlayers();
				} else {
					App.Host.renderBoard();
				};

				
			},

			renderBoard: function(){
				App.Host.renderBackground();


				//playerBLOBS
    			context.fillStyle = "green";
    			for(var i = 0; i < App.Host.players.length ; i++){
    				if(App.Host.players[i].prevX < App.Host.players[i].x){
    					context.fillStyle = "green";
    				context.fillRect(App.Host.players[i].prevX+1,(120*i)+50, 100,100);

    				context.fillStyle = "white";
    				context.fillText(App.Host.players[i].playerName, App.Host.players[i].prevX+0.1, (120*i)+50);

    				App.Host.players[i].prevX = App.Host.players[i].prevX+1;
    			} else{
    				context.fillStyle = "green";
    				context.fillRect(App.Host.players[i].x,(120*i)+50, 100,100);

    				context.fillStyle = "white";
    				context.fillText(App.Host.players[i].playerName, App.Host.players[i].x, (120*i)+50);
    			}
    				
    			};

    			//playerSTATUS
    			$('#gameStatus').empty();

    			for(var i = 0; i < App.Host.players.length ; i++){
    				$('#gameStatus').append(App.Host.players[i].playerName+", "); 
    			};

    			if(App.Host.isQuestionActive){
    				$('#currentQuestion').show();
    				$('#currentQuestion').empty();
    				$('#currentQuestion').append(App.Host.currentQuestionData.question);

    				// var qWindowW = 300;
    				// var qWindowH = 500;
    				// context.fillStyle ="white";
    				// context.fillRect((canvas.width/2) - (qWindowW/2),(canvas.height/2) - (qWindowH/2), qWindowW, qWindowH);

    				// context.fillStyle = "black";
    				// context.fillText(App.Host.currentQuestionData.question, (canvas.width/2) - (qWindowW/2),(canvas.height/2) - (qWindowH/2)+100);
    			}



    			
    			
			},

			movePlayers:function(){
				

				var animSpeed = 0.1;
				//playerBLOBS
    			context.fillStyle = "green";
    			for(var i = 0; i < App.Host.players.length ; i++){
    				var stepsToTake = App.Host.players[i].x - App.Host.players[i].prevX;


    				for(var s = 0; s <= stepsToTake; s = s+animSpeed){
    					console.log(s);
    					App.Host.players[i].x = App.Host.players[i].prevX+s; 

    				}
    				
    			};
    			
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
			isQuestionActive:false,
			currentQuestionData:"",
			currentStep:0,

			onJoinClick: function(){
				App.$gameArea.html(App.$templateJoinGame);
			},

			onStartClick: function(){
				//collect data to send to the server
				var data = {
					gameId : +($('#inputGameId').val()),
					playerName : $('#inputPlayerName').val(),
					playerId: App.mySocketId,
					x : 0,
					y : 0,
					step: App.Player.currentStep,
					prevX:0,
					prevY:0
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
			},

			newQuestion: function(data){
				App.Player.isQuestionActive = true;
				App.Player.currentQuestionData = data;
				App.Player.renderBoard();
			},

			onPlayerAnswerClick: function(){
				var $btn = $(this);
				var answer = $btn.val();
				console.log(answer);

				var data = {
					gameId:App.gameId,
					playerId:App.mySocketId,
					answer:answer,
				};

				IO.socket.emit('playerAnswer', data);
			},

			renderBoard: function(){
				App.Player.renderBackground();

				if(App.Player.isQuestionActive){
    				$('#playerQuestion').show();
    				// $('#playerQuestion').empty();
    				$('#playerQ').append(App.Player.currentQuestionData.question);

    				for(var i=0; i<App.Player.currentQuestionData.decoys.length; i++){
    					$('#playerAnswers').append('<button class="btnAnswer" value="'+App.Player.currentQuestionData.decoys[i]+'">'+App.Player.currentQuestionData.decoys[i]+'</button>');
    				};
    				$('#playerAnswers').append('<button class="btnAnswer" value="'+App.Player.currentQuestionData.answer+'">'+App.Player.currentQuestionData.answer+'</button>');
    				


    			}


			},

			renderBackground: function(){
				context.fillStyle = '#231C24';      
    			context.fillRect(0,0,canvas.width,canvas.height);

				
			}
		}


	}

	IO.init();
	App.init();

	setInterval(function(){
			
			App.Host.renderBoard();

		
		}, 40);
});