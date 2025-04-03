# 1. aşama: Build aşaması
FROM node:18 AS builder

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

# 2. aşama: Prod sunucu
FROM nginx:alpine

# Vite build çıktısını nginx'e kopyala
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx varsayılan configini sil
RUN rm /etc/nginx/conf.d/default.conf

# kendi nginx configini kopyala (eğer varsa)
# COPY nginx.conf /etc/nginx/conf.d

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
