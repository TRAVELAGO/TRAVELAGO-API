# TRAVELAGO-API

## Installation

```bash
# install package
$ yarn

# create environment file and edit
$ cp .env.example .env
```
- create database `travelago` in mysql

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Migrations

```bash
# run
yarn run migration:run

# revert
yarn run migration:revert

# generate
yarn run migration:generate src/database/migrations/<migration-name>

# create
yarn run migration:create src/database/migrations/<migration-name> 
```

## Run Docker

```bash
# build image & run container
$ docker compose up

# rebuild image & run container
$ docker compose up --build

# stop container
$ docker compose stop

# start exited container
$ docker compose start
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```