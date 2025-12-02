FROM node:20-bullseye

# Install Chromium
RUN apt-get update && \
    apt-get install -y chromium

# Set working directory
WORKDIR /usr/src/app

# Copy dependencies and install
COPY package*.json ./
RUN npm ci

# Copy project files
COPY . .

# Environment variable for Puppeteer to find Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Start your server
CMD ["node", "server.js"]
