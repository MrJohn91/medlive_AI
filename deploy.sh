#!/bin/bash
# MedLive AI - GCP Cloud Run Deployment Script

set -e

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project)}"
REGION="${GCP_REGION:-europe-west1}"
AGENT_SERVICE_NAME="medlive-agent"
FRONTEND_SERVICE_NAME="medlive-frontend"

echo "=========================================="
echo "MedLive AI - Cloud Run Deployment"
echo "=========================================="
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Check if project is set
if [ -z "$PROJECT_ID" ]; then
    echo "ERROR: GCP_PROJECT_ID not set and no default project configured"
    echo "Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

# Enable required APIs
echo "Enabling required GCP APIs..."
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    secretmanager.googleapis.com \
    sheets.googleapis.com \
    calendar-json.googleapis.com \
    --project=$PROJECT_ID

# Function to create/update secrets
create_secret() {
    local name=$1
    local value=$2

    if gcloud secrets describe $name --project=$PROJECT_ID &>/dev/null; then
        echo "$value" | gcloud secrets versions add $name --data-file=- --project=$PROJECT_ID
        echo "  Updated secret: $name"
    else
        echo "$value" | gcloud secrets create $name --data-file=- --project=$PROJECT_ID
        echo "  Created secret: $name"
    fi
}

# Create secrets from .env.local
echo ""
echo "Setting up secrets..."
if [ -f ".env.local" ]; then
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ $key =~ ^#.*$ ]] && continue
        [[ -z "$key" ]] && continue
        # Remove quotes from value
        value="${value%\"}"
        value="${value#\"}"
        create_secret "$key" "$value"
    done < .env.local
else
    echo "WARNING: .env.local not found. Create secrets manually."
fi

echo ""
echo "=========================================="
echo "Deploying Agent..."
echo "=========================================="

# Build and deploy agent
cd agent
gcloud builds submit --tag gcr.io/$PROJECT_ID/$AGENT_SERVICE_NAME --project=$PROJECT_ID

gcloud run deploy $AGENT_SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$AGENT_SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --set-secrets="GOOGLE_WEBRTC_URL=GOOGLE_WEBRTC_URL:latest,GOOGLE_WEBRTC_API_KEY=GOOGLE_WEBRTC_API_KEY:latest,GOOGLE_WEBRTC_API_SECRET=GOOGLE_WEBRTC_API_SECRET:latest,GOOGLE_API_KEY=GOOGLE_API_KEY:latest,ANAM_API_KEY=ANAM_API_KEY:latest,GOOGLE_SHEET_ID=GOOGLE_SHEET_ID:latest,GOOGLE_SHEET_NAME=GOOGLE_SHEET_NAME:latest" \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 1 \
    --max-instances 10 \
    --timeout 3600 \
    --project=$PROJECT_ID

AGENT_URL=$(gcloud run services describe $AGENT_SERVICE_NAME --platform managed --region $REGION --project=$PROJECT_ID --format='value(status.url)')
echo "Agent deployed at: $AGENT_URL"

cd ..

echo ""
echo "=========================================="
echo "Deploying Frontend..."
echo "=========================================="

# Get GoogleWebRTC URL for frontend build
GOOGLE_WEBRTC_URL=$(gcloud secrets versions access latest --secret=GOOGLE_WEBRTC_URL --project=$PROJECT_ID 2>/dev/null || echo "")

cd frontend
gcloud builds submit \
    --config cloudbuild.yaml \
    --substitutions=_GOOGLE_WEBRTC_URL="$GOOGLE_WEBRTC_URL" \
    --project=$PROJECT_ID

gcloud run deploy $FRONTEND_SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$FRONTEND_SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --set-secrets="GOOGLE_WEBRTC_URL=GOOGLE_WEBRTC_URL:latest,GOOGLE_WEBRTC_API_KEY=GOOGLE_WEBRTC_API_KEY:latest,GOOGLE_WEBRTC_API_SECRET=GOOGLE_WEBRTC_API_SECRET:latest" \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --project=$PROJECT_ID

FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE_NAME --platform managed --region $REGION --project=$PROJECT_ID --format='value(status.url)')
echo "Frontend deployed at: $FRONTEND_URL"

cd ..

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Agent URL:    $AGENT_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""
echo "Next steps:"
echo "1. Update GoogleWebRTC agent dispatch URL to: $AGENT_URL"
echo "2. Test the frontend at: $FRONTEND_URL"
echo ""
