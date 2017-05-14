<template>
  <div id='home'>
    <div class='wrapper'>
      <h1>View</h1>
      <p>Watch YouTube videos together with your friends</p>
      <router-link :to="{ path: '/room' }" class="btn">Create Room</router-link>
    </div>
    <div class='footer'>
      <span>Made by <a href="https://akiralaine.github.io" target='_blank'>Akira</a> and <a href="https://simulatedgreg.github.io" target='_blank'>Greg</a></span>
      <span>Check out the code on <a href="https://github.com/AkiraLaine/view" target='_blank'>GitHub</a></span>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'home'
  }
</script>

<style lang="scss" scoped>
  h1 {
    font: {
      family: monospace;
      size: 3.75em;
    }
  }

  p { margin-bottom: 1.5em; }

  #home {
    background: #e35d5b;
    color: rgba(#fff, .9);
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .btn {
    border: 1px solid rgba(#fff, .9);
    color: rgba(#fff, .9);
    cursor: pointer;
    font: {
      family: monospace;
      size: 1.4em;
    }
    padding: 16px 20px;
    text-decoration: none;
    transition: all 200ms ease-in-out;

    &:hover {
      background: rgba(#fff, .15);
    }
  }
</style>
