<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'app',
    data () {
      return {
        userId: null
      }
    },
    mounted () {
      this.userId = window.localStorage.getItem('userId')
      if (!this.userId) {
        const uuid = ((((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) + (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1))
        window.localStorage.setItem('userId', uuid)
      }
    }
  }
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Open+Sans');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body { 
  font-family: 'Open Sans', sans-serif;
}
</style>
