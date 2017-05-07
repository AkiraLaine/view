import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: require('@/components/Home')
    },
    {
      path: '/room/:roomId',
      name: 'room',
      component: require('@/components/Room')
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
