# Etapa 1: Build de la aplicación Vue.js
FROM node:20-alpine AS build-stage

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para el build)
RUN npm ci

# Copiar el código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Etapa 2: Servir con nginx
FROM nginx:alpine AS production-stage

# Copiar archivos construidos desde la etapa anterior
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer puerto 8080 (requerido por Google Cloud Run)
EXPOSE 8080

# Comando para iniciar nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
