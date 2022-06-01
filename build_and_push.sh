#!/usr/bin/env bash
set -Eeuo pipefail

do_push() {
  IMAGE_NAME="website"
  HUB_NAME="dr.ivarlovlie.no/vsh/website"
  COMMIT_HASH=$(git rev-parse --short HEAD)

  pushd src/wwwroot
  npm run build
  echo $COMMIT_HASH >version.txt
  popd

  docker build -t $IMAGE_NAME .
  docker tag $IMAGE_NAME $HUB_NAME:$COMMIT_HASH
  docker tag $IMAGE_NAME $HUB_NAME:latest

  echo ""
  echo "CTRL+C to cancel, anything to push to docker hub"
  read -n 1
  docker push $HUB_NAME:$COMMIT_HASH
  docker push $HUB_NAME:latest
}

if [ -z "$(git status --untracked-files=no --porcelain)" ]; then
  do_push
else
  echo "unclean git tree! CTRL+C to cancel, anything to commit and push to default branch"
  read -n 1
  read -p "Enter commit message: " COMMIT_MESSAGE
  git add .
  git commit -m "$COMMIT_MESSAGE"
  git push
  do_push
fi
