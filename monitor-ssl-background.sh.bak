#!/bin/bash

# Background SSL Certificate Monitoring with Native OS Notifications
# Polls SSL certificate validation and shows desktop notifications

set -e

# Configuration
CERTIFICATE_ARN="arn:aws:acm:us-east-1:860268930466:certificate/ee879a9e-6279-42c5-a8aa-eda90c5df130"
CLOUDFRONT_DISTRIBUTION_ID="E175Q7XYH39KAQ"
DOMAIN="study.pbradygeorgen.com"
AWS_REGION="us-east-1"
POLL_INTERVAL=60  # Check every 60 seconds

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[$(date '+%H:%M:%S')] [INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[$(date '+%H:%M:%S')] [SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[$(date '+%H:%M:%S')] [WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[$(date '+%H:%M:%S')] [ERROR]${NC} $1"; }

# Detect OS and set notification command
detect_os_notification() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        NOTIFY_CMD="osascript -e 'display notification \"%s\" with title \"SSL Monitor\"'"
        ALERT_CMD="osascript -e 'display alert \"SSL Monitor\" message \"%s\" buttons {\"OK\"} default button \"OK\"'"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v notify-send &> /dev/null; then
            NOTIFY_CMD="notify-send 'SSL Monitor' '%s'"
            ALERT_CMD="zenity --info --title='SSL Monitor' --text='%s' --no-wrap"
        elif command -v kdialog &> /dev/null; then
            NOTIFY_CMD="kdialog --title 'SSL Monitor' --passivepopup '%s' 5"
            ALERT_CMD="kdialog --title 'SSL Monitor' --msgbox '%s'"
        else
            NOTIFY_CMD="echo 'NOTIFICATION: %s'"
            ALERT_CMD="echo 'ALERT: %s'"
        fi
    else
        # Windows or other
        NOTIFY_CMD="echo 'NOTIFICATION: %s'"
        ALERT_CMD="echo 'ALERT: %s'"
    fi
}

# Show notification
show_notification() {
    local message="$1"
    printf "$NOTIFY_CMD" "$message" | sh
}

# Show alert
show_alert() {
    local message="$1"
    printf "$ALERT_CMD" "$message" | sh
}

# Check certificate status
check_certificate_status() {
    local cert_status=$(aws acm describe-certificate \
        --certificate-arn "$CERTIFICATE_ARN" \
        --region "$AWS_REGION" \
        --query 'Certificate.Status' \
        --output text 2>/dev/null || echo "ERROR")
    
    echo "$cert_status"
}

# Update CloudFront distribution with custom domain
update_cloudfront_custom_domain() {
    log_info "Updating CloudFront distribution with custom domain..."
    
    # Get current distribution configuration
    local distribution_config=$(aws cloudfront get-distribution-config \
        --id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --query 'DistributionConfig' \
        --output json)
    
    # Update the configuration with custom domain and SSL certificate
    local updated_config=$(echo "$distribution_config" | jq '
        .Aliases.Items = ["'$DOMAIN'"] |
        .Aliases.Quantity = 1 |
        .ViewerCertificate.ACMCertificateArn = "'$CERTIFICATE_ARN'" |
        .ViewerCertificate.SSLSupportMethod = "sni-only" |
        .ViewerCertificate.MinimumProtocolVersion = "TLSv1.2_2021" |
        .ViewerCertificate.Certificate = "'$CERTIFICATE_ARN'" |
        .ViewerCertificate.CertificateSource = "acm"
    ')
    
    # Get the ETag for the update
    local etag=$(aws cloudfront get-distribution-config \
        --id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --query 'ETag' \
        --output text)
    
    # Update the distribution
    aws cloudfront update-distribution \
        --id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --distribution-config "$updated_config" \
        --if-match "$etag"
    
    log_success "CloudFront distribution updated with custom domain!"
}

# Test custom domain
test_custom_domain() {
    log_info "Testing custom domain: https://$DOMAIN"
    
    # Wait a bit for DNS propagation
    sleep 30
    
    # Test HTTPS access
    local http_status=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" --max-time 10 || echo "000")
    
    if [ "$http_status" = "200" ]; then
        log_success "Custom domain is working! HTTPS status: $http_status"
        return 0
    else
        log_warning "Custom domain test failed. HTTP status: $http_status"
        return 1
    fi
}

# Main monitoring loop
main() {
    log_info "🔒 Background SSL Certificate Monitoring Started"
    log_info "Domain: $DOMAIN"
    log_info "Certificate ARN: $CERTIFICATE_ARN"
    log_info "CloudFront Distribution: $CLOUDFRONT_DISTRIBUTION_ID"
    log_info "Polling every $POLL_INTERVAL seconds..."
    log_info "Press Ctrl+C to stop monitoring"
    
    echo ""
    
    # Show initial notification
    show_notification "SSL monitoring started for $DOMAIN"
    
    local previous_status=""
    local check_count=0
    
    while true; do
        check_count=$((check_count + 1))
        log_info "Check #$check_count - Checking certificate status..."
        
        # Check certificate status
        local cert_status=$(check_certificate_status)
        
        if [ "$cert_status" = "ERROR" ]; then
            log_error "Failed to check certificate status"
            show_notification "Error checking SSL certificate status"
        elif [ "$cert_status" = "ISSUED" ]; then
            if [ "$previous_status" != "ISSUED" ]; then
                log_success "🎉 SSL Certificate is validated and issued!"
                show_alert "SSL Certificate validated! Updating CloudFront distribution..."
                
                # Update CloudFront with custom domain
                if update_cloudfront_custom_domain; then
                    show_notification "CloudFront updated! Testing custom domain..."
                    
                    # Test the custom domain
                    if test_custom_domain; then
                        log_success "🎉 Deployment complete!"
                        show_alert "🎉 Deployment Complete!\n\nYour application is now available at:\nhttps://$DOMAIN\n\nCloudFront Distribution: $CLOUDFRONT_DISTRIBUTION_ID\nSSL Certificate: $CERTIFICATE_ARN"
                        
                        # Exit successfully
                        exit 0
                    else
                        show_alert "⚠️ Custom domain test failed\n\nDomain: https://$DOMAIN\nStatus: HTTP $http_status\n\nDNS propagation may take longer."
                    fi
                else
                    show_alert "❌ Failed to update CloudFront distribution"
                fi
            fi
        elif [ "$cert_status" = "PENDING_VALIDATION" ]; then
            if [ "$previous_status" != "PENDING_VALIDATION" ]; then
                log_info "Certificate still pending validation..."
                show_notification "SSL certificate pending validation for $DOMAIN"
            fi
        elif [ "$cert_status" = "FAILED" ]; then
            log_error "Certificate validation failed!"
            show_alert "❌ SSL Certificate validation failed!\n\nPlease check the AWS Console for details."
            exit 1
        else
            log_warning "Unknown certificate status: $cert_status"
        fi
        
        # Update previous status
        previous_status="$cert_status"
        
        # Show progress every 5 checks
        if [ $((check_count % 5)) -eq 0 ]; then
            log_info "Still monitoring... (Check #$check_count)"
            show_notification "SSL monitoring active - Check #$check_count"
        fi
        
        # Wait before next check
        log_info "Waiting $POLL_INTERVAL seconds before next check..."
        sleep "$POLL_INTERVAL"
    done
}

# Trap Ctrl+C to show final status
trap 'echo ""; log_info "Monitoring stopped by user"; show_notification "SSL monitoring stopped for $DOMAIN"; exit 0' INT

# Detect OS and start monitoring
detect_os_notification
main "$@"
