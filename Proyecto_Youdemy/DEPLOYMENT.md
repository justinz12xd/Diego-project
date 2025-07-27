# Despliegue en Google Cloud Run

Este documento explica cómo desplegar la aplicación Proyecto Youdemy en Google Cloud Run usando Docker.

## Prerrequisitos

1. **Google Cloud SDK**: Instala [gcloud CLI](https://cloud.google.com/sdk/docs/install)
2. **Docker**: Instala [Docker Desktop](https://www.docker.com/products/docker-desktop)
3. **Proyecto de Google Cloud**: Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com)

## Configuración Inicial

### 1. Autenticación con Google Cloud

```bash
# Iniciar sesión
gcloud auth login

# Configurar proyecto por defecto
gcloud config set project TU-PROJECT-ID

# Configurar región por defecto
gcloud config set run/region us-central1
```

### 2. Habilitar APIs necesarias

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## Métodos de Despliegue

### Opción 1: Script Automático (Recomendado)

#### En Linux/macOS:
```bash
# Dar permisos de ejecución
chmod +x deploy.sh

# Ejecutar con tu PROJECT_ID
./deploy.sh tu-project-id us-central1
```

#### En Windows PowerShell:
```powershell
# Ejecutar script
.\deploy.ps1 -ProjectId "tu-project-id" -Region "us-central1"
```

### Opción 2: Paso a Paso Manual

#### 1. Construir la imagen Docker

```bash
# Usando Cloud Build (recomendado)
gcloud builds submit --tag gcr.io/TU-PROJECT-ID/proyecto-youdemy .

# O construir localmente
docker build -t gcr.io/TU-PROJECT-ID/proyecto-youdemy .
docker push gcr.io/TU-PROJECT-ID/proyecto-youdemy
```

#### 2. Desplegar en Cloud Run

```bash
gcloud run deploy proyecto-youdemy \
  --image gcr.io/TU-PROJECT-ID/proyecto-youdemy \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

## Configuración de Dominio Personalizado (Opcional)

### 1. Mapear dominio

```bash
gcloud run domain-mappings create --service proyecto-youdemy --domain tu-dominio.com
```

### 2. Configurar DNS

Agrega un registro CNAME en tu proveedor DNS:
```
CNAME: www -> ghs.googlehosted.com
```

## Monitoreo y Logs

### Ver logs en tiempo real
```bash
gcloud logs tail --follow --format=json
```

### Ver métricas del servicio
```bash
gcloud run services describe proyecto-youdemy --region=us-central1
```

### Ver servicios activos
```bash
gcloud run services list
```

## Configuración Avanzada

### Variables de Entorno

Edita el archivo `cloudrun.yaml` para agregar variables de entorno:

```yaml
env:
- name: NODE_ENV
  value: "production"
- name: API_URL
  value: "https://tu-api.com"
```

### Autenticación

Para requerir autenticación:

```bash
gcloud run deploy proyecto-youdemy \
  --image gcr.io/TU-PROJECT-ID/proyecto-youdemy \
  --no-allow-unauthenticated
```

### Escalado Automático

```bash
gcloud run deploy proyecto-youdemy \
  --image gcr.io/TU-PROJECT-ID/proyecto-youdemy \
  --min-instances 1 \
  --max-instances 100 \
  --concurrency 80
```

## Estructura de Archivos

```
├── Dockerfile              # Configuración Docker multi-stage
├── nginx.conf              # Configuración nginx para SPA
├── .dockerignore           # Archivos a excluir del build
├── cloudrun.yaml           # Configuración Cloud Run
├── deploy.sh               # Script de despliegue (Linux/macOS)
├── deploy.ps1              # Script de despliegue (Windows)
└── DEPLOYMENT.md           # Este archivo
```

## Solución de Problemas

### Error: "Project not found"
```bash
gcloud config set project TU-PROJECT-ID
```

### Error: "Permission denied"
```bash
gcloud auth login
gcloud auth configure-docker
```

### Error: "Service not found"
Verifica que el servicio esté desplegado:
```bash
gcloud run services list --region=us-central1
```

### Error de memoria o CPU
Aumenta los recursos en el comando de deploy:
```bash
--memory 1Gi --cpu 2
```

## Costos Estimados

- **Cloud Run**: $0.00002400 por vCPU-segundo
- **Cloud Build**: $0.003 por minuto de build
- **Container Registry**: $0.026 por GB/mes

Para una aplicación con tráfico moderado: ~$5-10 USD/mes

## Comandos Útiles

```bash
# Ver versiones desplegadas
gcloud run revisions list --service=proyecto-youdemy

# Rollback a versión anterior
gcloud run services update-traffic proyecto-youdemy --to-revisions=REVISION-NAME=100

# Eliminar servicio
gcloud run services delete proyecto-youdemy --region=us-central1

# Ver configuración actual
gcloud run services describe proyecto-youdemy --region=us-central1
```

## Seguridad

El archivo `nginx.conf` incluye:
- Headers de seguridad (XSS Protection, Content Security Policy)
- Compresión gzip
- Cache de archivos estáticos
- Configuración optimizada para SPAs

¡Tu aplicación Vue.js está lista para producción! 🚀
