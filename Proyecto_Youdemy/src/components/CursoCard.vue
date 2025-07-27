<template>
  <div class="curso-card">
    <img 
      :src="curso.imagen || defaultImage" 
      :alt="curso.titulo"
      class="curso-imagen"
    >
    <div class="curso-info">
      <h3>{{ curso.titulo }}</h3>
      <p>{{ truncarTexto(curso.descripcion, descripcionLimit) }}</p>
      <div class="curso-badges">
        <span v-if="curso.videoUrl" class="video-badge">📹 Con video</span>
        <span v-if="mostrarInscrito && estaInscrito" class="inscrito-badge">✓ Inscrito</span>
      </div>
      <div class="curso-actions">
        <slot name="actions" :curso="curso">
          <!-- Acciones por defecto -->
          <RouterLink 
            :to="`/curso/${curso.id}`" 
            class="btn btn-secondary"
          >
            Ver detalles
          </RouterLink>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUtils } from '@/composables/useUtils'

const props = defineProps({
  curso: {
    type: Object,
    required: true
  },
  descripcionLimit: {
    type: Number,
    default: 100
  },
  mostrarInscrito: {
    type: Boolean,
    default: false
  },
  estaInscrito: {
    type: Boolean,
    default: false
  },
  defaultImage: {
    type: String,
    default: 'https://via.placeholder.com/300x200'
  }
})

const { truncarTexto } = useUtils()
</script>

<style scoped>
.curso-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.curso-card:hover {
  transform: translateY(-5px);
}

.curso-imagen {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.curso-info {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.curso-info h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  line-height: 1.3;
}

.curso-info p {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
  flex: 1;
}

.curso-badges {
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.video-badge {
  background: #e74c3c;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.inscrito-badge {
  background: #27ae60;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.curso-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  display: inline-block;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}
</style>
