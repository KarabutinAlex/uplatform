#!/bin/bash
packages=( core config logging http event-bus pg mongo )

for package in "${packages[@]}"
do
  ( cd "${package}" ; npm publish --access public )
done
