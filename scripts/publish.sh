#!/bin/bash
packages=(
  core
  config
  validation
  logger
  tracer
  event-bus
  pg
  mongo
  migrations
  http
)

for package in "${packages[@]}"
do
  ( cd "${package}" ; npm publish --access public )
done
