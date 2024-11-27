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

Before running the command below, you have to set the environment variable `GOOGLE_API_KEY` to your Google API key for genai api.. To create a Google API key, please refer to [this link](https://github.com/google-gemini/generative-ai-python?tab=readme-ov-file).

You can do all these steps by running the following command:
```bash
$ cd deploy
$ GOOGLE_API_KEY=<Your API Key> ./deploy.sh
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
$ DB_INSTANCE_CONNECTION_NAME=<Your DB Instance Connection Name> DB_PASSWORD=<Your DB Password> GOOGLE_API_KEY=<Your API Key> ./deploy.sh -g -r
```
