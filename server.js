global.WebSocket = require('ws')

const hz = new require('@horizon/client')()
const io = require('socket.io')(3000)

const rooms = hz('rooms')

const roomData = {}

io.on('connection', socket => {
  let userData = {}
  socket.on('join-room', ({ roomId, userId }) => {
    userData = { roomId, userId }
    rooms.find(roomId).fetch().subscribe(room => {
      if (room.viewers.indexOf(userId) === -1) {
        room.viewers.push(userId)

        rooms.update({
          id: userData.roomId,
          viewers: room.viewers
        })
      }
    })
  })

  socket.on('updatePlayerState', state => {
    rooms.update({
      id: userData.roomId,
      video: {
        status: state, 
      }
    })
    if (state === 'playing') {
      roomData[userData.roomId] = roomData[userData.roomId] || {}
      if (Object.keys(roomData[userData.roomId]).length === 0) {
        roomData[userData.roomId] = {
          time: 0,
          interval: null,
          playing: false
        }
      }

      if (!roomData[userData.roomId].playing) {
        roomData[userData.roomId].playing = true
        roomData[userData.roomId].interval = setInterval(() => {
          rooms.update({
            id: userData.roomId,
            video: {
              currentTime: roomData[userData.roomId].time++
            }
          })
        }, 1000)
      }

    }  else if (state === 'paused') {
      clearInterval(roomData[userData.roomId].interval)
      roomData[userData.roomId].playing = false
      rooms.update({
        id: userData.roomId,
        video: {
          currentTime: roomData[userData.roomId].time
        }
      })
    }
  })

  socket.on('disconnect', () => {
    rooms.find(userData.roomId).fetch().subscribe(room => {
      let viewerIndex = room.viewers.indexOf(userData.userId)
      room.viewers.splice(viewerIndex, 1)

      rooms.update({
        id: userData.roomId,
        viewers: room.viewers
      })
    })
  })
})
