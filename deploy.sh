#!/bin/bash

# Card Game Study Guide - Deployment Script
# Deploys to study.pbradygeorgen.com via AWS S3 + CloudFront

set -e  # Exit on any error

# Configuration
PROJECT_NAME="card-game-study-guide"
DOMAIN="pbradygeorgen.com"
SUBDOMAIN="study"
FULL_DOMAIN="${SUBDOMAIN}.${DOMAIN}"
S3_BUCKET="study.pbradygeorgen.com"
CLOUDFRONT_DISTRIBUTION_ID=""
AWS_REGION="us-east-1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if AWS credentials are configured
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials are not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    # Check if git is available
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed. Please install it first."
        exit 1
    fi
    
    # Check if Node.js is available
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install it first."
        exit 1
    fi
    
    # Check if npm is available
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install it first."
        exit 1
    fi
    
    log_success "All prerequisites are met!"
}

# Build the Next.js application
build_application() {
    log_info "Building Next.js application..."
    
    # Clean previous build
    if [ -d ".next" ]; then
        log_info "Cleaning previous build..."
        rm -rf .next
    fi
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci
    
    # Build the application
    log_info "Building application..."
    npm run build
    
    # Export static files
    log_info "Exporting static files..."
    npm run export
    
    log_success "Application built successfully!"
}

# Create S3 bucket if it doesn't exist
create_s3_bucket() {
    log_info "Checking S3 bucket..."
    
    if aws s3api head-bucket --bucket "$S3_BUCKET" 2>/dev/null; then
        log_info "S3 bucket $S3_BUCKET already exists"
    else
        log_info "Creating S3 bucket $S3_BUCKET..."
        aws s3api create-bucket \
            --bucket "$S3_BUCKET" \
            --region "$AWS_REGION" \
            --create-bucket-configuration LocationConstraint="$AWS_REGION"
        
        # Configure bucket for static website hosting
        aws s3api put-bucket-website \
            --bucket "$S3_BUCKET" \
            --website-configuration '{
                "IndexDocument": {"Suffix": "index.html"},
                "ErrorDocument": {"Key": "404.html"}
            }'
        
        # Set bucket policy for public read access
        aws s3api put-bucket-policy \
            --bucket "$S3_BUCKET" \
            --policy '{
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Sid": "PublicReadGetObject",
                        "Effect": "Allow",
                        "Principal": "*",
                        "Action": "s3:GetObject",
                        "Resource": "arn:aws:s3:::'$S3_BUCKET'/*"
                    }
                ]
            }'
        
        log_success "S3 bucket $S3_BUCKET created and configured!"
    fi
}

# Deploy to S3
deploy_to_s3() {
    log_info "Deploying to S3 bucket $S3_BUCKET..."
    
    # Sync out directory to S3
    aws s3 sync out/ s3://$S3_BUCKET/ \
        --delete \
        --cache-control "max-age=31536000,public" \
        --exclude "*.html" \
        --exclude "*.json" \
        --exclude "*.xml"
    
    # Sync HTML, JSON, and XML files with no-cache
    aws s3 sync out/ s3://$S3_BUCKET/ \
        --delete \
        --cache-control "no-cache,no-store,must-revalidate" \
        --include "*.html" \
        --include "*.json" \
        --include "*.xml"
    
    log_success "Deployment to S3 completed!"
}

# Create CloudFront distribution
create_cloudfront_distribution() {
    log_info "Checking CloudFront distribution..."
    
    # Check if distribution already exists
    EXISTING_DISTRIBUTION=$(aws cloudfront list-distributions --query "DistributionList.Items[?Aliases.Items[?contains(@, '$FULL_DOMAIN')]].Id" --output text)
    
    if [ "$EXISTING_DISTRIBUTION" != "None" ] && [ -n "$EXISTING_DISTRIBUTION" ]; then
        log_info "CloudFront distribution already exists: $EXISTING_DISTRIBUTION"
        CLOUDFRONT_DISTRIBUTION_ID="$EXISTING_DISTRIBUTION"
    else
        log_info "Creating CloudFront distribution..."
        
        # Create CloudFront distribution
        DISTRIBUTION_CONFIG=$(aws cloudfront create-distribution \
            --distribution-config '{
                "CallerReference": "'$(date +%s)'",
                "Comment": "Card Game Study Guide - '$FULL_DOMAIN'",
                "DefaultRootObject": "index.html",
                "Origins": {
                    "Quantity": 1,
                    "Items": [
                        {
                            "Id": "S3-'$S3_BUCKET'",
                            "DomainName": "'$S3_BUCKET'.s3.amazonaws.com",
                            "S3OriginConfig": {
                                "OriginAccessIdentity": ""
                            }
                        }
                    ]
                },
                "DefaultCacheBehavior": {
                    "TargetOriginId": "S3-'$S3_BUCKET'",
                    "ViewerProtocolPolicy": "redirect-to-https",
                    "TrustedSigners": {
                        "Enabled": false,
                        "Quantity": 0
                    },
                    "ForwardedValues": {
                        "QueryString": false,
                        "Cookies": {"Forward": "none"}
                    },
                    "MinTTL": 0,
                    "Compress": true
                },
                "Aliases": {
                    "Quantity": 1,
                    "Items": ["'$FULL_DOMAIN'"]
                },
                "Enabled": true,
                "PriceClass": "PriceClass_100"
            }' --output json)
        
        CLOUDFRONT_DISTRIBUTION_ID=$(echo "$DISTRIBUTION_CONFIG" | jq -r '.Distribution.Id')
        log_success "CloudFront distribution created: $CLOUDFRONT_DISTRIBUTION_ID"
    fi
}

# Configure DNS records
configure_dns() {
    log_info "Configuring DNS records for $FULL_DOMAIN..."
    
    # Get the hosted zone ID for the domain
    HOSTED_ZONE_ID=$(aws route53 list-hosted-zones --query "HostedZones[?Name=='$DOMAIN.'].Id" --output text)
    
    if [ -z "$HOSTED_ZONE_ID" ]; then
        log_error "Hosted zone not found for domain $DOMAIN"
        exit 1
    fi
    
    # Remove the trailing slash from hosted zone ID
    HOSTED_ZONE_ID=${HOSTED_ZONE_ID%/}
    
    # Get CloudFront distribution domain name
    CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution --id "$CLOUDFRONT_DISTRIBUTION_ID" --query "Distribution.DomainName" --output text)
    
    # Create A record alias to CloudFront
    aws route53 change-resource-record-sets \
        --hosted-zone-id "$HOSTED_ZONE_ID" \
        --change-batch '{
            "Changes": [
                {
                    "Action": "UPSERT",
                    "ResourceRecordSet": {
                        "Name": "'$FULL_DOMAIN'",
                        "Type": "A",
                        "AliasTarget": {
                            "HostedZoneId": "Z2FDTNDATAQYW2",
                            "DNSName": "'$CLOUDFRONT_DOMAIN'",
                            "EvaluateTargetHealth": false
                        }
                    }
                }
            ]
        }'
    
    log_success "DNS records configured successfully!"
}

# Invalidate CloudFront cache
invalidate_cache() {
    log_info "Invalidating CloudFront cache..."
    
    aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --paths "/*"
    
    log_success "CloudFront cache invalidation initiated!"
}

# Main deployment function
main() {
    log_info "Starting deployment for $PROJECT_NAME to $FULL_DOMAIN..."
    
    # Check prerequisites
    check_prerequisites
    
    # Build application
    build_application
    
    # Create S3 bucket
    create_s3_bucket
    
    # Deploy to S3
    deploy_to_s3
    
    # Create CloudFront distribution
    create_cloudfront_distribution
    
    # Configure DNS
    configure_dns
    
    # Invalidate cache
    invalidate_cache
    
    log_success "Deployment completed successfully!"
    log_info "Your application will be available at: https://$FULL_DOMAIN"
    log_info "CloudFront distribution ID: $CLOUDFRONT_DISTRIBUTION_ID"
    log_warning "Note: DNS changes may take up to 48 hours to propagate globally"
}

# Run main function
main "$@"
