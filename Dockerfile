FROM oven/bun AS build
WORKDIR /app
COPY . .
RUN bun run build


FROM nginx
WORKDIR /app
COPY --from=build /app/dist /app
RUN echo 'server { listen 80; root /app; }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
