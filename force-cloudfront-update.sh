#!/bin/bash

# Force CloudFront Update with Custom Domain
# Since study.pbradygeorgen.com is validated, let's update CloudFront now

set -e

# Configuration
CERTIFICATE_ARN="arn:aws:acm:us-east-1:860268930466:certificate/20398ffc-b3bd-44bb-9a25-6daa64520fb0"
CLOUDFRONT_DISTRIBUTION_ID="E175Q7XYH39KAQ"
DOMAIN="study.pbradygeorgen.com"
AWS_REGION="us-east-1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "🔒 Force CloudFront Update with Custom Domain"
echo "============================================"
echo "Domain: $DOMAIN"
echo "Certificate: $CERTIFICATE_ARN"
echo "CloudFront: $CLOUDFRONT_DISTRIBUTION_ID"
echo ""

# Check if main domain is validated
log_info "Checking main domain validation status..."
MAIN_DOMAIN_STATUS=$(aws acm describe-certificate \
    --certificate-arn "$CERTIFICATE_ARN" \
    --region "$AWS_REGION" \
    --query 'Certificate.DomainValidationOptions[0].ValidationStatus' \
    --output text)

if [ "$MAIN_DOMAIN_STATUS" = "SUCCESS" ]; then
    log_success "Main domain $DOMAIN is validated (Status: $MAIN_DOMAIN_STATUS)"
else
    log_error "Main domain $DOMAIN is not validated (Status: $MAIN_DOMAIN_STATUS)"
    log_info "Cannot proceed until main domain is validated"
    exit 1
fi

# Update CloudFront distribution with custom domain
log_info "Updating CloudFront distribution with custom domain..."

# Get current distribution configuration
log_info "Getting current CloudFront configuration..."
DISTRIBUTION_CONFIG=$(aws cloudfront get-distribution-config \
    --id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --query 'DistributionConfig' \
    --output json)

# Update the configuration with custom domain and SSL certificate
# Remove conflicting certificate settings and set only ACM certificate
log_info "Updating configuration with custom domain and SSL certificate..."
UPDATED_CONFIG=$(echo "$DISTRIBUTION_CONFIG" | jq '
    .Aliases.Items = ["'$DOMAIN'"] |
    .Aliases.Quantity = 1 |
    .ViewerCertificate.ACMCertificateArn = "'$CERTIFICATE_ARN'" |
    .ViewerCertificate.SSLSupportMethod = "sni-only" |
    .ViewerCertificate.MinimumProtocolVersion = "TLSv1.2_2021" |
    .ViewerCertificate.CertificateSource = "acm" |
    del(.ViewerCertificate.CloudFrontDefaultCertificate) |
    del(.ViewerCertificate.IAMCertificateId) |
    del(.ViewerCertificate.Certificate)
')

# Get the ETag for the update
log_info "Getting ETag for distribution update..."
ETAG=$(aws cloudfront get-distribution-config \
    --id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --query 'ETag' \
    --output text)

# Update the distribution
log_info "Updating CloudFront distribution..."
aws cloudfront update-distribution \
    --id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --distribution-config "$UPDATED_CONFIG" \
    --if-match "$ETAG"

log_success "CloudFront distribution updated with custom domain!"
log_info "Distribution will be deployed in 10-15 minutes..."

# Wait for deployment
log_info "Waiting for CloudFront distribution to deploy..."
aws cloudfront wait distribution-deployed \
    --id "$CLOUDFRONT_DISTRIBUTION_ID"

log_success "CloudFront distribution deployed!"

# Test the custom domain
log_info "Testing custom domain: https://$DOMAIN"
log_info "Waiting 30 seconds for DNS propagation..."

sleep 30

# Test HTTPS access
log_info "Testing HTTPS access..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" --max-time 10 || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    log_success "🎉 Custom domain is working! HTTPS status: $HTTP_STATUS"
    log_success "Your application is now available at: https://$DOMAIN"
else
    log_warning "Custom domain test failed. HTTP status: $HTTP_STATUS"
    log_info "This might be due to DNS propagation delays"
    log_info "Try again in a few minutes: https://$DOMAIN"
fi

echo ""
log_success "CloudFront update complete!"
log_info "Distribution ID: $CLOUDFRONT_DISTRIBUTION_ID"
log_info "Custom Domain: https://$DOMAIN"
log_info "SSL Certificate: $CERTIFICATE_ARN"
