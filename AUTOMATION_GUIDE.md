# 🚀 Complete Automation Guide - SSL & DNS

## Overview

This guide covers fully automated SSL certificate management and DNS registry automation using AWS CLI and SSH-based authentication for the Card Game Study Guide deployment.

## 🔐 Authentication Methods

### SSH Keys vs SSL Certificates

| Purpose | SSH Keys (~/.ssh/) | SSL Certificates |
|---------|-------------------|------------------|
| **Use Case** | Server authentication, Git access | HTTPS encryption |
| **Location** | ~/.ssh/id_rsa, ~/.ssh/id_ed25519 | AWS Certificate Manager |
| **Scope** | SSH connections, Git operations | Web traffic encryption |
| **Automation** | ✅ Yes (via ssh-agent) | ✅ Yes (via AWS ACM) |

## 📋 Prerequisites

### Required Tools
- AWS CLI configured with appropriate permissions
- jq (JSON processor): `brew install jq`
- SSH keys for Git operations
- Route53 domain or ability to create hosted zone

### Required AWS Permissions
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:*",
                "cloudfront:*",
                "route53:*",
                "acm:*",
                "iam:GetUser",
                "sts:GetCallerIdentity"
            ],
            "Resource": "*"
        }
    ]
}
```

## 🛠️ Setup Methods

### Method 1: SSH-Based Authentication Setup
```bash
# Configure SSH keys and AWS authentication
./configure-ssh-aws.sh
```

**This script will:**
- ✅ Generate SSH keys if needed
- ✅ Configure Git SSH access
- ✅ Set up AWS CLI authentication
- ✅ Create SSH agent configuration
- ✅ Add deployment aliases to ~/.zshrc

### Method 2: Fully Automated SSL + DNS Deployment
```bash
# Complete automated deployment with SSL and DNS
./deploy-ssl-automated.sh
```

**This script will:**
- ✅ Check/create Route53 hosted zone
- ✅ Request SSL certificate via AWS ACM
- ✅ Automatically validate certificate via DNS
- ✅ Create CloudFront distribution with SSL
- ✅ Configure DNS A records
- ✅ Deploy application to S3

## 🔄 Automation Workflows

### Workflow 1: Initial Setup
```bash
# 1. Configure SSH and AWS authentication
./configure-ssh-aws.sh

# 2. Source updated shell configuration
source ~/.zshrc

# 3. Run fully automated deployment
./deploy-ssl-automated.sh
```

### Workflow 2: CI/CD Integration
```bash
# GitHub Actions can use AWS credentials stored as secrets
# and automatically run the deployment pipeline
git push origin main  # Triggers automated deployment
```

### Workflow 3: Manual Deployment with SSH
```bash
# Use SSH-aware aliases
deploy-ssh           # SSH + automated SSL deployment
git-deploy          # SSH + Git push
check-ssh           # Verify SSH agent
aws-identity        # Verify AWS authentication
```

## 🌐 DNS Registry Automation

### Automated DNS Operations

#### 1. Route53 Hosted Zone Management
```bash
# Create hosted zone
aws route53 create-hosted-zone \
    --name pbradygeorgen.com \
    --caller-reference $(date +%s)

# List hosted zones
aws route53 list-hosted-zones

# Get zone nameservers
aws route53 get-hosted-zone --id Z1234567890ABC
```

#### 2. DNS Record Management
```bash
# Create A record
aws route53 change-resource-record-sets \
    --hosted-zone-id Z1234567890ABC \
    --change-batch '{
        "Changes": [{
            "Action": "UPSERT",
            "ResourceRecordSet": {
                "Name": "study.pbradygeorgen.com",
                "Type": "A",
                "AliasTarget": {
                    "HostedZoneId": "Z2FDTNDATAQYW2",
                    "DNSName": "d123456789.cloudfront.net",
                    "EvaluateTargetHealth": false
                }
            }
        }]
    }'

# Create CNAME record
aws route53 change-resource-record-sets \
    --hosted-zone-id Z1234567890ABC \
    --change-batch '{
        "Changes": [{
            "Action": "UPSERT",
            "ResourceRecordSet": {
                "Name": "www.study.pbradygeorgen.com",
                "Type": "CNAME",
                "TTL": 300,
                "ResourceRecords": [{"Value": "study.pbradygeorgen.com"}]
            }
        }]
    }'
```

#### 3. DNS Validation for SSL
```bash
# Automated certificate validation via DNS
# (handled automatically by deploy-ssl-automated.sh)

# Manual validation record creation
aws acm describe-certificate \
    --certificate-arn arn:aws:acm:us-east-1:123456789:certificate/abc-123 \
    --query 'Certificate.DomainValidationOptions[0].ResourceRecord'
```

## 🔒 SSL Certificate Automation

### AWS Certificate Manager (ACM)
```bash
# Request certificate
aws acm request-certificate \
    --domain-name study.pbradygeorgen.com \
    --subject-alternative-names www.study.pbradygeorgen.com \
    --validation-method DNS \
    --region us-east-1

# List certificates
aws acm list-certificates --region us-east-1

# Wait for validation
aws acm wait certificate-validated \
    --certificate-arn arn:aws:acm:us-east-1:123456789:certificate/abc-123 \
    --region us-east-1
```

### Let's Encrypt Alternative
```bash
# Using certbot with Route53 DNS challenge
certbot certonly \
    --dns-route53 \
    --dns-route53-propagation-seconds 60 \
    -d study.pbradygeorgen.com \
    -d www.study.pbradygeorgen.com \
    --email your-email@domain.com \
    --agree-tos \
    --non-interactive
```

## 📊 Monitoring and Validation

### Automated Checks
```bash
# Verify SSL certificate
curl -I https://study.pbradygeorgen.com

# Check DNS propagation
dig study.pbradygeorgen.com

# Verify CloudFront distribution
aws cloudfront get-distribution --id E1234567890ABC

# Check certificate status
aws acm describe-certificate \
    --certificate-arn arn:aws:acm:us-east-1:123456789:certificate/abc-123 \
    --region us-east-1
```

### Health Check Script
```bash
#!/bin/bash
# health-check.sh

DOMAIN="study.pbradygeorgen.com"

echo "🔍 Checking $DOMAIN health..."

# SSL certificate check
echo "📋 SSL Certificate:"
echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | \
    openssl x509 -noout -dates

# DNS resolution
echo "🌐 DNS Resolution:"
dig +short $DOMAIN

# HTTP response
echo "📡 HTTP Response:"
curl -s -o /dev/null -w "Status: %{http_code}\nTime: %{time_total}s\n" https://$DOMAIN

# CloudFront cache status
echo "☁️ CloudFront Status:"
curl -s -I https://$DOMAIN | grep -i "x-cache"
```

## 🚨 Troubleshooting

### Common Issues and Solutions

#### DNS Propagation Delays
```bash
# Check multiple DNS servers
dig @8.8.8.8 study.pbradygeorgen.com
dig @1.1.1.1 study.pbradygeorgen.com
dig @208.67.222.222 study.pbradygeorgen.com
```

#### SSL Certificate Validation Issues
```bash
# Check ACM certificate status
aws acm describe-certificate \
    --certificate-arn $CERT_ARN \
    --region us-east-1 \
    --query 'Certificate.Status'

# Verify DNS validation records
aws route53 list-resource-record-sets \
    --hosted-zone-id $ZONE_ID \
    --query 'ResourceRecordSets[?Type==`CNAME`]'
```

#### CloudFront Distribution Issues
```bash
# Check distribution status
aws cloudfront get-distribution \
    --id $DISTRIBUTION_ID \
    --query 'Distribution.Status'

# Wait for deployment
aws cloudfront wait distribution-deployed \
    --id $DISTRIBUTION_ID
```

## 📝 Best Practices

### Security
- ✅ Use SSH keys for Git authentication
- ✅ Store AWS credentials in ~/.zshrc (not in code)
- ✅ Use IAM roles when possible (EC2/containers)
- ✅ Enable CloudTrail for audit logging
- ✅ Rotate SSH keys and AWS credentials regularly

### Automation
- ✅ Use idempotent scripts (can run multiple times safely)
- ✅ Implement proper error handling and rollback
- ✅ Monitor certificate expiration (ACM auto-renews)
- ✅ Set up alerts for deployment failures
- ✅ Use tags for resource management

### DNS Management
- ✅ Use Route53 for both domain hosting and SSL validation
- ✅ Implement health checks for critical domains
- ✅ Use short TTLs during initial setup
- ✅ Set up monitoring for DNS resolution failures

## 🔄 Continuous Integration

### GitHub Actions Integration
```yaml
# .github/workflows/deploy-ssl.yml
name: Deploy with SSL Automation

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Run automated SSL deployment
      run: ./deploy-ssl-automated.sh
```

---

**Last Updated**: $(date)
**Maintainer**: n8n Crew - Git and AWS Development Team
**Repository**: [Card Game Study Guide](https://github.com/familiarcat/card-game-interview-study-guide)
