FROM node:22-alpine
WORKDIR /app

# Update global npm to the latest version to patch vulnerabilities (Fixed capitalization)
RUN npm install -g npm@latest

# Install dependencies
COPY package*.json ./

# We only install production dependencies to reduce the attack surface
RUN npm install --omit=dev

# Copy the server code
COPY src/ ./src/
COPY index.js ./

# Switch to the built-in, unprivileged 'node' user before running the app
USER node

EXPOSE 5000
CMD ["npm", "run", "start"]