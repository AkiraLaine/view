<template>
  <div id="app">
    <transition name='slide'>
      <router-view :userId='userId'></router-view>
    </transition>
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
  overflow: hidden;
}

.slide-enter-active, .slide-leave-active {
  transition: all 0.5s ease
}
.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0
}
.footer {
  display: flex;
  flex-direction: column;
  text-align: center;
  font-size: 0.8em;
  color: #eee;
  width: 100%;
  margin-bottom: 10px;
}
.footer a {
  color: #fff;
  text-decoration: none;
}
.footer a:hover {
  text-decoration: underline;
}
</style>
