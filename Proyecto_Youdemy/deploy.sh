#!/bin/bash

# Script de despliegue para Google Cloud Run
# Uso: ./deploy.sh [PROJECT_ID] [REGION]

set -e

# Configuración por defecto
PROJECT_ID=${1:-"tu-project-id"}
REGION=${2:-"us-central1"}
SERVICE_NAME="proyecto-youdemy"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 Iniciando despliegue de $SERVICE_NAME"
echo "📂 Proyecto: $PROJECT_ID"
echo "🌍 Región: $REGION"

# 1. Verificar que gcloud esté configurado
echo "✅ Verificando configuración de gcloud..."
gcloud config set project $PROJECT_ID

# 2. Habilitar APIs necesarias
echo "🔧 Habilitando APIs de Google Cloud..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# 3. Construir la imagen Docker
echo "🏗️ Construyendo imagen Docker..."
gcloud builds submit --tag $IMAGE_NAME --timeout=20m .

# 4. Desplegar en Cloud Run
echo "🚀 Desplegando en Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production

# 5. Obtener URL del servicio
echo "✅ Despliegue completado!"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
echo "🌐 Tu aplicación está disponible en: $SERVICE_URL"

echo ""
echo "📋 Comandos útiles:"
echo "  Ver logs: gcloud logs tail --follow --format=json"
echo "  Ver servicios: gcloud run services list"
echo "  Eliminar servicio: gcloud run services delete $SERVICE_NAME --region=$REGION"
