// composables/useInscripciones.js - Lógica para manejo de inscripciones
import { ref, computed } from 'vue'
import { notificarCambioInscripcion } from '@/services/events'

export function useInscripciones(usuario) {
  const inscripciones = ref([])
  
  // Cargar inscripciones del usuario
  const cargarInscripciones = () => {
    if (!usuario.value) return []
    const inscripcionesData = JSON.parse(localStorage.getItem(`inscripciones_${usuario.value.correo}`)) || []
    inscripciones.value = inscripcionesData
    return inscripcionesData
  }

  // Guardar inscripciones
  const guardarInscripciones = (nuevasInscripciones) => {
    if (!usuario.value) return
    localStorage.setItem(`inscripciones_${usuario.value.correo}`, JSON.stringify(nuevasInscripciones))
    inscripciones.value = nuevasInscripciones
    notificarCambioInscripcion(usuario.value.correo)
  }

  // Verificar si está inscrito a un curso
  const estaInscrito = (cursoId) => {
    return inscripciones.value.includes(cursoId)
  }

  // Inscribirse a un curso
  const inscribirse = (cursoId) => {
    if (!estaInscrito(cursoId)) {
      const nuevasInscripciones = [...inscripciones.value, cursoId]
      guardarInscripciones(nuevasInscripciones)
      return true
    }
    return false
  }

  // Desinscribirse de un curso
  const desinscribirse = (cursoId) => {
    const nuevasInscripciones = inscripciones.value.filter(id => id !== cursoId)
    guardarInscripciones(nuevasInscripciones)
    
    // También eliminar tareas asociadas
    if (usuario.value) {
      localStorage.removeItem(`tareas_${usuario.value.correo}_${cursoId}`)
    }
    
    return true
  }

  // Obtener cursos inscritos
  const obtenerCursosInscritos = (todosCursos) => {
    return computed(() => {
      return todosCursos.filter(curso => inscripciones.value.includes(curso.id))
    })
  }

  return {
    inscripciones,
    cargarInscripciones,
    estaInscrito,
    inscribirse,
    desinscribirse,
    obtenerCursosInscritos
  }
}
