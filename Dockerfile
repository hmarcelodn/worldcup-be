FROM node:carbon

WORKDIR /app

ENV TYPEORM_CONNECTION postgres
ENV TYPEORM_HOST devolodog.postgres.database.azure.com
ENV TYPEORM_USERNAME devolodog@devolodog
ENV TYPEORM_PASSWORD Marcelo1988
ENV TYPEORM_DATABASE app_development
ENV TYPEORM_PORT 5432
ENV TYPEORM_SYNCHRONIZE false
ENV TYPEORM_LOGGING true
ENV TYPEORM_ENTITIES src/entity/**/*.ts
ENV TYPEORM_MIGRATIONS_DIR src/migration/**/*.ts
ENV TYPEORM_SUBSCRIBERS_DIR src/subscriber/**/*.ts

COPY . .

RUN rm ormconfig.json
RUN npm install

EXPOSE 3000

CMD [ "npm", "start" ]
