import Vue from 'vue'
import Horizon from 'vue-horizon'

import App from './App'
import router from './router'

Vue.config.productionTip = false
Vue.use(Horizon, { host: '127.0.0.1:8181' })

/* eslint-disable no-new */
new Vue({
  router,
  ...App
}).$mount('#app')
