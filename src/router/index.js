import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../components/Home.vue'
import HomeNologin from '../components/HomeNoLogin.vue'
import Waiting from '../components/WaitingPage.vue'
import CreateRuas from '../components/CreateRuas.vue'
import RoadTrack from '../components/RoadTracking.vue'
import Uji from '../components/ujihas.vue'

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
      path: '/waiting',
      name: 'WaitingPage',
      component: Waiting
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
    {
      path: '/uji',
      name: 'Uji',
      component: Uji
    },
  ]
})

export default router
