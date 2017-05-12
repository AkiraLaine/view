<template>
  <div class='wrapper'>
    <div class='column-2'>
      <div class='top-section'>
        <h4 class='logo'>View</h4>
        <span class='link'>{{ url }}</span>
        <span class='views' v-if='Object.keys(room).length > 0'>{{ room.viewers.length }} Watching</span>
      </div>
      <div class='player' id="player"></div>
    </div>
    <div class='column-1'>
      <div class="top-section">
        <input type="text" v-model='query' @keydown.enter='loadVideo()' placeholder="Search for a video or paste a link..." class='search'>
      </div>
      <div class='container'></div>
    </div>
  </div>
</template>

<script>
  import socket from 'socket.io-client'
  const io = socket.connect('http://localhost:3000')

  export default {
    name: 'room',
    props: {
      userId: String
    },
    created () {
      this.subscribeToRoom()
    },
    mounted () {
      var tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      var firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = () => {
        this.player = new YT.Player('player', { // eslint-disable-line
          height: '430',
          width: '710',
          videoId: this.room.video.id,
          events: {
            onStateChange: this.handleStateChange
          }
        })
      }

      this.checkSeekEvent()
    },
    data () {
      return {
        room: {},
        player: {},
        seekInterval: null,
        query: ''
      }
    },
    watch: {
      'room.video.status': function () {
        if (Object.keys(this.player).length > 0 && this.player.playVideo) {
          if (this.room.video.status === 'playing') {
            this.player.playVideo()
          } else if (this.room.video.status === 'paused') {
            this.player.pauseVideo()
          }
        }
      },
      'room.video.currentTime': function (curr, prev) {
        if (Object.keys(this.player).length > 0 && this.player.seekTo) {
          if (curr > prev + 3 || curr < prev - 3) {
            this.player.seekTo(curr)
          }
        }
      },
      'room.video.id': function (curr, prev) {
        if (curr !== prev && Object.keys(this.player).length > 0 && this.player.loadVideoById) {
          this.player.loadVideoById(curr)
        }
      }
    },
    methods: {
      subscribeToRoom () {
        if (!this.$route.params.roomId) {
          // create room
          const room = {
            id: Math.round((Math.pow(36, 6 + 1) - Math.random() * Math.pow(36, 6))).toString(36).slice(1),
            viewers: [this.userId],
            playlist: [],
            video: {
              status: 'paused',
              id: 'CZlfbep2LdU',
              currentTime: 0
            }
          }
          this.$$rooms.insert(room)
            .subscribe(() => {
              this.$router.push({ path: `/room/${room.id}` })
              this.room = room
              this.watchRoom()
            })
        } else this.watchRoom()
      },
      watchRoom () {
        io.emit('join-room', { roomId: this.$route.params.roomId, userId: this.userId })
        this.$$rooms.find({ id: this.$route.params.roomId })
          .watch()
          .subscribe(room => {
            this.room = room
          })
        this.getInitialVideoState()
      },
      getInitialVideoState () {
        let checkIfEverythingReady = setInterval(() => {
          if (Object.keys(this.room).length > 0 && Object.keys(this.player).length > 0 && this.player.playVideo) {
            clearInterval(checkIfEverythingReady)
            if (this.room.video.status === 'playing') {
              if (this.room.video.currentTime > 0) {
                this.player.seekTo(this.room.video.currentTime)
              }
              this.player.playVideo()
            } else {
              if (this.room.video.currentTime > 0) {
                this.player.seekTo(this.room.video.currentTime)
              }
              this.player.pauseVideo()
            }
          }
        }, 100)
      },
      handleStateChange (event) {
        if (event.data === YT.PlayerState.PLAYING) { // eslint-disable-line
          io.emit('updatePlayerState', 'playing')
        } else if (event.data === YT.PlayerState.PAUSED)  { // eslint-disable-line
          io.emit('updatePlayerState', 'paused')
        }
      },
      checkSeekEvent () {
        let lastCurrentTime = -1

        let checkIfEverythingReady = setInterval(() => {
          if (Object.keys(this.player).length > 0 && this.player.getCurrentTime) {
            clearInterval(checkIfEverythingReady)
            this.seekInterval = setInterval(() => {
              if (lastCurrentTime !== -1) {
                const currentTime = this.player.getCurrentTime()
                if (Math.abs(currentTime - lastCurrentTime) > 3) {
                  io.emit('updateCurrentTime', currentTime)
                }
                lastCurrentTime = currentTime
              } else lastCurrentTime = this.player.getCurrentTime()
            }, 1000)
          }
        }, 100)
      },
      loadVideo () {
        if (this.query.indexOf('youtube') > -1) {
          const id = this.query.split('=')[1]
          io.emit('resetRoomData')
          this.player.loadVideoById(id)
          this.$$rooms.update({
            id: this.$route.params.roomId,
            video: {
              id
            }
          })
          this.query = ''
          io.emit('updatePlayerState', 'playing')
        }
      }
    },
    computed: {
      url () {
        if (this.$route.params.roomId) {
          return window.location.href
        }
      }
    }
  }
</script>

<style>
.wrapper {
  background-color: #f6f6f6;
  width: 100vw;
  height: 100vh;
  padding: 2em;
  display: flex;
  justify-content: space-around;
}
.column-1 {
  width: 33%;
  height: 100%;
  /*background-color: #666;*/
  padding: 10px;
  display: flex;
  flex-direction: column;
}
.column-2 {
  display: flex;
  flex-direction: column;
  width: 730px;
  height: 100%;
  /*background-color: #ccc;*/
  padding: 10px;
}
.top-section {
  width: 100%;
  display: flex;
  align-items: baseline;
  margin-bottom: 10px;
  min-height: 45px;
  max-height: 45px;
}
.logo {
  font-weight: 300;
  font-size: 2em;
  letter-spacing: 2px;
  color: #E35D5B;
}
.link {
  margin-left: 10px;
  color: #E35D5B;
  border-bottom: 1px solid #E35D5B;
  cursor: pointer;
  font-size: 0.9em;
}
.views {
  color: #E35D5B;
  margin-left: auto;
}
.player {
  box-shadow: 7px 7px 20px rgba(0,0,0,0.5);
}
.search {
  background: none;
  outline: none;
  border: none;
  border-bottom: 1px solid #E35D5B;
  width: 100%;
  padding: 10px;
  font-size: 0.9em;
  color: #E35D5B;
  box-sizing: border-box;
}
.search::placeholder {
  color: #E35D5B;
  opacity: 0.7;
}
.container {
  height: 430px;
  background-color: #fff;
}
</style>
