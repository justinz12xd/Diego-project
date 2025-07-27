// Servicio de eventos para comunicación entre componentes
import { ref } from 'vue'

// Estado reactivo compartido para inscripciones
export const inscripcionesActualizadas = ref(0)

// Función para actualizar el contador de inscripciones
export const actualizarContadorInscripciones = (email) => {
  if (!email) return
  
  const inscripciones = JSON.parse(localStorage.getItem(`inscripciones_${email}`)) || []
  inscripcionesActualizadas.value = inscripciones.length
}

// Función para obtener el número actual de inscripciones
export const obtenerNumeroInscripciones = (email) => {
  if (!email) return 0
  
  const inscripciones = JSON.parse(localStorage.getItem(`inscripciones_${email}`)) || []
  return inscripciones.length
}

// Función para notificar cambios en inscripciones
export const notificarCambioInscripcion = (email) => {
  actualizarContadorInscripciones(email)
}
