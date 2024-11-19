# Deployment to GCP

## Build Docker image

### Just locally

```shell
$ ./deploy.sh

# Run it for testing
$ docker run -e "PORT=8080" -p "8080:8080" testing-linux
```

### Push it to GCP Artifact Registry

```shell
$ ./deploy.sh -g
```

### Push it to Cloud Run

```shell
$ ./deploy.sh -g -r
```

## MEMO: Set up GCP artifact registry

gcloud auth configure-docker asia-northeast1-docker.pkg.dev

docker tag testing:latest asia-northeast1-docker.pkg.dev/route-finder-442000/cr/route-finder-image:latest

docker push asia-northeast1-docker.pkg.dev/route-finder-442000/cr/route-finder-image:latest

gcloud run deploy --image asia-northeast1-docker.pkg.dev/route-finder-442000/cr/route-finder-image:latest --platform managed

gcloud run services proxy route-finder-image --project route-finder-442000
