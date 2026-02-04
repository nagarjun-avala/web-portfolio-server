# Use specific version for stability (Alpine is lightweight)
FROM node:22

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
# Using npm ci is faster and more reliable for builds if package-lock.json exists
# If not, fall back to npm install
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the port defined in index.js
EXPOSE 5000

# Start the application
CMD ["npm", "start"]