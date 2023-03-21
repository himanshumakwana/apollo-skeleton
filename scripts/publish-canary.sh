#!/bin/bash

RED='\033[0;31m'
NC='\033[0m'
GREEN='\033[32m'

if [[ -n $(git status -s) ]]; then
  echo -e "${RED}Cannot publish canary package: there are uncommitted changes.${NC}"
  cd "$ROOT_PATH" || exit
  exit
fi

LATEST_VERSION=$(npm dist-tag ls | grep "latest" | sed -e "s/^latest: //")
USER_STORY=$(git branch --show-current)
CANARY_TAG="$LATEST_VERSION-canary-$USER_STORY"

CANARY_MATCHING_VERSIONS=$(npm view apollo-skeleton --json | jq -r 'to_entries|map("\(.value|tostring)")|.[]' | grep "$CANARY_TAG")

if test -n "$CANARY_MATCHING_VERSIONS"; then
  COUNTER=$(echo "${CANARY_MATCHING_VERSIONS##*$'\n'}" | sed -n -e "s/^.*$USER_STORY-\([0-9]\{1,\}\)/\1/p")
else
  COUNTER=0
fi

CANARY_VERSION="$CANARY_TAG-$((COUNTER + 1))"

echo -e "${GREEN}Canary version $CANARY_VERSION.${NC}"

npm version "$CANARY_VERSION"

rm -rf ./dist && npm run build

npm publish --tag canary
