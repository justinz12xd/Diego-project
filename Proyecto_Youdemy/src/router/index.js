import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import { requireAuth, requireProfesor, requireEstudiante, redirectByRole } from '@/middleware/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      beforeEnter: redirectByRole
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      beforeEnter: requireProfesor
    },
    {
      path: '/cursos',
      name: 'cursos',
      redirect: '/admin'
    },
    {
      path: '/estudiante',
      name: 'estudiante',
      component: () => import('../views/StudentView.vue'),
      beforeEnter: requireEstudiante
    },
    {
      path: '/curso/:id',
      name: 'curso-detail',
      component: () => import('../views/CourseDetailView.vue'),
      beforeEnter: requireAuth
    },
  ]
})

export default router
