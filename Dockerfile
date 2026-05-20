FROM node:current as build

ARG REACT_APP_API_URL

COPY . .
RUN npm install
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx"]


