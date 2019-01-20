#!/bin/bash
packages=( core config logging http event-bus )

for package in "${packages[@]}"
do
  ( cd "${package}" ; npm publish --access public )
done
