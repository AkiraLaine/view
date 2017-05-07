<template>
  <div id="home">
    <h1>View</h1>
    <p>Watch YouTube together with your friends</p>
    <router-link :to="{ path: '/room' }" class="btn">Create Room</router-link>
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
    align-items: center;
    background: #e35d5b;
    color: rgba(#fff, .9);
    display: flex;
    flex-direction: column;
    height: 100vh;
    justify-content: center;
    width: 100vw;
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
