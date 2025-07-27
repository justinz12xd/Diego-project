// middleware/auth.js - Middleware de autorización
import { obtenerUsuarioActual, esProfesor, esEstudiante } from '@/services/auth'

// Middleware para rutas que requieren autenticación
export function requireAuth(to, from, next) {
  const usuario = obtenerUsuarioActual()
  
  if (!usuario) {
    next('/login')
  } else {
    next()
  }
}

// Middleware para rutas exclusivas de profesor
export function requireProfesor(to, from, next) {
  const usuario = obtenerUsuarioActual()
  
  if (!usuario) {
    next('/login')
  } else if (!esProfesor()) {
    // Si no es profesor, redirigir a vista de estudiante
    next('/estudiante')
  } else {
    next()
  }
}

// Middleware para rutas exclusivas de estudiante
export function requireEstudiante(to, from, next) {
  const usuario = obtenerUsuarioActual()
  
  if (!usuario) {
    next('/login')
  } else if (!esEstudiante()) {
    // Si no es estudiante, redirigir a vista de profesor
    next('/admin')
  } else {
    next()
  }
}

// Middleware para redirigir según el rol después del login
export function redirectByRole(to, from, next) {
  const usuario = obtenerUsuarioActual()
  
  if (!usuario) {
    next('/login')
  } else if (esProfesor()) {
    next('/admin')
  } else if (esEstudiante()) {
    next('/estudiante')
  } else {
    next('/login')
  }
}
