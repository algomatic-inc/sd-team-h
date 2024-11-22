# Route Finder

## Introduction

Route Finder is a web application that helps users to find the best route between two locations, with the user preferences such as greenery, safety, and convenience.

## Set up and deploy

### Repository

```bash
$ git clone https://github.com/algomatic-inc/sd-team-some-ideas.git
```

### Server

Backend system is written in Python, and it's managed by `poetry`. Please install `poetry` first.
Once you have `poetry`, you can install all the dependencies by running the following command:

```bash
$ cd server
$ poetry install
```

### Frontend

Frontend system is written in TypeScript, and it's managed by `npm`. Please install `npm` first.
Once you have `npm`, you can install all the dependencies by running the following command:

```bash
$ cd frontend
$ npm install
```

### Build

We pack our system into a Docker image, and deploy it to GCP Cloud Run. Please install `docker` first.

Overall deployment flow is as follows:

- Build the frontend system, and copy the built files to the server system.
- Export poetry dependencies to a `requirements.txt` file, and copy it to a build directory.
- Build the Docker image.

You can do all these steps by running the following command:
```bash
$ cd deploy
$ ./deploy.sh
```

To run the Docker image locally, run the following command:
```bash
$ docker run -e "PORT=8080" -p "8080:8080" testing-linux
```

### Deploy

We use GCP Cloud Run to deploy our system. Before deploying, you need to login to GCP by running the following command:

```bash
$ gcloud auth login
```

Overall deployment flow is as follows:

- Push the Docker image to GCP.
- Deploy the Docker image to GCP, Cloud Run.

You can do all these steps by running the following command:
```bash
$ ./deploy.sh -g -r
```
