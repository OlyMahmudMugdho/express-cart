# Stage 1: Build Frontend
FROM node:24-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM node:24-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN npm run build

# Stage 3: Final Production Image
FROM node:24-alpine
WORKDIR /app

# Copy backend dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --omit=dev

# Copy backend built files
COPY --from=backend-builder /app/backend/dist ./dist

# Copy frontend built static files into backend's public folder
# Note: backend/src/app.module.ts expects it at join(__dirname, '..', 'public')
# In production, __dirname is /app/backend/dist, so .. /public is /app/backend/public
COPY --from=frontend-builder /app/frontend/out ./public

EXPOSE 3000

CMD ["node", "dist/main"]
