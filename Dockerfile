FROM node:22-alpine as build

LABEL title="ifauth-core"
LABEL version="1.0.0"
LABEL maintainer="ifelfi"

WORKDIR /app
COPY . ./
RUN npm install -y && \
  npm run build && \
  npm prune --production

FROM node:22-alpine as deploy

WORKDIR /app
RUN rm -rf ./* && \
  mkdir -p ./logs
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/tsconfig.json ./
COPY --from=build /app/.env ./

ENTRYPOINT ["npm", "start"]