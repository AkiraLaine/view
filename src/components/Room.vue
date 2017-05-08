<template>
  <div class='wrapper'>
    <div class='column-2'>
      <div class='top-section'>
        <h4 class='logo'>View</h4>
        <span class='link'>https://view.now.sh/room/123456</span>
        <span class='views' v-if='Object.keys(room).length > 0'>{{ room.viewers.length }} Watching</span>
      </div>
      <div class='player' id="player"></div>
    </div>
    <div class='column-1'>
      <div class="top-section">
        <input type="text" placeholder="Search for a video or paste a link..." class='search'>
      </div>
      <div class='container'></div>
    </div>
  </div>
</template>

<script>
  import socket from 'socket.io-client'

  export default {
    name: 'room',
    props: {
      userId: String
    },
    mounted () {
      this.subscribeToRoom()

      let tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      let firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = () => { // eslint-disable-line
        this.player = new YT.Player('player', { // eslint-disable-line
          height: '430',
          width: '710',
          videoId: this.room.video.id,
          events: {
            onStateChange: this.handleStateChange
          }
        })
      }

      window.onunload = () => {
        if (Object.keys(this.room).length > 0) {
          let viewerIndex = this.room.viewers.indexOf(this.userId)
          this.room.viewers.splice(viewerIndex, 1)
          this.$$rooms.update({
            id: this.$route.params.roomId,
            viewers: this.room.viewers
          })
        }
      }
    },
    data () {
      return {
        room: {},
        player: {},
        durationInterval: null
      }
    },
    watch: {
      'room.viewers': function () {
        if (this.room.viewers.indexOf(this.userId) === -1) {
          this.$$rooms.update({
            id: this.$route.params.roomId,
            viewers: [...this.room.viewers, this.userId]
          })
        }
      },
      'room.video.status': function () {
        if (Object.keys(this.player).length && this.player.playVideo) {
          if (this.room.video.status === 'playing') {
            this.player.playVideo()
          } else if (this.room.video.status === 'paused') {
            this.player.pauseVideo()
          }
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
        const io = socket.connect('http://localhost:3000')
        io.emit('join-room', { room: this.$route.params.roomId, userId: this.userId })
        this.$$rooms.find({ id: this.$route.params.roomId })
          .fetch()
          .subscribe(room => {
            if (room.video.currentTime > 0) {
              let interval = setInterval(() => {
                if (this.player.playVideo) {
                  clearInterval(interval)
                  this.player.seekTo(room.video.currentTime)
                  if (room.video.status === 'paused') this.player.pauseVideo()
                }
              }, 100)
            }
          })
        this.$$rooms.find({ id: this.$route.params.roomId })
          .watch()
          .subscribe(room => {
            this.room = room
          })
      },
      handleStateChange (event) {
        // this.player.seekTo(this.room.video.currentTime)
        if (event.data === YT.PlayerState.PLAYING) { // eslint-disable-line
          this.$$rooms.update({
            id: this.$route.params.roomId,
            video: {
              status: 'playing'
            }
          })
          this.durationInterval = setInterval(() => {
            console.log('update')
            this.$$rooms.update({
              id: this.$route.params.roomId,
              video: {
                currentTime: this.player.getCurrentTime()
              }
            })
          }, 1000)
        } else if (event.data === YT.PlayerState.PAUSED)  { // eslint-disable-line
          clearInterval(this.durationInterval)
          this.$$rooms.update({
            id: this.$route.params.roomId,
            video: {
              status: 'paused'
            }
          })
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
