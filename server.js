global.WebSocket = require('ws')

const hz = new require('@horizon/client')()
const io = require('socket.io')(3000)

const rooms = hz('rooms')

io.on('connection', socket => {
  let meta = null
  socket.on('join-room', ({ room, userId }) => {
    meta = { room, userId }
  })

  socket.on('disconnect', () => {
    rooms.find(meta.room).fetch().subscribe(room => {
      let viewerIndex = room.viewers.indexOf(meta.userId)
      room.viewers.splice(viewerIndex, 1)

      rooms.update({
        id: meta.room,
        viewers: room.viewers
      })
    })
  })
})
