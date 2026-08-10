# Stage 1: Build the React Application
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# 1. Update Nginx port to 8080 and grant access to required system folders (Merged RUN)
RUN sed -i 's/listen  *80;/listen 8080;/g' /etc/nginx/conf.d/default.conf && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# 2. Copy the Vite output WITHOUT giving the nginx user ownership (Prevents defacement)
COPY --from=builder /app/dist /usr/share/nginx/html

# 3. Switch to the non-root 'nginx' user
USER nginx

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]