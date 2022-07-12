# Build the bot
FROM node:lts-gallium AS core
WORKDIR /app
COPY / /app/
RUN npm install
RUN npx prisma generate
RUN npm run build

# Build the final runtime container
FROM node:lts-gallium AS runtime
WORKDIR /app
COPY --from=core /app/node_modules ./node_modules
COPY --from=core /app/.svelte-kit ./.svelte-kit
COPY --from=core /app/build ./build
COPY --from=core /app/prisma ./prisma
COPY --from=core /app/package-lock.json ./package-lock.json
COPY --from=core /app/package.json ./package.json
COPY --from=core /app/stack.env ./.env
ENV NODE_ENV=production
ENTRYPOINT ["npx", "prisma", "migrate", "deploy", "&&", "node", "build/index.js"]
