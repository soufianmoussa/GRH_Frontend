# syntax=docker/dockerfile:1
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./

# Installation resiliente aux coupures reseau.
#  - le cache npm est monte depuis le builder : une tentative qui echoue ne repart plus
#    de zero, seuls les paquets manquants sont retelecharges ;
#  - les reglages fetch-* laissent npm reessayer au lieu d'abandonner sur un ECONNRESET,
#    frequent sur une connexion lente ou derriere un proxy.
RUN --mount=type=cache,target=/root/.npm \
    npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set fetch-timeout 600000 \
 && npm ci

COPY . .
RUN npm run build -- --configuration=production

FROM nginx:alpine
COPY --from=build /app/dist/ghrfe/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
