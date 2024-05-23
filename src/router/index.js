import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../components/Home.vue'
import HomeNologin from '../components/HomeNoLogin.vue'

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
  ]
})

export default router
