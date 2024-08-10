FROM node:20.15.0 as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install 
COPY . ./
RUN npm run build

FROM nginx
EXPOSE 5080
COPY --from=build /app/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]