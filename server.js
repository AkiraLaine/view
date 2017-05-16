const app = require('express')()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const path = require('path')
const history = require('connect-history-api-fallback')

app.use(history())
app.use(require('express').static(path.join(__dirname, '/dist')))

const roomData = {}
const roomInterval = {}

io.on('connection', socket => {
  let userData = {}

  socket.on('createRoom', room => {
    userData = {
      roomId: room.id,
      userId: room.viewers[0]
    }
    roomData[room.id] = room
    roomInterval[room.id] = {
      interval: null,
      time: 0
    }
    io.emit('updatedData', room)
  })

  socket.on('joinRoom', ({ roomId, userId }) => {
    userData = { roomId, userId }
    let room = roomData[roomId]
    if (room && Object.keys(room).length > 0) {
      if (room.viewers.indexOf(userId) === -1) {
        room.viewers.push(userId)
      }
      room.video.currentTime = roomInterval[roomId].time
      io.emit('updatedData', room)
    }
  })

  socket.on('updatePlayerState', state => {
    let room = roomData[userData.roomId]
    if (room && Object.keys(room).length > 0) {
      if (state === 'playing') {
        room.video.status = 'playing'
        io.emit('updatedData', room)
        roomInterval[userData.roomId].interval = setInterval(() => {
          roomInterval[userData.roomId].time++
        }, 1000)
      } else if (state === 'paused') {
        if (roomInterval[userData.roomId] && roomInterval[userData.roomId].interval) {
          clearInterval(roomInterval[userData.roomId].interval)
        }
        room.video.status = 'paused'
        io.emit('updatedData', room)
      }
    }
  })

  socket.on('updateCurrentTime', time => {
    roomInterval[userData.roomId].time = time
    roomData[userData.roomId].video.currentTime = time
    io.emit('updatedData', roomData[userData.roomId])
  })

  socket.on('trackNewVideo', id => {
    clearInterval(roomInterval[userData.roomId].interval)
    roomInterval[userData.roomId].time = 0
    roomData[userData.roomId].video.id = id
    roomData[userData.roomId].video.currentTime = 0
    io.emit('updatedData', roomData[userData.roomId])
  })

  socket.on('addVideoToQueue', item => {
    roomData[userData.roomId].queue.push(item)
    io.emit('updatedData', roomData[userData.roomId])
  })

  socket.on('removeVideoFromQueue', () => {
    roomData[userData.roomId].queue.splice(0, 1)
    io.emit('updatedData', roomData[userData.roomId])
  })

  socket.on('disconnect', () => {
    let room = roomData[userData.roomId]
    if (room && Object.keys(room).length > 0) {
      let index = room.viewers.indexOf(userData.userId)
      room.viewers.splice(index, 1)
      io.emit('updatedData', room)
    }
  })
})

setInterval(() => {
  Object.keys(roomData).forEach(id => {
    if (roomData[id].viewers.length === 0) {
      delete roomData[id]
    }
  })
}, 60000)


server.listen(3000)
