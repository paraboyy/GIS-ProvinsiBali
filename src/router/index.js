import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../components/Home.vue'
import HomeNologin from '../components/HomeNoLogin.vue'
import UjiHash from '../components/WaitingPage.vue'
import CreateRuas from '../components/CreateRuas.vue'
import RoadTrack from '../components/RoadTracking.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'homenologin',
      component: HomeNologin
    },
    {
      path: '/homelogin',
      name: 'home',
      component: HomeView
    },
    {
      path: '/ujihash',
      name: 'ujihash',
      component: UjiHash
    },
    {
      path: '/create',
      name: 'CreateRuas',
      component: CreateRuas
    },
    {
      path: '/road',
      name: 'RoadTrack',
      component: RoadTrack
    },
  ]
})

export default router
