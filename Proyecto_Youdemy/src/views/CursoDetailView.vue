<template>
  <div class="course-detail">
    <!-- Header -->
    <header class="course-header">
      <div class="header-container">
        <button @click="goBack" class="back-btn">
          ← Volver
        </button>
        <div class="header-actions" v-if="isAdmin">
          <button @click="editCourse" class="btn btn-edit">
            ✏️ Editar
          </button>
          <button @click="deleteCourse" class="btn btn-delete">
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </header>

    <!-- Course Content -->
    <main class="course-content" v-if="course.id">
      <div class="course-container">
        <!-- Course Image & Video -->
        <div class="media-section">
          <div class="course-image">
            <img 
              :src="course.imagen || course.image || defaultImage" 
              :alt="course.titulo || course.title"
              class="main-image"
            >
            <div v-if="course.videoUrl" class="video-overlay">
              <button @click="openVideo" class="video-btn">
                ▶️ Ver Video
              </button>
            </div>
          </div>
          
          <!-- Enrollment Section for Students -->
          <div v-if="isStudent" class="enrollment-section">
            <button 
              @click="toggleEnrollment" 
              :class="['btn-enrollment', { 'enrolled': isEnrolled }]"
            >
              {{ isEnrolled ? '✓ Inscrito' : '📚 Inscribirse' }}
            </button>
            <p v-if="isEnrolled" class="enrollment-status">
              ¡Estás inscrito en este curso!
            </p>
          </div>

          <!-- Course Stats for Admin -->
          <div v-if="isAdmin" class="stats-section">
            <div class="stat-card">
              <div class="stat-number">{{ enrolledStudents }}</div>
              <div class="stat-label">Estudiantes Inscritos</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ course.status || 'Activo' }}</div>
              <div class="stat-label">Estado</div>
            </div>
          </div>
        </div>

        <!-- Course Info -->
        <div class="info-section">
          <div class="course-title">
            <h1>{{ course.titulo || course.title }}</h1>
            <div class="course-badges">
              <span v-if="course.videoUrl" class="badge video-badge">
                📹 Con Video
              </span>
              <span class="badge level-badge">
                🎓 Básico
              </span>
            </div>
          </div>

          <div class="course-description">
            <h2>Descripción del Curso</h2>
            <p>{{ course.descripcion || course.description }}</p>
          </div>

          <div v-if="courseTopics.length" class="course-content-section">
            <h2>Contenido del Curso</h2>
            <div class="topics-grid">
              <div 
                v-for="(topic, index) in courseTopics" 
                :key="index"
                class="topic-card"
              >
                <div class="topic-number">{{ index + 1 }}</div>
                <div class="topic-title">{{ topic }}</div>
              </div>
            </div>
          </div>

          <!-- Learning Objectives -->
          <div class="objectives-section">
            <h2>Lo que Aprenderás</h2>
            <div class="objectives-list">
              <div class="objective-item">
                <span class="check-icon">✓</span>
                <span>Fundamentos sólidos del tema</span>
              </div>
              <div class="objective-item">
                <span class="check-icon">✓</span>
                <span>Ejercicios prácticos</span>
              </div>
              <div class="objective-item">
                <span class="check-icon">✓</span>
                <span>Proyectos reales</span>
              </div>
              <div class="objective-item">
                <span class="check-icon">✓</span>
                <span>Mejores prácticas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Course Not Found -->
    <div v-else class="not-found">
      <div class="not-found-content">
        <div class="not-found-icon">🔍</div>
        <h2>Curso no encontrado</h2>
        <p>El curso que buscas no existe o ha sido eliminado.</p>
        <button @click="goBack" class="btn btn-primary">
          Volver atrás
        </button>
      </div>
    </div>

    <!-- Video Modal -->
    <div v-if="showVideoModal" class="video-modal" @click.self="closeVideo">
      <div class="video-container">
        <button @click="closeVideo" class="modal-close">×</button>
        <iframe 
          :src="videoEmbedUrl" 
          :title="`Video del curso ${course.titulo || course.title}`"
          allowfullscreen
          class="video-iframe"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { obtenerUsuarioActual } from '@/services/auth'

const route = useRoute()
const router = useRouter()

// Reactive data
const course = ref({})
const user = ref(null)
const showVideoModal = ref(false)

const defaultImage = 'https://via.placeholder.com/600x350/6366f1/white?text=Curso'

// Computed properties
const isAdmin = computed(() => user.value?.rol === 'profesor')
const isStudent = computed(() => user.value?.rol === 'estudiante')

const isEnrolled = computed(() => {
  if (!user.value || !course.value.id) return false
  const enrollments = JSON.parse(localStorage.getItem(`inscripciones_${user.value.correo}`)) || []
  return enrollments.includes(course.value.id)
})

const enrolledStudents = computed(() => {
  let count = 0
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('inscripciones_')) {
      const enrollments = JSON.parse(localStorage.getItem(key)) || []
      if (enrollments.includes(course.value.id)) count++
    }
  })
  return count
})

const courseTopics = computed(() => {
  const content = course.value.contenido || course.value.content
  if (!content) return []
  if (Array.isArray(content)) return content
  return content.split(',').map(topic => topic.trim()).filter(topic => topic)
})

const videoEmbedUrl = computed(() => {
  if (!course.value.videoUrl) return ''
  
  // Extract YouTube video ID and create embed URL
  const videoId = extractYouTubeId(course.value.videoUrl)
  return videoId ? `https://www.youtube.com/embed/${videoId}` : ''
})

// Methods
const loadCourse = () => {
  const courses = JSON.parse(localStorage.getItem('cursos')) || []
  const courseId = parseInt(route.params.id)
  course.value = courses.find(c => c.id === courseId) || {}
}

const loadUser = () => {
  user.value = obtenerUsuarioActual()
}

const goBack = () => {
  if (isAdmin.value) {
    router.push('/admin')
  } else {
    router.push('/estudiante')
  }
}

const toggleEnrollment = () => {
  if (!user.value) {
    alert('Debes iniciar sesión para inscribirte')
    return
  }

  const enrollments = JSON.parse(localStorage.getItem(`inscripciones_${user.value.correo}`)) || []
  
  if (isEnrolled.value) {
    // Unenroll
    const newEnrollments = enrollments.filter(id => id !== course.value.id)
    localStorage.setItem(`inscripciones_${user.value.correo}`, JSON.stringify(newEnrollments))
    alert('Te has desinscrito del curso')
  } else {
    // Enroll
    enrollments.push(course.value.id)
    localStorage.setItem(`inscripciones_${user.value.correo}`, JSON.stringify(enrollments))
    alert('¡Te has inscrito exitosamente!')
  }
}

const editCourse = () => {
  router.push(`/admin?edit=${course.value.id}`)
}

const deleteCourse = () => {
  if (confirm('¿Estás seguro de que quieres eliminar este curso?')) {
    let courses = JSON.parse(localStorage.getItem('cursos')) || []
    courses = courses.filter(c => c.id !== course.value.id)
    localStorage.setItem('cursos', JSON.stringify(courses))
    
    // Remove enrollments
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('inscripciones_')) {
        let enrollments = JSON.parse(localStorage.getItem(key)) || []
        enrollments = enrollments.filter(id => id !== course.value.id)
        localStorage.setItem(key, JSON.stringify(enrollments))
      }
    })
    
    alert('Curso eliminado exitosamente')
    goBack()
  }
}

const openVideo = () => {
  showVideoModal.value = true
}

const closeVideo = () => {
  showVideoModal.value = false
}

const extractYouTubeId = (url) => {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  const match = url.match(regex)
  return match ? match[1] : null
}

// Initialize
onMounted(() => {
  loadCourse()
  loadUser()
})
</script>

<style scoped>
.course-detail {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.course-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  background: none;
  border: none;
  font-size: 1rem;
  color: #374151;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.course-content {
  padding: 2rem 0;
}

.course-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 3rem;
}

.media-section {
  position: sticky;
  top: 120px;
  height: fit-content;
}

.course-image {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  margin-bottom: 1.5rem;
}

.main-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  display: block;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.course-image:hover .video-overlay {
  opacity: 1;
}

.video-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.video-btn:hover {
  background: white;
  transform: scale(1.05);
}

.enrollment-section {
  text-align: center;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.btn-enrollment {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  color: white;
}

.btn-enrollment:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
}

.btn-enrollment.enrolled {
  background: linear-gradient(135deg, #10b981, #059669);
}

.enrollment-status {
  margin-top: 0.5rem;
  color: #10b981;
  font-weight: 500;
  font-size: 0.9rem;
}

.stats-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 0.8rem;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 500;
}

.info-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.course-title {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.course-title h1 {
  margin: 0 0 1rem 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
}

.course-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.video-badge {
  background: #fee2e2;
  color: #dc2626;
}

.level-badge {
  background: #e0f2fe;
  color: #0277bd;
}

.course-description {
  margin-bottom: 2rem;
}

.course-description h2 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.course-description p {
  color: #6b7280;
  line-height: 1.7;
  font-size: 1.1rem;
}

.course-content-section {
  margin-bottom: 2rem;
}

.course-content-section h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.topics-grid {
  display: grid;
  gap: 0.75rem;
}

.topic-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
  transition: all 0.3s ease;
}

.topic-card:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}

.topic-number {
  width: 32px;
  height: 32px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.topic-title {
  color: #374151;
  font-weight: 500;
}

.objectives-section h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.objectives-list {
  display: grid;
  gap: 0.75rem;
}

.objective-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
}

.check-icon {
  width: 24px;
  height: 24px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
}

.not-found-content {
  text-align: center;
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  max-width: 400px;
}

.not-found-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.not-found-content h2 {
  margin: 0 0 1rem 0;
  color: #1f2937;
}

.not-found-content p {
  margin: 0 0 2rem 0;
  color: #6b7280;
}

.video-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 2rem;
}

.video-container {
  position: relative;
  width: 100%;
  max-width: 900px;
  aspect-ratio: 16/9;
}

.video-iframe {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  border: none;
}

.modal-close {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-edit {
  background: #3b82f6;
  color: white;
}

.btn-edit:hover {
  background: #2563eb;
}

.btn-delete {
  background: #ef4444;
  color: white;
}

.btn-delete:hover {
  background: #dc2626;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 968px) {
  .course-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .media-section {
    position: static;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .course-title h1 {
    font-size: 2rem;
  }
  
  .course-container {
    padding: 0 0.5rem;
  }
  
  .info-section {
    padding: 1.5rem;
  }
  
  .video-modal {
    padding: 1rem;
  }
}
</style>
