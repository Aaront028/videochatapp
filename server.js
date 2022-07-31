// const express = require('express')
// const app = express()
// const server = require('http').Server(app)
// const io = require('socket.io')(server)
const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)

const { v4: uuidV4 } = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', (socket) => {
  socket.on('join-room', (roomId, userId) => {
    console.log('entered the room' + roomId + ' with the user id: ' + userId)

    socket.join(roomId)

    socket.to(roomId).emit('user-connected', userId)

    socket.on(
      'disconnect',
      () => {
        socket.to(roomId).emit('user-disconnected', userId)
      },
      1000
    )
  })
})

// ===============================================

// server.listen(3000, () => {
//   return console.log(`server is listening on ${port}`)
// })
server.listen(process.env.PORT || 80)
