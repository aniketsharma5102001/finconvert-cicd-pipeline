FROM node:22-alpine
WORKDIR /app

#Update global npm to the latest version to patch vulnerabilities
Run npm install -g npm@latest
# Install dependencies
COPY package*.json ./
# We only install production dependencies to reduce the attack surface
RUN npm install --omit=dev

# Copy the server code
COPY . .

EXPOSE 5000
CMD ["npm", "run", "start"]