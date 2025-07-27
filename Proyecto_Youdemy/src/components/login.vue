<template>
  <div class="login-container">
    <main>
      <form class="formulario formulario-auth" @submit.prevent="handleLogin">
        <h2>Inicio de sesión</h2>
        <label for="correo">Correo:</label>
        <input 
          type="email" 
          id="correo" 
          v-model="correo" 
          required
          placeholder="Ingresa tu correo electrónico"
        >
        
        <label for="contrasena">Contraseña:</label>
        <input 
          type="password" 
          id="contrasena" 
          v-model="contrasena" 
          required
          placeholder="Ingresa tu contraseña"
        >
        
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <div class="botones-auth">
          <button type="submit" class="btn" :disabled="isLoading">
            {{ isLoading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
          </button>
          <button 
            type="button" 
            class="btn btn-secundario" 
            @click="goToRegister"
          >
            Registrarse
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { iniciarSesion } from '@/services/auth.js'

const router = useRouter()

// Referencias reactivas
const correo = ref('')
const contrasena = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

// Manejar el envío del formulario
const handleLogin = async () => {
  errorMessage.value = ''
  isLoading.value = true
  
  try {
    const resultado = iniciarSesion(correo.value, contrasena.value)
    
    if (resultado.success) {
      router.push('/')
    } else {
      errorMessage.value = resultado.message
    }
  } catch (error) {
    console.error('Error durante el inicio de sesión:', error)
    errorMessage.value = 'Error al iniciar sesión. Inténtalo más tarde.'
  } finally {
    isLoading.value = false
  }
}

// Navegar a la página de registro
const goToRegister = () => {
  router.push('/register')
}
</script>

<style>
@import '@/styles/auth-forms.css';
</style>