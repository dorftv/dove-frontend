FROM node:lts

COPY ./ /var/www/html/app

WORKDIR /var/www/html/app

ENV HUSKY=0

RUN npm install -g npm && \
    npm install
