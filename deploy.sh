#!/bin/sh

git pull
docker build . -t scp-next-app
docker run -dp 3000:3000 scp-next-app

# todo docker compose, dann auch mysql (und nginx?)
