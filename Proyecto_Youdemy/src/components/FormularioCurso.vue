<template>
  <div class="formulario-curso">
    <h3>{{ titulo }}</h3>
    
    <form @submit.prevent="handleSubmit">
      <div class="campo-grupo">
        <label for="titulo">Título del curso *</label>
        <input 
          id="titulo"
          v-model="formData.titulo" 
          type="text" 
          placeholder="Ej: Curso de React.js para Principiantes" 
          required
        >
      </div>

      <div class="campo-grupo">
        <label for="descripcion">Descripción *</label>
        <textarea 
          id="descripcion"
          v-model="formData.descripcion" 
          placeholder="Describe qué aprenderán los estudiantes en este curso..." 
          rows="3"
          required
        ></textarea>
      </div>

      <div class="campo-grupo">
        <label for="imagen">Imagen del curso</label>
        <div class="imagen-options">
          <div class="upload-option">
            <label for="imagen-file" class="upload-label">
              📁 Subir imagen desde tu computadora
            </label>
            <input 
              id="imagen-file"
              type="file" 
              accept="image/*"
              @change="handleImageUpload"
              class="file-input"
            >
            <small class="file-help">Formatos: JPG, PNG, GIF (máx. 5MB)</small>
          </div>
        </div>
        
        <!-- Vista previa de la imagen -->
        <div v-if="imagenPreview" class="imagen-preview">
          <p><strong>Vista previa:</strong></p>
          <img :src="imagenPreview" alt="Vista previa" class="preview-img">
          <button type="button" @click="limpiarImagen" class="btn-limpiar">❌ Quitar imagen</button>
        </div>
      </div>

      <div class="campo-grupo">
        <label for="videoUrl">URL del video de YouTube</label>
        <input 
          id="videoUrl"
          v-model="formData.videoUrl" 
          type="url" 
          placeholder="https://www.youtube.com/watch?v=..."
          class="input-youtube"
        >
        <div class="youtube-tips">
          <p><strong>💡 Tips para YouTube:</strong></p>
          <ul>
            <li>Copia la URL directamente desde YouTube</li>
            <li>Funciona con youtu.be y youtube.com</li>
            <li>Ejemplo: https://www.youtube.com/watch?v=abc123</li>
          </ul>
        </div>
      </div>

      <div class="campo-grupo">
        <label for="contenido">Contenido del curso *</label>
        <textarea 
          id="contenido"
          v-model="formData.contenido" 
          placeholder="Separar cada tema con coma. Ej: Introducción, Variables, Funciones, Proyectos prácticos" 
          rows="4" 
          required
        ></textarea>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">{{ textoBoton }}</button>
        <button type="button" @click="$emit('cancelar')" class="btn btn-secundario">Cancelar</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useUtils } from '@/composables/useUtils'

const props = defineProps({
  titulo: {
    type: String,
    default: 'Nuevo curso'
  },
  textoBoton: {
    type: String,
    default: 'Guardar Curso'
  },
  datosIniciales: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['enviar', 'cancelar'])

const { validarUrlYoutube, alerta } = useUtils()

const formData = ref({
  titulo: '',
  descripcion: '',
  imagen: '',
  videoUrl: '',
  contenido: '',
  ...props.datosIniciales
})

const imagenPreview = ref('')

// Watch para actualizar vista previa cuando cambia la imagen
watch(() => formData.value.imagen, (newValue) => {
  if (newValue && (newValue.startsWith('http') || newValue.startsWith('data:'))) {
    imagenPreview.value = newValue
  } else if (!newValue) {
    imagenPreview.value = ''
  }
})

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validar tipo de archivo
  if (!file.type.startsWith('image/')) {
    alerta('Por favor selecciona un archivo de imagen válido')
    return
  }

  // Validar tamaño (5MB máximo)
  if (file.size > 5 * 1024 * 1024) {
    alerta('La imagen es muy grande. El tamaño máximo es 5MB.')
    return
  }

  // Convertir a base64 para almacenar localmente
  const reader = new FileReader()
  reader.onload = (e) => {
    const imageDataUrl = e.target.result
    formData.value.imagen = imageDataUrl
    imagenPreview.value = imageDataUrl
  }
  reader.readAsDataURL(file)
}

const limpiarImagen = () => {
  formData.value.imagen = ''
  imagenPreview.value = ''
  // Limpiar el input de archivo
  const fileInput = document.getElementById('imagen-file')
  if (fileInput) fileInput.value = ''
}

const handleSubmit = () => {
  const { titulo, descripcion, contenido, videoUrl } = formData.value

  if (!titulo || !descripcion || !contenido) {
    alerta('Por favor completa todos los campos obligatorios.')
    return
  }

  // Validar URL de YouTube si se proporciona
  if (videoUrl && !validarUrlYoutube(videoUrl)) {
    alerta('Por favor ingresa una URL válida de YouTube')
    return
  }

  emit('enviar', { ...formData.value })
}

// Función para limpiar el formulario
const limpiarFormulario = () => {
  formData.value = {
    titulo: '',
    descripcion: '',
    imagen: '',
    videoUrl: '',
    contenido: ''
  }
  imagenPreview.value = ''
  const fileInput = document.getElementById('imagen-file')
  if (fileInput) fileInput.value = ''
}

// Exponer función para limpiar desde el componente padre
defineExpose({
  limpiarFormulario
})
</script>

<style scoped>
.formulario-curso {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  z-index: 2000;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.formulario-curso h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #2c3e50;
  text-align: center;
  border-bottom: 2px solid #9d0101;
  padding-bottom: 0.5rem;
}

.campo-grupo {
  margin-bottom: 1.5rem;
}

.campo-grupo label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: bold;
}

.formulario-curso input,
.formulario-curso textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

.formulario-curso input:focus,
.formulario-curso textarea:focus {
  outline: none;
  border-color: #9d0101;
  box-shadow: 0 0 0 2px rgba(157, 1, 1, 0.1);
}

.imagen-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.upload-option {
  padding: 1rem;
  border: 2px dashed #28a745;
  border-radius: 8px;
  background-color: #f8fff9;
  text-align: center;
}

.upload-label {
  display: block;
  cursor: pointer;
  color: #28a745;
  font-weight: bold;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.upload-label:hover {
  background-color: #e8f5e8;
}

.file-input {
  width: 100% !important;
  padding: 0.5rem !important;
  border: 1px solid #28a745 !important;
  background-color: white !important;
}

.file-help {
  color: #6c757d;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

.imagen-preview {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background-color: #f8f9fa;
  text-align: center;
}

.preview-img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin: 0.5rem 0;
}

.btn-limpiar {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  transition: background-color 0.3s ease;
}

.btn-limpiar:hover {
  background-color: #c82333;
}

.input-youtube {
  background-color: #fff3cd !important;
  border-color: #ffeaa7 !important;
}

.youtube-tips {
  margin-top: 0.5rem;
  padding: 1rem;
  background-color: #fff3cd;
  border-radius: 5px;
  border-left: 4px solid #ffc107;
}

.youtube-tips p {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #856404;
}

.youtube-tips ul {
  margin: 0;
  padding-left: 1.2rem;
  color: #856404;
}

.youtube-tips li {
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 1rem;
}

.btn-primary {
  background-color: #28a745;
  color: white;
}

.btn-primary:hover {
  background-color: #218838;
}

.btn-secundario {
  background-color: #6c757d;
  color: white;
}

.btn-secundario:hover {
  background-color: #5a6268;
}

@media (max-width: 768px) {
  .formulario-curso {
    width: 95%;
    padding: 1.5rem;
    max-height: 95vh;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}
</style>
