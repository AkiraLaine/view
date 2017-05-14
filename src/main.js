import Vue from 'vue'
import Horizon from 'vue-horizon'

import App from './App'
import router from './router'

const URL = process.env.NODE_ENV === 'production' ? '104.131.108.12' : 'localhost'

Vue.config.productionTip = false
Vue.use(Horizon, {
  host: `${URL}:8181`,
  models: ['rooms']
})

/* eslint-disable no-new */
new Vue({
  router,
  ...App
}).$mount('#app')
