# Deployment to GCP

## Set up GCP artifact registry
gcloud auth configure-docker asia-northeast1-docker.pkg.dev

docker tag testing:latest asia-northeast1-docker.pkg.dev/route-finder-442000/cr/route-finder-image:latest

docker push asia-northeast1-docker.pkg.dev/route-finder-442000/cr/route-finder-image:latest

gcloud run deploy --image asia-northeast1-docker.pkg.dev/route-finder-442000/cr/route-finder-image:latest --platform managed

gcloud run services proxy route-finder-image --project route-finder-442000