# Script de despliegue para Google Cloud Run (PowerShell)
# Uso: .\deploy.ps1 -ProjectId "tu-project-id" -Region "us-central1"

param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectId = "tu-project-id",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-central1"
)

$ServiceName = "proyecto-youdemy"
$ImageName = "gcr.io/$ProjectId/$ServiceName"

Write-Host "🚀 Iniciando despliegue de $ServiceName" -ForegroundColor Green
Write-Host "📂 Proyecto: $ProjectId" -ForegroundColor Cyan
Write-Host "🌍 Región: $Region" -ForegroundColor Cyan

try {
    # 1. Verificar que gcloud esté configurado
    Write-Host "✅ Verificando configuración de gcloud..." -ForegroundColor Yellow
    gcloud config set project $ProjectId

    # 2. Habilitar APIs necesarias
    Write-Host "🔧 Habilitando APIs de Google Cloud..." -ForegroundColor Yellow
    gcloud services enable cloudbuild.googleapis.com
    gcloud services enable run.googleapis.com
    gcloud services enable containerregistry.googleapis.com

    # 3. Construir la imagen Docker
    Write-Host "🏗️ Construyendo imagen Docker..." -ForegroundColor Yellow
    gcloud builds submit --tag $ImageName .

    # 4. Desplegar en Cloud Run
    Write-Host "🚀 Desplegando en Cloud Run..." -ForegroundColor Yellow
    gcloud run deploy $ServiceName `
        --image $ImageName `
        --platform managed `
        --region $Region `
        --allow-unauthenticated `
        --port 8080 `
        --memory 512Mi `
        --cpu 1 `
        --min-instances 0 `
        --max-instances 10 `
        --set-env-vars NODE_ENV=production

    # 5. Obtener URL del servicio
    Write-Host "✅ Despliegue completado!" -ForegroundColor Green
    $ServiceUrl = gcloud run services describe $ServiceName --region=$Region --format="value(status.url)"
    Write-Host "🌐 Tu aplicación está disponible en: $ServiceUrl" -ForegroundColor Green

    Write-Host ""
    Write-Host "📋 Comandos útiles:" -ForegroundColor Cyan
    Write-Host "  Ver logs: gcloud logs tail --follow --format=json" -ForegroundColor White
    Write-Host "  Ver servicios: gcloud run services list" -ForegroundColor White
    Write-Host "  Eliminar servicio: gcloud run services delete $ServiceName --region=$Region" -ForegroundColor White

} catch {
    Write-Host "❌ Error durante el despliegue: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
