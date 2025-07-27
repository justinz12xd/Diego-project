// composables/useUtils.js - Utilidades generales
export function useUtils() {
  // Truncar texto
  const truncarTexto = (texto, limite = 80) => {
    if (!texto || texto.length <= limite) return texto
    return texto.substring(0, limite).trim() + '...'
  }

  // Validar URL de YouTube
  const validarUrlYoutube = (url) => {
    if (!url) return true // Es opcional
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    return regex.test(url)
  }

  // Validar campos requeridos
  const validarCamposRequeridos = (campos) => {
    return campos.every(campo => campo && campo.trim().length > 0)
  }

  // Procesar contenido de curso (convertir string a array)
  const procesarContenidoCurso = (contenido) => {
    if (typeof contenido === 'string') {
      return contenido.split(',').map(item => item.trim()).filter(item => item.length > 0)
    }
    return contenido || []
  }

  // Mostrar confirmación
  const confirmar = (mensaje) => {
    return confirm(mensaje)
  }

  // Mostrar alerta
  const alerta = (mensaje) => {
    alert(mensaje)
  }

  return {
    truncarTexto,
    validarUrlYoutube,
    validarCamposRequeridos,
    procesarContenidoCurso,
    confirmar,
    alerta
  }
}
