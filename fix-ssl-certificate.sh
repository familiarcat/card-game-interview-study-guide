#!/bin/bash

# Fix SSL Certificate - Request new certificate with only main domain
# Remove the problematic www subdomain that's blocking validation

set -e

# Configuration
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

echo "🔒 Fix SSL Certificate - Remove Problematic www Subdomain"
echo "========================================================="
echo "Domain: $DOMAIN"
echo ""

# Check current certificates
log_info "Checking current SSL certificates..."
CURRENT_CERTS=$(aws acm list-certificates --region "$AWS_REGION" --query 'CertificateSummaryList[?DomainName==`'$DOMAIN'` || DomainName==`www.'$DOMAIN'`]' --output table)

if [ -n "$CURRENT_CERTS" ]; then
    log_info "Found existing certificates:"
    echo "$CURRENT_CERTS"
    echo ""
    
    log_warning "The current certificate includes www.$DOMAIN which is blocking validation"
    log_info "We need to request a new certificate with only $DOMAIN"
else
    log_info "No existing certificates found for $DOMAIN"
fi

# Request new certificate with only main domain
log_info "Requesting new SSL certificate for $DOMAIN only..."
NEW_CERT_ARN=$(aws acm request-certificate \
    --domain-name "$DOMAIN" \
    --validation-method DNS \
    --region "$AWS_REGION" \
    --query 'CertificateArn' \
    --output text)

if [ "$NEW_CERT_ARN" = "None" ] || [ -z "$NEW_CERT_ARN" ]; then
    log_error "Failed to request new certificate"
    exit 1
fi

log_success "New certificate requested successfully!"
log_info "Certificate ARN: $NEW_CERT_ARN"

# Get DNS validation record
log_info "Getting DNS validation record..."
DNS_RECORD=$(aws acm describe-certificate \
    --certificate-arn "$NEW_CERT_ARN" \
    --region "$AWS_REGION" \
    --query 'Certificate.DomainValidationOptions[0].ResourceRecord' \
    --output json)

if [ "$DNS_RECORD" = "null" ] || [ -z "$DNS_RECORD" ]; then
    log_error "Failed to get DNS validation record"
    exit 1
fi

# Extract DNS record details
CNAME_NAME=$(echo "$DNS_RECORD" | jq -r '.Name')
CNAME_VALUE=$(echo "$DNS_RECORD" | jq -r '.Value')

log_info "DNS Validation Record:"
log_info "Name: $CNAME_NAME"
log_info "Value: $CNAME_VALUE"
echo ""

# Create DNS validation record in Route53
log_info "Creating DNS validation record in Route53..."
aws route53 change-resource-record-sets \
    --hosted-zone-id Z0759101F61W3MIFHSWK \
    --change-batch "{
        \"Changes\": [
            {
                \"Action\": \"UPSERT\",
                \"ResourceRecordSet\": {
                    \"Name\": \"$CNAME_NAME\",
                    \"Type\": \"CNAME\",
                    \"TTL\": 300,
                    \"ResourceRecords\": [
                        {
                            \"Value\": \"$CNAME_VALUE\"
                        }
                    ]
                }
            }
        ]
    }"

log_success "DNS validation record created in Route53!"
echo ""

# Update monitoring scripts with new certificate ARN
log_info "Updating monitoring scripts with new certificate ARN..."
sed -i.bak "s|CERTIFICATE_ARN=.*|CERTIFICATE_ARN=\"$NEW_CERT_ARN\"|g" monitor-ssl.sh
sed -i.bak "s|CERTIFICATE_ARN=.*|CERTIFICATE_ARN=\"$NEW_CERT_ARN\"|g" monitor-ssl-background.sh
sed -i.bak "s|CERTIFICATE_ARN=.*|CERTIFICATE_ARN=\"$NEW_CERT_ARN\"|g" force-cloudfront-update.sh

log_success "Monitoring scripts updated with new certificate ARN!"
echo ""

log_success "🎉 SSL Certificate Fix Complete!"
log_info "New certificate requested: $NEW_CERT_ARN"
log_info "DNS validation record created"
log_info "Monitoring scripts updated"
echo ""
log_info "Next steps:"
log_info "1. Wait 5-15 minutes for DNS validation"
log_info "2. Run: ./monitor-ssl.sh"
log_info "3. Once validated, run: ./force-cloudfront-update.sh"
echo ""
log_info "The new certificate will only include $DOMAIN (no www subdomain)"
