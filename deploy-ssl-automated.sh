#!/bin/bash

# Enhanced Deployment Script with SSL and DNS Automation
# Fully automated SSL certificate and DNS management

set -e

# Configuration
PROJECT_NAME="card-game-study-guide"
DOMAIN="pbradygeorgen.com"
SUBDOMAIN="study"
FULL_DOMAIN="${SUBDOMAIN}.${DOMAIN}"
S3_BUCKET="study.pbradygeorgen.com"
AWS_REGION="us-east-1"
EMAIL="your-email@${DOMAIN}"  # Update this with your email

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if domain has Route53 hosted zone
check_route53_zone() {
    log_info "Checking Route53 hosted zone for $DOMAIN..."
    
    HOSTED_ZONE_ID=$(aws route53 list-hosted-zones \
        --query "HostedZones[?Name=='$DOMAIN.'].Id" \
        --output text 2>/dev/null || echo "")
    
    if [ -z "$HOSTED_ZONE_ID" ]; then
        log_warning "No hosted zone found for $DOMAIN"
        
        # Option to create hosted zone
        read -p "Create Route53 hosted zone for $DOMAIN? (y/n): " create_zone
        if [ "$create_zone" = "y" ]; then
            create_route53_zone
        else
            log_error "Route53 hosted zone required for automated DNS management"
            exit 1
        fi
    else
        # Remove the '/hostedzone/' prefix
        HOSTED_ZONE_ID=${HOSTED_ZONE_ID#/hostedzone/}
        log_success "Found hosted zone: $HOSTED_ZONE_ID"
    fi
}

# Create Route53 hosted zone
create_route53_zone() {
    log_info "Creating Route53 hosted zone for $DOMAIN..."
    
    CALLER_REF=$(date +%s)
    ZONE_RESULT=$(aws route53 create-hosted-zone \
        --name "$DOMAIN" \
        --caller-reference "$CALLER_REF" \
        --hosted-zone-config Comment="Automated zone for $PROJECT_NAME")
    
    HOSTED_ZONE_ID=$(echo "$ZONE_RESULT" | jq -r '.HostedZone.Id' | sed 's|/hostedzone/||')
    NAMESERVERS=$(echo "$ZONE_RESULT" | jq -r '.DelegationSet.NameServers[]' | tr '\n' ' ')
    
    log_success "Created hosted zone: $HOSTED_ZONE_ID"
    log_warning "Update your domain registrar with these nameservers:"
    echo "$NAMESERVERS" | tr ' ' '\n' | sed 's/^/  - /'
    
    read -p "Press Enter after updating nameservers at your registrar..."
}

# Request SSL certificate via ACM
request_ssl_certificate() {
    log_info "Requesting SSL certificate for $FULL_DOMAIN..."
    
    # Check if certificate already exists
    EXISTING_CERT=$(aws acm list-certificates \
        --region us-east-1 \
        --query "CertificateSummaryList[?DomainName=='$FULL_DOMAIN'].CertificateArn" \
        --output text)
    
    if [ -n "$EXISTING_CERT" ] && [ "$EXISTING_CERT" != "None" ]; then
        log_info "Using existing certificate: $EXISTING_CERT"
        CERTIFICATE_ARN="$EXISTING_CERT"
        return 0
    fi
    
    # Request new certificate
    CERT_REQUEST=$(aws acm request-certificate \
        --domain-name "$FULL_DOMAIN" \
        --validation-method DNS \
        --region us-east-1 \
        --subject-alternative-names "www.$FULL_DOMAIN")
    
    CERTIFICATE_ARN=$(echo "$CERT_REQUEST" | jq -r '.CertificateArn')
    log_success "Certificate requested: $CERTIFICATE_ARN"
    
    # Wait for validation options
    log_info "Waiting for DNS validation options..."
    sleep 10
    
    # Get DNS validation records
    VALIDATION_RECORDS=$(aws acm describe-certificate \
        --certificate-arn "$CERTIFICATE_ARN" \
        --region us-east-1 \
        --query 'Certificate.DomainValidationOptions[0].ResourceRecord')
    
    VALIDATION_NAME=$(echo "$VALIDATION_RECORDS" | jq -r '.Name')
    VALIDATION_VALUE=$(echo "$VALIDATION_RECORDS" | jq -r '.Value')
    VALIDATION_TYPE=$(echo "$VALIDATION_RECORDS" | jq -r '.Type')
    
    # Create DNS validation record
    log_info "Creating DNS validation record..."
    aws route53 change-resource-record-sets \
        --hosted-zone-id "$HOSTED_ZONE_ID" \
        --change-batch '{
            "Changes": [{
                "Action": "UPSERT",
                "ResourceRecordSet": {
                    "Name": "'$VALIDATION_NAME'",
                    "Type": "'$VALIDATION_TYPE'",
                    "TTL": 300,
                    "ResourceRecords": [{"Value": "\"'$VALIDATION_VALUE'\""}]
                }
            }]
        }'
    
    # Wait for certificate validation
    log_info "Waiting for certificate validation (this may take several minutes)..."
    aws acm wait certificate-validated \
        --certificate-arn "$CERTIFICATE_ARN" \
        --region us-east-1
    
    log_success "SSL certificate validated and issued!"
}

# Create CloudFront distribution with SSL
create_cloudfront_with_ssl() {
    log_info "Creating CloudFront distribution with SSL certificate..."
    
    # Check if distribution already exists
    EXISTING_DISTRIBUTION=$(aws cloudfront list-distributions \
        --query "DistributionList.Items[?Aliases.Items[?contains(@, '$FULL_DOMAIN')]].Id" \
        --output text)
    
    if [ -n "$EXISTING_DISTRIBUTION" ] && [ "$EXISTING_DISTRIBUTION" != "None" ]; then
        log_info "Using existing distribution: $EXISTING_DISTRIBUTION"
        CLOUDFRONT_DISTRIBUTION_ID="$EXISTING_DISTRIBUTION"
        return 0
    fi
    
    # Create CloudFront distribution with custom SSL
    DISTRIBUTION_CONFIG=$(aws cloudfront create-distribution \
        --distribution-config '{
            "CallerReference": "'$(date +%s)'",
            "Comment": "Card Game Study Guide - '$FULL_DOMAIN' with SSL",
            "DefaultRootObject": "index.html",
            "Origins": {
                "Quantity": 1,
                "Items": [{
                    "Id": "S3-'$S3_BUCKET'",
                    "DomainName": "'$S3_BUCKET'.s3.amazonaws.com",
                    "S3OriginConfig": {
                        "OriginAccessIdentity": ""
                    }
                }]
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
            "ViewerCertificate": {
                "ACMCertificateArn": "'$CERTIFICATE_ARN'",
                "SSLSupportMethod": "sni-only",
                "MinimumProtocolVersion": "TLSv1.2_2021"
            },
            "Enabled": true,
            "PriceClass": "PriceClass_100"
        }' --output json)
    
    CLOUDFRONT_DISTRIBUTION_ID=$(echo "$DISTRIBUTION_CONFIG" | jq -r '.Distribution.Id')
    CLOUDFRONT_DOMAIN=$(echo "$DISTRIBUTION_CONFIG" | jq -r '.Distribution.DomainName')
    
    log_success "CloudFront distribution created: $CLOUDFRONT_DISTRIBUTION_ID"
    log_info "Distribution domain: $CLOUDFRONT_DOMAIN"
    
    # Wait for distribution to deploy
    log_info "Waiting for CloudFront distribution to deploy (this may take 10-15 minutes)..."
    aws cloudfront wait distribution-deployed --id "$CLOUDFRONT_DISTRIBUTION_ID"
    log_success "CloudFront distribution deployed!"
}

# Configure DNS A record
configure_dns_record() {
    log_info "Configuring DNS A record for $FULL_DOMAIN..."
    
    # Get CloudFront distribution domain
    CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
        --id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --query "Distribution.DomainName" \
        --output text)
    
    # Create A record alias to CloudFront
    aws route53 change-resource-record-sets \
        --hosted-zone-id "$HOSTED_ZONE_ID" \
        --change-batch '{
            "Changes": [{
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
            }]
        }'
    
    log_success "DNS A record configured for $FULL_DOMAIN"
}

# Main automation function
main() {
    log_info "Starting automated SSL and DNS deployment for $FULL_DOMAIN..."
    
    # 1. Check/create Route53 hosted zone
    check_route53_zone
    
    # 2. Request SSL certificate
    request_ssl_certificate
    
    # 3. Run standard deployment (S3 setup)
    log_info "Running standard deployment..."
    ./deploy.sh
    
    # 4. Create CloudFront with SSL
    create_cloudfront_with_ssl
    
    # 5. Configure DNS
    configure_dns_record
    
    # 6. Invalidate cache
    log_info "Invalidating CloudFront cache..."
    aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --paths "/*"
    
    log_success "🎉 Automated deployment completed successfully!"
    log_info "🌐 Your application is now available at: https://$FULL_DOMAIN"
    log_info "☁️ CloudFront distribution ID: $CLOUDFRONT_DISTRIBUTION_ID"
    log_info "🔒 SSL certificate ARN: $CERTIFICATE_ARN"
    log_warning "⏰ DNS changes may take up to 48 hours to propagate globally"
}

# Run main function
main "$@"
