var gameIO
var gameClientSocket
var gamesInSession = []
var gameInfo = {}


const game = (io, clientSocket) => {
	gameIO = io

	gameClientSocket = clientSocket
	gameClientSocket.on('disconnect', onDisconnect);
	gameClientSocket.on('createGame', onCreateGame);
	gameClientSocket.on('playMove', onPlayMove);
	gameClientSocket.on('sendMessage', onSendMessage);
	gameClientSocket.on('startGame', onStartGame);

}


function onDisconnect(gameId) {
	var i = gamesInSession.indexOf(gameId);
	gamesInSession.splice(i, 1);
}

/**
 * 
 * @param message: {
 *              messageText,
 *              gameId,
 *              senderId
 *        }
 */
function onSendMessage(message) {
	gameIO.to(message.gameId).emit('messageSent', message);
}

function onCreateGame({ username, gameId }) {
	var color = 1; gamesInSession.push(gameId);
	gameInfo[gameId] = {
		gameId: gameId,
		p1Username: username,
		p1SocketId: this.id,
		p1Color: color,
		p2Username: 'yet to join the game',
		p2SocketId: 'yet to join the game',
		p2Color: 0
	}
	this.join(gameId);
	gameIO.sockets.in(gameId).emit('gameCreated', gameInfo[gameId]);
}

function onStartGame({ username, gameId }) {
	var color = 0; var room = gameIO.sockets.adapter.rooms.has(gameId);
	if (!room) {
		this.emit('statusUpdate', 'This game session dne.');
		return;
	}
	var roomSize = gameIO.sockets.adapter.rooms.get(gameId).size;
	if (roomSize < 2) {
		this.join(gameId);
		gameInfo[gameId] = { ...gameInfo[gameId], p2Username: username, p2SocketId: this.id, p2Color: color }
		gameIO.sockets.in(gameId).emit('gameStarted', gameInfo[gameId]);
	}
	else {
		this.emit('statusUpdate', 'Match has started. There are already 2 people in the game.');
		return;
	}
}

/**
 * 
 * @param move: {
 *              gameId,
 *              playerSocketId,
 *              from,
 *              to,
 *              promotion,
 *        }
 */
function onPlayMove(move) {
	gameIO.to(move.gameId).emit('movePlayed', move);
}

exports.game = game;
