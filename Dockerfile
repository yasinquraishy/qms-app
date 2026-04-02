# Build context must be the workspace root:
#   docker build -f frontend/app/Dockerfile -t qms-frontend .

# ─── Stage 1: builder ────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /workspace

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@10.9.0 --activate

# Copy workspace manifests first for layer caching
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY frontend/app/package.json ./frontend/app/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Pass optional build-time env vars (e.g. VITE_ADMIN_EMAILS)
ARG VITE_ADMIN_EMAILS=""
ENV VITE_ADMIN_EMAILS=$VITE_ADMIN_EMAILS

# Copy frontend source and build
COPY frontend/app/ ./frontend/app/
RUN pnpm --filter app build

# ─── Stage 2: production (nginx) ─────────────────────────────────────────────
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# The nginx Docker image automatically runs envsubst on files in /etc/nginx/templates/
# and places the output in /etc/nginx/conf.d/
COPY --from=builder /workspace/frontend/app/nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy built SPA assets
COPY --from=builder /workspace/frontend/app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
