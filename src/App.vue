<template>
  <div id="app">
    <router-view :userId='userId'></router-view>
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
    created () {
      this.userId = window.localStorage.getItem('userId')
      if (!this.userId) {
        const uuid = Math.round((Math.pow(36, 6 + 1) - Math.random() * Math.pow(36, 6))).toString(36).slice(1)
        this.userId = uuid
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
