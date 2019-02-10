FROM node:8.9.4
# copy files from current folder to container folder
COPY . .
# install npm under production env so dev dependencies dont get installed
ENV NODE_ENV=production
RUN npm install
# node start up
CMD node index.js
EXPOSE 80