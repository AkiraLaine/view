<template>
  <div>room</div>
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
