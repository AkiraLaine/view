<template>
  <div class='wrapper'>
    <div class='navbar'>
      <div class="navbar-container">
        <h4 class='logo'>View</h4>
        <button class='button link' style="margin-left:auto" :data-clipboard-text='url'>
          Copy URL
          <div class='copied' ref='copied'></div>
        </button>
      </div>
    </div>
    <div class="container">
      <div class='notification-chip' v-show='showNotification'>{{ notificationText }}</div>
      <div class="video-container">
        <span class='usercount' v-if='userCount'>Users in room: <span style='color:#E35D5B;font-weight:600'>{{ userCount }}</span></span>
        <div class='player' id="player"></div>
      </div>
      <div class='sidecard'>
        <div class='no-queue' v-if='Object.keys(room).length > 0 && !room.queue.length'>
          <div class='info'>There are currently no queued videos</div>
          <button class='button accent' @click='searchIsActive = true'>Search for videos</button>
        </div>
        <div style='height:430px;position:relative' v-else-if='Object.keys(room).length > 0 && room.queue.length'>
          <div class="info" style="margin-bottom:0">Queue</div>
          <img @click='searchIsActive = true' style="cursor:pointer;width:20px;position:absolute;top:3px;right:10px;" src="../assets/search.png">
          <div class='result-container' style="height:100%;padding-bottom:25px">
            <div class="item" v-for='(item, index) in queue' v-if='queue.length > 0' :key='index' @click='loadVideo(item.id.videoId)'>
              <div class='remove' @click.stop='removeVideoFromQueue(item)'>x</div>
              <img :src="item.snippet.thumbnails.medium.url">
              <div class='item-details'>
                <div class='title'>{{ item.snippet.title }}</div>
                <div class='channel'>{{ item.snippet.channelTitle }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class='search-container' :class='{"slide": searchIsActive}'>
          <div class='input-container'>
            <input type="text" class='search' v-model='query' @keydown.enter='search()' placeholder="Search for a video or paste a URL...">
            <div class='close' @click='searchIsActive = false'>&#x2715;</div>
          </div>
          <div class='result-container'>
            <div class="item" v-for='(item, index) in results' v-if='results.length > 0' :key='index' @click='loadVideo(item.id.videoId)'>
              <img :src="item.snippet.thumbnails.medium.url">
              <div class='item-details'>
                <div class='title'>{{ item.snippet.title }}</div>
                <div class='channel'>{{ item.snippet.channelTitle }}</div>
                <span class="add-to-queue" @click.stop='addVideoToQueue(item)'>+ Add to queue</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class='footer'>
        <span>Made by <a href="https://akiralaine.github.io" target="_blank">Akira</a> and <a href="https://simulatedgreg.github.io" target="_blank">Greg</a></span>
        <span>Check out the code on <a href="https://github.com/AkiraLaine/view" target="_blank">GitHub</a></span>
      </div>
    </div>
  </div>
</template>

<script>
  import Clipboard from 'clipboard'
  import queryString from 'query-string'
  import io from 'socket.io-client'
  const socket = process.env.NODE_ENV === 'production' ? io() : io(`http://localhost:3000`)

  export default {
    name: 'room',
    props: {
      userId: String
    },
    created () {
      this.initSocketListeners()
      this.getRoomData()
    },
    mounted () {
      var tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      var firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = () => {
        let interval = setInterval(() => {
          if (Object.keys(this.room).length > 0) {
            clearInterval(interval)
            this.player = new YT.Player('player', { // eslint-disable-line
              height: '100%',
              width: '100%',
              videoId: this.room.video.id,
              playerVars: {
                rel: 0
              },
              events: {
                onStateChange: this.handleStateChange
              }
            })
          }
        }, 100)
      }

      const clipboard = new Clipboard('.link') // eslint-disable-line
      clipboard.on('success', e => {
        this.$refs.copied.classList.add('show')
        setTimeout(() => {
          this.$refs.copied.classList.remove('show')
        }, 3000)

        e.clearSelection()
      })

      this.checkSeekEvent()
    },
    data () {
      return {
        room: {},
        player: {},
        seekInterval: null,
        query: '',
        results: [],
        searchIsActive: false,
        showNotification: false,
        notificationText: ''
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
      initSocketListeners () {
        socket.on('updatedData', room => {
          console.log(room)
          if (room.id === this.$route.params.roomId) this.room = room
        })
      },
      getRoomData () {
        if (!this.$route.params.roomId) {
          // create room
          const room = {
            id: Math.round((Math.pow(36, 6 + 1) - Math.random() * Math.pow(36, 6))).toString(36).slice(1),
            viewers: [this.userId],
            queue: [],
            video: {
              status: 'paused',
              id: 'CZlfbep2LdU',
              currentTime: 0
            }
          }
          socket.emit('createRoom', room)
          this.$router.push({ path: `/room/${room.id}` })
        } else {
          socket.emit('joinRoom', { roomId: this.$route.params.roomId, userId: this.userId })
          this.getInitialVideoState()
        }
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
          if (Object.keys(this.room).length > 0 && this.room.video.status !== 'playing') {
            socket.emit('updatePlayerState', 'playing')
          }
        } else if (event.data === YT.PlayerState.PAUSED)  { // eslint-disable-line
          socket.emit('updatePlayerState', 'paused')
        } else if (event.data === YT.PlayerState.ENDED) { // eslint-disable-line
          if (Object.keys(this.room).length > 0 && this.room.queue.length > 0) {
            const nextVideo = this.room.queue[0]
            this.loadVideo(nextVideo.id.videoId)
            socket.emit('removeVideoFromQueue', nextVideo.id.videoId, true)
          }
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
                  socket.emit('updateCurrentTime', currentTime)
                }
                lastCurrentTime = currentTime
              } else lastCurrentTime = this.player.getCurrentTime()
            }, 1000)
          }
        }, 100)
      },
      search () {
        const params = {
          part: 'snippet',
          q: this.query,
          key: require('@/keys').YOUTUBE_API_KEY,
          type: 'video',
          maxResults: 10
        }
        fetch(`https://www.googleapis.com/youtube/v3/search?${queryString.stringify(params)}`)
          .then(response => {
            response.json()
              .then(data => {
                this.results = data.items
              })
          })
      },
      loadVideo (id) {
        socket.emit('trackNewVideo', id)
        this.player.loadVideoById(id)
        this.query = ''
        socket.emit('updatePlayerState', 'playing')
      },
      addVideoToQueue (item) {
        const video = this.room.queue.find(video => video.id.videoId === item.id.videoId) || {}
        if (Object.keys(video).length === 0) {
          socket.emit('addVideoToQueue', item)
          this.showNotification = true
          this.notificationText = 'Video added to queue'
          setTimeout(() => {
            this.showNotification = false
            this.notificationText = ''
          }, 1000)
        } else {
          this.showNotification = true
          this.notificationText = 'Video already in queue'
          setTimeout(() => {
            this.showNotification = false
            this.notificationText = ''
          }, 1000)
        }
      },
      removeVideoFromQueue (video) {
        socket.emit('removeVideoFromQueue', video.id.videoId, false)
      }
    },
    computed: {
      url () {
        if (this.$route.params.roomId) {
          return window.location.href
        }
      },
      queue () {
        if (Object.keys(this.room).length > 0) {
          return this.room.queue
        }
      },
      userCount () {
        if (Object.keys(this.player).length > 0 && Object.keys(this.room).length > 0) {
          return this.room.viewers.length
        }
      }
    }
  }
</script>

<style scoped>
.wrapper {
  background-color: #f6f6f6;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.navbar {
  width: 100%;
  height: 80px;
  background-color: #E35D5B;
}
.navbar-container {
  height: 80px;
  width: 80%;
  display: flex;
  align-items: center;
  margin: 0 auto;
}
.logo {
  font-weight: 300;
  font-size: 1.5em;
  letter-spacing: 2px;
  color: #fff;
}
.button {
  background: none;
  border: none;
  outline: none;
  border: 1px solid #fff;
  color: #fff;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}
.button:hover {
  background: rgba(255,255,255,0.1)
}
.button.accent {
  border: 1px solid #E35D5B;
  color: #E35D5B;
}
.button.accent:hover {
  background: #E35D5B;
  color: #fff;
}
.container {
  display: flex;
  flex-wrap: wrap;
  margin: 0 auto;
  width: 80%;
  height: 100%;
  padding-top: 40px;
}
.video-container {
  position: relative;
  margin-right: 20px;
  width: 710px;
  height: 430px;
}
.usercount {
  position: absolute;
  top: -25px;
  right: 0;
  font-size: 0.9em;
  font-weight: 300;
}
.sidecard {
  min-width: 400px;
  width: 400px;
  height: 430px;
  background-color: #fff;
  box-shadow: 7px 7px 18px rgba(0,0,0,0.3);
  overflow-y: hidden;
}
.no-queue {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px;
}
.info {
  font-weight: 600;
  font-size: 1.2em;
  color: #ccc;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 20px;
}
.search-container {
  background-color: #fff;
  transform: translateY(100%);
  transition: all 0.3s ease;
}
.search-container.slide {
  transform: translateY(-100%);
}
.input-container {
  display: flex;
}
.search {
  background: none;
  outline: none;
  border: none;
  border-bottom: 2px solid #E35D5B;
  width: 100%;
  padding: 13px;
  font-size: 0.9em;
  color: #E35D5B;
  box-sizing: border-box;
}
.search::placeholder {
  color: #E35D5B;
  opacity: 0.7;
}
.close {
  min-width: 45px;
  min-height: 45px;
  max-width: 45px;
  max-height: 45px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #E35D5B;
  color: #fff;
  cursor: pointer;
}
.result-container {
  width: 100%;
  height: 385px;
  overflow-x: hidden;
  overflow-y: hidden;
}
.result-container:hover {
  overflow-y: auto;
}
.result-container::-webkit-scrollbar {
  width: 7px;
}
.result-container::-webkit-scrollbar-track {
  background: transparent;
}
.result-container::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 10px;
}
.item {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 10px;
  position: relative;
}
.item:hover {
  background-color: #eee;
  cursor: pointer;
}
.item:hover .remove {
  visibility: visible;
}
.item .item-details {
  display:flex;
  flex-direction:column;
  margin-left:10px
}
.item img {
  width: 168px;
  height: 94px;
}
.item .title {
  max-width: 200px;
  font-size: 0.9em;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #333;
}
.item .channel {
  font-size: 0.7em;
  text-transform: uppercase;
  max-width: 200px;
}
.item .add-to-queue {
  font-size: 0.7em;
  color: #E35D5B;
  border: 1px solid #E35D5B;
  padding: 3px 6px;
  margin-top: 10px;
  width: 95px;
  transition: all 0.3s ease;
}
.item .add-to-queue:hover {
  background-color: #E35D5B;
  color: #fff;
}
.item .remove {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #999;
  cursor: pointer;
  font-weight: 600;
  visibility: hidden;
}
.item .remove:hover {
  color: #666;
}
.copied {
  opacity: 0;
  transition: all 0.3s ease;
}
.copied.show {
  opacity: 1;
}
.copied.show::before {
  content: '';
  width: 10px;
  height: 10px;
  position: absolute;
  background: #fff;
  top: 12px;
  right: -15px;
  transform: rotate(45deg);
}
.copied.show::after {
  content: 'Copied!';
  position: absolute;
  padding: 5px;
  top: 5px;
  right: -61px;
  color: #E35D5B;
  background: #fff;
  border-radius: 5px;
  font-size: 0.9em;
}
.footer {
  color: #333;
  margin-top: auto;
}
.footer a {
  color: #555;
}
.footer a:hover {
  text-decoration: underline;
}
.notification-chip {
  padding: 8px 13px;
  position: absolute;
  top: 6em;
  right: 3em;
  background-color: rgba(0,0,0,0.9);
  color: #eee;
  z-index: 10;
}
@media (max-width: 1412px) {
  .wrapper {
    padding-bottom: 20px;
  }
  .video-container {
    width: 100%;
    height: 400px;
    margin-right: 0;
  }
  .sidecard {
    margin: 20px 0;
    min-width: 0;
    width: 100%;
  }
  .item {
    flex-direction: column;
  }
  .item-details {
    align-items: center;
    margin-left: 0 !important;
  }
  .item .title, .item .channel {
    max-width: 280px;
  }
}
</style>
