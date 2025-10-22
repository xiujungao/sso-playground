FROM node:24.2.0-alpine
WORKDIR /opt/app
COPY . .
RUN yarn install --network-timeout=300000
RUN yarn build

EXPOSE 3000
CMD ["yarn", "start"]
