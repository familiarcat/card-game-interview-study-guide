#!/bin/bash

# SSL Certificate Monitoring and Custom Domain Setup
# Monitors SSL certificate validation and updates CloudFront distribution

set -e

# Configuration
CERTIFICATE_ARN="arn:aws:acm:us-east-1:860268930466:certificate/ee879a9e-6279-42c5-a8aa-eda90c5df130"
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

# Check certificate status
check_certificate_status() {
    log_info "Checking SSL certificate status..."
    
    CERT_STATUS=$(aws acm describe-certificate \
        --certificate-arn "$CERTIFICATE_ARN" \
        --region "$AWS_REGION" \
        --query 'Certificate.Status' \
        --output text)
    
    echo "Certificate Status: $CERT_STATUS"
    
    if [ "$CERT_STATUS" = "ISSUED" ]; then
        log_success "SSL certificate is validated and issued!"
        return 0
    elif [ "$CERT_STATUS" = "PENDING_VALIDATION" ]; then
        log_warning "Certificate still pending validation"
        return 1
    else
        log_error "Certificate status: $CERT_STATUS"
        return 1
    fi
}

# Update CloudFront distribution with custom domain
update_cloudfront_custom_domain() {
    log_info "Updating CloudFront distribution with custom domain..."
    
    # Get current distribution configuration
    DISTRIBUTION_CONFIG=$(aws cloudfront get-distribution-config \
        --id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --query 'DistributionConfig' \
        --output json)
    
    # Update the configuration with custom domain and SSL certificate
    UPDATED_CONFIG=$(echo "$DISTRIBUTION_CONFIG" | jq '
        .Aliases.Items = ["'$DOMAIN'"] |
        .Aliases.Quantity = 1 |
        .ViewerCertificate.ACMCertificateArn = "'$CERTIFICATE_ARN'" |
        .ViewerCertificate.SSLSupportMethod = "sni-only" |
        .ViewerCertificate.MinimumProtocolVersion = "TLSv1.2_2021" |
        .ViewerCertificate.Certificate = "'$CERTIFICATE_ARN'" |
        .ViewerCertificate.CertificateSource = "acm"
    ')
    
    # Get the ETag for the update
    ETAG=$(aws cloudfront get-distribution-config \
        --id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --query 'ETag' \
        --output text)
    
    # Update the distribution
    aws cloudfront update-distribution \
        --id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --distribution-config "$UPDATED_CONFIG" \
        --if-match "$ETAG"
    
    log_success "CloudFront distribution updated with custom domain!"
    log_info "Distribution will be deployed in 10-15 minutes..."
}

# Wait for CloudFront deployment
wait_for_cloudfront_deployment() {
    log_info "Waiting for CloudFront distribution to deploy..."
    
    aws cloudfront wait distribution-deployed \
        --id "$CLOUDFRONT_DISTRIBUTION_ID"
    
    log_success "CloudFront distribution deployed!"
}

# Test custom domain
test_custom_domain() {
    log_info "Testing custom domain: https://$DOMAIN"
    
    # Wait a bit for DNS propagation
    sleep 30
    
    # Test HTTPS access
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" || echo "000")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        log_success "Custom domain is working! HTTPS status: $HTTP_STATUS"
        return 0
    else
        log_warning "Custom domain test failed. HTTP status: $HTTP_STATUS"
        return 1
    fi
}

# Main monitoring function
main() {
    log_info "🔒 SSL Certificate Monitoring and Custom Domain Setup"
    log_info "Domain: $DOMAIN"
    log_info "Certificate ARN: $CERTIFICATE_ARN"
    log_info "CloudFront Distribution: $CLOUDFRONT_DISTRIBUTION_ID"
    
    echo ""
    
    # Check certificate status
    if check_certificate_status; then
        log_success "Certificate is ready! Proceeding with custom domain setup..."
        
        # Update CloudFront with custom domain
        update_cloudfront_custom_domain
        
        # Wait for deployment
        wait_for_cloudfront_deployment
        
        # Test the custom domain
        if test_custom_domain; then
            log_success "🎉 Deployment complete! Your application is now available at:"
            log_info "🌐 https://$DOMAIN"
            log_info "☁️ CloudFront Distribution ID: $CLOUDFRONT_DISTRIBUTION_ID"
            log_info "🔒 SSL Certificate: $CERTIFICATE_ARN"
        else
            log_warning "Custom domain test failed. DNS propagation may take longer."
        fi
    else
        log_info "Certificate not yet validated. Current status:"
        aws acm describe-certificate \
            --certificate-arn "$CERTIFICATE_ARN" \
            --region "$AWS_REGION" \
            --query 'Certificate.{Status: Status, DomainName: DomainName, ValidationMethod: DomainValidationOptions[0].ValidationMethod, ValidationStatus: DomainValidationOptions[0].ValidationStatus}' \
            --output table
        
        log_info "Run this script again in a few minutes to check status."
    fi
}

# Run main function
main "$@"
