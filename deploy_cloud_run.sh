#!/usr/bin/env bash
set -euo pipefail

PROJECT=${1:-$(gcloud config get-value project 2>/dev/null || echo '')}
if [ -z "$PROJECT" ]; then
  echo "Provide GCP project as first arg or run 'gcloud config set project <PROJECT_ID>'"
  exit 1
fi
REGION=${2:-us-central1}
IMAGE=gcr.io/${PROJECT}/moviezone

echo "Building and pushing image: ${IMAGE}"
gcloud builds submit --tag ${IMAGE}

echo "Deploying to Cloud Run (${REGION})"
gcloud run deploy moviezone --image ${IMAGE} --platform managed --region ${REGION} --allow-unauthenticated --port 8080

echo "Deployment finished. Run 'gcloud run services describe moviezone --platform managed --region ${REGION} --format 'value(status.url)'' to get the URL."
