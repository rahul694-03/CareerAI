# Multi-stage Dockerfile for CareerAI Frontend SPA

# Stage 1: Build React/Vite app
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies first for efficient layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build
COPY . .

# Optional build arg for API URL during static build (default empty for same-origin proxy)
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Stage 2: Serve with lightweight Nginx
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
