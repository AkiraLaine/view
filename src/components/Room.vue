<template>
  <div class='wrapper'>
    <div class='column-2'>
      <div class='top-section'>
        <h4 class='logo'>View</h4>
        <span class='link'>https://view.now.sh/room/123456</span>
        <span class='views'>7 Watching</span>
      </div>
      <div class='video-container'></div>
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
  export default {
    name: 'room',
    mounted () {
      this.subscribeToRoom()
    },
    beforeRouteUpdate (to, from, next) {
      next()
      this.subscribeToRoom()
    },
    methods: {
      subscribeToRoom () {
        if (!this.$route.params.roomId) {
          // create room
          this.$$rooms.insert({
            viewers: [this.$root.userId],
            playlist: [],
            player: {
              status: 'paused',
              currentVideo: '',
              time: 0
            }
          }).subscribe(
            ({ id }) => {
              this.$router.push({ path: `/room/${id}` })
            }
          )
        } else {
          // load room
          this.$$rooms.find({ id: this.$route.params.roomId })
            .watch()
            .subscribe(room => {
              this.room = room
            })
        }
      }
    },
    data () {
      return {
        room: {}
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
  width: 800px;
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
.video-container {
  width: 100%;
  height: 430px;
  background-color: #999;
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