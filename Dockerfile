FROM node:14

WORKDIR /usr/src/

COPY package*.json ./

EXPOSE 3001

CMD ["node run dev"]