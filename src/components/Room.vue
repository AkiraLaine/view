<template>
  <div class='wrapper'>
    <div class='column-2'>
      <div class='top-section'>
        <h4 class='logo'>View</h4>
        <span class='link'>https://view.now.sh/room/123456</span>
      </div>
    </div>
    <div class='column-1'>
      
    </div>
  </div>
</template>

<script>
  export default {
    name: 'room'
  }
</script>

<style>
.wrapper {
  background-color: #f6f6f6;
  width: 100vw;
  height: 100vh;
  padding: 2em;
  display: flex;
}
.column-1 {
  width: 33%;
  height: 100%;
  /*background-color: #666;*/
  padding: 10px;
}
.column-2 {
  width: 66%;
  height: 100%;
  /*background-color: #ccc;*/
  padding: 10px;
}
.top-section {
  width: 100%;
  display: flex;
  align-items: baseline;
}
.logo {
  font-weight: 300;
  font-size: 2em;
  letter-spacing: 2px;
  color: #E35D5B;
}
.link {
  margin-left: 5px;
  color: #E35D5B;
}
</style>
