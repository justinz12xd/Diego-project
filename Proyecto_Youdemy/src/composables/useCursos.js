// composables/useCursos.js - Lógica para manejo de cursos
import { ref } from 'vue'

export function useCursos() {
  const cursos = ref([])
  
  // Función para generar imagen placeholder
  const generarImagenPlaceholder = (texto, color) => {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 250
    const ctx = canvas.getContext('2d')
    
    // Fondo de color
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 400, 250)
    
    // Texto
    ctx.fillStyle = 'white'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(texto, 200, 125)
    
    return canvas.toDataURL('image/png')
  }

  // Cargar cursos desde localStorage
  const cargarCursos = () => {
    const cursosData = JSON.parse(localStorage.getItem('cursos')) || []
    cursos.value = cursosData
    return cursosData
  }

  // Obtener un curso por ID
  const obtenerCursoPorId = (id) => {
    const cursosData = cargarCursos()
    return cursosData.find(c => c.id === parseInt(id)) || null
  }

  // Guardar cursos en localStorage
  const guardarCursos = (cursosData) => {
    localStorage.setItem('cursos', JSON.stringify(cursosData))
    cargarCursos() // Actualizar la referencia reactiva
  }

  // Agregar nuevo curso
  const agregarCurso = (datosCurso) => {
    const cursosData = cargarCursos()
    const nuevoCurso = {
      id: Date.now(),
      ...datosCurso,
      imagen: datosCurso.imagen || generarImagenPlaceholder('Nuevo Curso', '#6c757d')
    }
    cursosData.push(nuevoCurso)
    guardarCursos(cursosData)
    return nuevoCurso
  }

  // Eliminar curso
  const eliminarCurso = (id) => {
    const cursosData = cargarCursos()
    const cursosActualizados = cursosData.filter(curso => curso.id !== id)
    guardarCursos(cursosActualizados)
    return true
  }

  // Inicializar cursos por defecto
  const inicializarCursosDefault = () => {
    const cursosExistentes = cargarCursos()
    
    if (cursosExistentes.length === 0) {
      const cursosDefault = [
        {
          id: 1,
          titulo: "Curso de HTML Básico",
          descripcion: "Aprende a crear páginas web con HTML desde cero. Domina las etiquetas fundamentales, estructura de documentos y mejores prácticas para el desarrollo web moderno.",
          imagen: generarImagenPlaceholder('HTML Básico', '#e74c3c'),
          videoUrl: "https://www.youtube.com/watch?v=kN1XP-Bef7w",
          contenido: ["Introducción a HTML y CSS", "Etiquetas básicas y semántica", "Formularios y tablas", "Estructura de documentos", "Mejores prácticas", "Accesibilidad web"]
        },
        {
          id: 2,
          titulo: "Curso de CSS Moderno",
          descripcion: "Domina el diseño web con estilos atractivos y modernos. Aprende Flexbox, Grid, animaciones y responsive design para crear interfaces profesionales y atractivas.",
          imagen: generarImagenPlaceholder('CSS Moderno', '#3498db'),
          videoUrl: "https://www.youtube.com/watch?v=1Rs2ND1ryYc",
          contenido: ["Selectores CSS avanzados", "Flexbox y CSS Grid", "Animaciones y transiciones", "Responsive Design", "Variables CSS y custom properties", "Metodologías CSS (BEM, OOCSS)"]
        },
        {
          id: 3,
          titulo: "JavaScript Fundamentals",
          descripcion: "Aprende los fundamentos de JavaScript, el lenguaje de programación más popular del mundo. Desde variables hasta programación orientada a objetos.",
          imagen: generarImagenPlaceholder('JavaScript', '#f39c12'),
          videoUrl: "https://www.youtube.com/watch?v=hdI2bqOjy3c",
          contenido: ["Variables y tipos de datos", "Funciones y scope", "DOM manipulation", "Eventos", "Programación asíncrona", "ES6+ características"]
        },
        {
          id: 4,
          titulo: "Vue.js para Principiantes",
          descripcion: "Descubre Vue.js, el framework progresivo de JavaScript. Aprende a crear aplicaciones web interactivas y dinámicas con una de las herramientas más populares.",
          imagen: generarImagenPlaceholder('Vue.js', '#2ecc71'),
          videoUrl: "https://www.youtube.com/watch?v=qZXt1Aom3Cs",
          contenido: ["Introducción a Vue.js", "Componentes y props", "Directivas", "Vue Router", "Vuex/Pinia", "Composition API"]
        }
      ]
      guardarCursos(cursosDefault)
    }
  }

  return {
    cursos,
    cargarCursos,
    obtenerCursoPorId,
    guardarCursos,
    agregarCurso,
    eliminarCurso,
    inicializarCursosDefault,
    generarImagenPlaceholder
  }
}
