<template>
  <div class="register-view">
    <div class="register-container">
      <main>
        <form class="formulario formulario-auth" @submit.prevent="handleRegister">
          <h2>Crear cuenta</h2>
          <label for="nombre">Nombre completo:</label>
          <input 
            type="text" 
            id="nombre" 
            v-model="nombre" 
            required
            placeholder="Ingresa tu nombre completo"
          >

          <label for="correo">Correo electrónico:</label>
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

          <label for="confirmarContrasena">Confirmar contraseña:</label>
          <input 
            type="password" 
            id="confirmarContrasena" 
            v-model="confirmarContrasena" 
            required
            placeholder="Confirma tu contraseña"
          >
          
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>
          
          <div class="botones-auth">
            <button type="submit" class="btn" :disabled="isLoading">
              {{ isLoading ? 'Creando cuenta...' : 'Crear cuenta' }}
            </button>
            <button 
              type="button" 
              class="btn btn-secundario" 
              @click="goToLogin"
            >
              Ya tengo cuenta
            </button>
          </div>
        </form>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { registrarUsuario } from '@/services/auth.js'

const router = useRouter()

// Referencias reactivas
const nombre = ref('')
const correo = ref('')
const contrasena = ref('')
const confirmarContrasena = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

// Manejar el envío del formulario
const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true
  
  try {
    // Validación de confirmación de contraseña
    if (contrasena.value !== confirmarContrasena.value) {
      errorMessage.value = 'Las contraseñas no coinciden.'
      return
    }

    // Llamar al servicio de registro
    const resultado = registrarUsuario(nombre.value, correo.value, contrasena.value)

    if (resultado.success) {
      successMessage.value = 'Cuenta creada exitosamente. Redirigiendo al login...'
      
      // Limpiar formulario
      nombre.value = ''
      correo.value = ''
      contrasena.value = ''
      confirmarContrasena.value = ''
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      errorMessage.value = resultado.message
    }
  } catch (error) {
    console.error('Error en registro:', error)
    errorMessage.value = 'Error al registrar usuario. Inténtalo más tarde.'
  } finally {
    isLoading.value = false
  }
}

// Navegar a la página de login
const goToLogin = () => {
  router.push('/login')
}
</script>

<style>
@import '@/styles/auth-forms.css';

.register-view {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 1rem;
  box-sizing: border-box;
  overflow-y: auto;
}
</style>
