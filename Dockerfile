FROM node:22-alpine@sha256:968df39aedcea65eeb078fb336ed7191baf48f972b4479711397108be0966920 AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine@sha256:8b1e78743a03dbb2c95171cc58639fef29abc8816598e27fb910ed2e621e589a
COPY --from=build /app/dist /usr/share/nginx/html/task-queue
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chown -R 101:101 /var/cache/nginx /var/log/nginx /run \
 && sed -i 's|pid.*nginx.pid;|pid /tmp/nginx.pid;|' /etc/nginx/nginx.conf
EXPOSE 8080
