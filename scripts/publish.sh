#!/bin/bash
packages=( core config http event-bus )

for package in "${packages[@]}"
do
  ( cd "${package}" ; npm publish --access public )
done
