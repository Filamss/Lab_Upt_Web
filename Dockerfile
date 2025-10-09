# ===============================
# 1. Gunakan image Node.js untuk build
# ===============================
FROM node:20-alpine AS build

WORKDIR /app

# Copy file konfigurasi package
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy seluruh source code ke container
COPY . .

# Build project (hasilnya ke folder dist)
RUN npm run build

# ===============================
# 2. Gunakan NGINX untuk serve hasil build
# ===============================
FROM nginx:alpine

# Copy hasil build dari tahap pertama ke direktori NGINX
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 agar bisa diakses dari browser
EXPOSE 80

# Jalankan NGINX
CMD ["nginx", "-g", "daemon off;"]
