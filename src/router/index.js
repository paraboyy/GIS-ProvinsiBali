import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../components/Home.vue'
import HomeNologin from '../components/HomeNoLogin.vue'
import Waiting from '../components/WaitingPage.vue'
import CreateRuas from '../components/CreateRuas.vue'
import RoadTrack from '../components/RoadTracking.vue'
import DataJalan from '../components/DataJalan.vue'
import EditRuasJalan from '../components/EditRuasJalan.vue'
import Home2 from '../components/Home-2.vue'
import Register from '../components/Register.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/home',
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
      path: '/data',
      name: 'DataJalan',
      component: DataJalan
    },
    {
      path: '/editruasjalan',
      name: 'EditRuasJalan',
      component: EditRuasJalan
    },
    {
      path: '/',
      name: 'Home-2',
      component: Home2
    },
    {
      path: '/register',
      name: 'Register',
      component: Register
    },
  ]
})

export default router
