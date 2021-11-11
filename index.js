const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const game = require('./game')
const app = express()

const server = http.createServer(app)
const io = socketio(server, {
  cors: {
    origin: "*"
  }
})

io.on('connection', client => {
  game.game(io, client)
  console.log(client.id);
})

app.get('/', (req, res) => {
  res.send('hello');
})

server.listen(process.env.PORT || 8000)