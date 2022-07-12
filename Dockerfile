# Build the bot
FROM node:lts-gallium AS core
WORKDIR /app
COPY / /app/
RUN npm install
RUN npm run build

# Build the final runtime container
FROM node:gallium-slim AS runtime
WORKDIR /app
COPY --from=core /app/node_modules ./node_modules
COPY --from=core /app/.svelte-kit ./.svelte-kit
COPY --from=core /app/build ./build
COPY --from=core /app/package-lock.json ./package-lock.json
COPY --from=core /app/package.json ./package.json
COPY --from=core /app/stack.env ./.env
RUN ls
ENV NODE_ENV=production
ENTRYPOINT ["node", "build/index.js"]
