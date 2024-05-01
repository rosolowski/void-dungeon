FROM node:20.5.1

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

CMD npm rebuild esbuild && npm run dev -- --host