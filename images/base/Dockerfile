FROM node:20-alpine3.22

RUN apk update && \
    apk add --no-cache python3 make g++ && \
    rm -rf /tmp/*

LABEL maintainer="hasan.arian@tensorify.io"
LABEL description="Node.js image with python3, make, and g++ for isolated-vm"