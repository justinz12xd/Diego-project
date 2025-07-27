// composables/useTareas.js - Lógica para manejo de tareas

export function useTareas(usuario) {
  // Subir archivo de tarea
  const subirTarea = (file, cursoId) => {
    return new Promise((resolve, reject) => {
      if (!usuario.value) {
        reject('Usuario no autenticado')
        return
      }

      if (file.type !== 'application/pdf') {
        reject('Solo se permiten archivos PDF')
        return
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB límite
        reject('El archivo es demasiado grande. Máximo 10MB.')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const tarea = {
          nombre: file.name,
          fecha: new Date().toISOString(),
          contenido: e.target.result, // Base64
          tamaño: file.size
        }
        
        // Guardar tarea
        const tareasKey = `tareas_${usuario.value.correo}_${cursoId}`
        const tareasExistentes = JSON.parse(localStorage.getItem(tareasKey)) || []
        tareasExistentes.push(tarea)
        localStorage.setItem(tareasKey, JSON.stringify(tareasExistentes))
        
        resolve(tarea)
      }
      
      reader.onerror = () => reject('Error al leer el archivo')
      reader.readAsDataURL(file)
    })
  }

  // Obtener tareas de un curso
  const obtenerTareas = (cursoId) => {
    if (!usuario.value) return []
    const tareasKey = `tareas_${usuario.value.correo}_${cursoId}`
    return JSON.parse(localStorage.getItem(tareasKey)) || []
  }

  // Eliminar tarea
  const eliminarTarea = (cursoId, tareaIndex) => {
    if (!usuario.value) return false
    
    const tareasKey = `tareas_${usuario.value.correo}_${cursoId}`
    const tareas = JSON.parse(localStorage.getItem(tareasKey)) || []
    tareas.splice(tareaIndex, 1)
    localStorage.setItem(tareasKey, JSON.stringify(tareas))
    return true
  }

  // Formatear fecha
  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO)
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return {
    subirTarea,
    obtenerTareas,
    eliminarTarea,
    formatearFecha
  }
}
