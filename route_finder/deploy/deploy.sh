#!/bin/bash

set -eu

BASEDIR="$(realpath "$(dirname "${BASH_SOURCE[0]}")/..")"
FEDIR="${BASEDIR}/frontend"
BEDIR="${BASEDIR}/server"
DEPDIR="${BASEDIR}/deploy"
BUILD_DIR="${DEPDIR}/build"

# Other constants
LOCAL_DOCKER_IMG="testing-linux"
CR_IMG="asia-northeast1-docker.pkg.dev/route-finder-442000/cr/route-finder-image"

push_to_gcp=false
deploy_to_cloud_run=false
while getopts gr option
do
  case "${option}" in
    g) push_to_gcp=true;;
    r) deploy_to_cloud_run=true;;
    ?) echo "Unecpected option"; exit 1;;
  esac
done

# Clean up existing build dir.
if [[ -d "${BUILD_DIR}" ]]; then
  rm -r "${BUILD_DIR}"
fi

mkdir -p "${BUILD_DIR}"

# Build frontend
cd "${FEDIR}"
npm run build || { echo "Failed to build frontend."; exit 1; }

# Export poetry deps to requirements.txt
cd "${BEDIR}"
poetry export -f requirements.txt --output "${BUILD_DIR}/requirements.txt" --without-hashes

# Copy necessary files into build dir
cp -r "${FEDIR}/dist" "${BUILD_DIR}"
cp -r ${BEDIR}/src/* "${BUILD_DIR}"

# Build an image
cd "${DEPDIR}"
docker buildx build --platform=linux/amd64 -t "${LOCAL_DOCKER_IMG}" .

# Push
if [[ "${push_to_gcp}" = "true" ]]; then
  docker tag "${LOCAL_DOCKER_IMG}:latest" "${CR_IMG}:latest"
  docker push "${CR_IMG}:latest"
fi

# Deploy
if [[ "${deploy_to_cloud_run}" = "true" ]]; then
  gcloud run deploy route-finder-image \
    --region asia-northeast1 \
    --image "${CR_IMG}:latest" \
    --platform managed
fi

