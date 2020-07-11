FROM node:12.18.2-alpine AS builder

RUN apk add --no-cache git

USER node
COPY --chown=node . /src
WORKDIR /src

RUN npm ci && $(npm bin)/grunt


FROM nginx:1.18.0-alpine

RUN echo "server { listen 80; root /src; location / { autoindex on; } }" > /etc/nginx/conf.d/default.conf

COPY --from=builder /src/ /src
RUN rm -rf /src/node_modules
