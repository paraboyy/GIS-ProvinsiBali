import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../components/Home.vue'
import HomeNologin from '../components/HomeNoLogin.vue'
import UjiHash from '../components/ujihas.vue'
import CreateRuas from '../components/CreateRuas.vue'

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
  ]
})

export default router
