# Dockerfile

# Stage 1: Build stage
# Use an official Node.js LTS image (e.g., Node 20) as a base
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json and package-lock.json (if available)
# It's best practice to commit package-lock.json to your repository.
COPY package.json ./
# The wildcard '*' ensures this step doesn't fail if package-lock.json is missing,
# though having it is strongly recommended for reproducible builds.
COPY package-lock.json* ./

# Install all dependencies (including devDependencies for building)
# Use npm ci if package-lock.json exists for faster, more reliable builds.
# Otherwise, fall back to npm install.
RUN if [ -f package-lock.json ]; then \
      echo "Found package-lock.json, using npm ci" && npm ci; \
    else \
      echo "No package-lock.json found, using npm install" && npm install; \
    fi

# Copy the rest of the application code
COPY . .

# Build the Next.js application
# Environment variables like GOOGLE_API_KEY are typically not needed at build time
# unless used for pre-rendering with dynamic data, which is not the case here.
RUN npm run build

# Stage 2: Production stage
# Use a slim Node.js image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
# PORT environment variable will be used by Next.js to start the server.
# Default is 3000, which is exposed below. Next.js will listen on this port.
ENV PORT 3000

# Create a non-root user and group for better security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application artifacts from the builder stage
# and set ownership to the non-root user.
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
# If package-lock.json was present, copy it as well.
COPY --from=builder --chown=nextjs:nodejs /app/package-lock.json* ./

# Copy all node_modules from builder. This is simpler for Next.js apps
# but makes the image larger. For truly minimal images, you could
# install only production dependencies here using package.json and package-lock.json.
# However, `next start` often relies on the structure built with devDependencies.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# The .tmp directory for image caching (used by imageActions.ts) will be created 
# by the application in /app/.tmp if it doesn't exist.
# If you want this cache to persist across container restarts, you should map 
# a volume to /app/.tmp when running the container (e.g., `docker run -v my-cache:/app/.tmp ...`).

# Switch to the non-root user
USER nextjs

# Expose the port the app will run on
EXPOSE 3000

# Command to run the application
# This will execute the "start" script from package.json: "next start"
CMD ["npm", "start"]
