#!/bin/bash

RED='\033[0;31m'
NC='\033[0m'
GREEN='\033[32m'

if [[ -n $(git status -s) ]]; then
  echo -e "${RED}Cannot publish minor version: there are uncommitted changes.${NC}"
  cd "$ROOT_PATH" || exit
  exit
fi


LATEST_VERSION=$(npm dist-tag ls | grep "latest" | sed -e "s/^latest: //")

NEW_VERSION=$(echo $LATEST_VERSION | awk -F. '{$NF = $NF + 1;} 1' OFS=. )

echo -e "${GREEN}Current version $LATEST_VERSION and Upgraded version $NEW_VERSION${NC}"

npm version $NEW_VERSION

rm -rf ./dist && npm run build

npm publish