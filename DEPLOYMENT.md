# 🚀 Deployment Guide - Card Game Study Guide

## Overview

This guide covers the complete deployment process for the Card Game Study Guide application to the subdomain `study.pbradygeorgen.com` using AWS S3, CloudFront, and Route53.

## 🏗️ Architecture

```
GitHub Repository → GitHub Actions → AWS S3 → CloudFront → Route53 → study.pbradygeorgen.com
```

### Components
- **S3 Bucket**: Static file hosting (`study.pbradygeorgen.com`)
- **CloudFront**: CDN for global distribution and HTTPS
- **Route53**: DNS management for the subdomain
- **GitHub Actions**: Automated CI/CD pipeline

## 📋 Prerequisites

### Required Tools
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- [Node.js 18+](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [jq](https://stedolan.github.io/jq/) (for JSON parsing)

### AWS Services Access
- S3 (bucket creation and management)
- CloudFront (distribution creation and management)
- Route53 (DNS record management)
- IAM (user with appropriate permissions)

### GitHub Repository
- Repository with main branch
- GitHub Actions enabled
- Repository secrets configured

## 🔧 Initial Setup

### 1. Run Setup Script
```bash
./setup-deployment.sh
```

This script will:
- Add environment variables to `~/.zshrc`
- Create useful aliases
- Verify prerequisites
- Test build and export processes
- Create deployment configuration

### 2. Configure AWS Credentials
```bash
aws configure
```

Enter your:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `us-east-1`
- Default output format: `json`

### 3. Verify AWS Configuration
```bash
aws sts get-caller-identity
```

## 🔑 GitHub Repository Secrets

Set these secrets in your GitHub repository (Settings → Secrets and variables → Actions):

### Required Secrets
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

### Setting Secrets via CLI
```bash
gh secret set AWS_ACCESS_KEY_ID --body "your-access-key"
gh secret set AWS_SECRET_ACCESS_KEY --body "your-secret-key"
```

## 🚀 Deployment Process

### Automatic Deployment (Recommended)
Push to the `main` branch triggers automatic deployment:

```bash
git add .
git commit -m "feat: new feature"
git push origin main
```

### Manual Deployment
```bash
# Build and deploy
npm run deploy

# Or step by step
npm run export
./deploy.sh
```

## 📁 File Structure

```
├── deploy.sh                    # Main deployment script
├── setup-deployment.sh          # Environment setup script
├── .github/workflows/deploy.yml # GitHub Actions workflow
├── .git/hooks/
│   ├── pre-commit              # Pre-commit quality checks
│   └── pre-push                # Pre-push deployment checks
├── next.config.ts              # Next.js configuration
├── package.json                 # Package configuration
└── deployment-config.env        # Deployment configuration
```

## 🔍 Monitoring and Debugging

### Check Deployment Status
```bash
# Check AWS credentials
check-aws

# Check S3 bucket contents
check-s3

# Check CloudFront distribution
check-cloudfront

# View CloudFront distribution details
aws cloudfront get-distribution --id <DISTRIBUTION_ID>
```

### Common Issues and Solutions

#### Build Failures
```bash
# Clean and rebuild
rm -rf .next out
npm ci
npm run build
npm run export
```

#### AWS Permission Issues
```bash
# Check IAM permissions
aws iam get-user
aws iam list-attached-user-policies --user-name <USERNAME>
```

#### DNS Propagation
- DNS changes can take up to 48 hours to propagate globally
- Use `dig` or `nslookup` to check propagation status
- CloudFlare users may see faster propagation

## 🛡️ Security Considerations

### S3 Bucket Security
- Bucket is configured for public read access (required for static hosting)
- No sensitive data should be stored in the bucket
- Consider using Origin Access Identity for CloudFront if additional security is needed

### CloudFront Security
- HTTPS enforcement enabled
- No custom headers or cookies forwarded
- Compression enabled for performance

### IAM Permissions
Minimum required permissions for deployment:
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
                "iam:GetUser"
            ],
            "Resource": "*"
        }
    ]
}
```

## 📊 Performance Optimization

### CloudFront Settings
- **Price Class**: PriceClass_100 (US, Canada, Europe)
- **Compression**: Enabled
- **Cache Behavior**: Optimized for static content
- **TTL**: 1 year for assets, no-cache for HTML/JSON

### S3 Optimization
- **Storage Class**: Standard (default)
- **Lifecycle**: Consider moving old versions to IA after 30 days
- **Versioning**: Disabled by default

## 🔄 Rollback Process

### Quick Rollback
```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

### Manual Rollback
```bash
# Deploy specific version
git checkout <COMMIT_HASH>
npm run deploy
```

## 📈 Scaling Considerations

### Current Limits
- **S3**: 100 buckets per account (soft limit)
- **CloudFront**: 200 distributions per account
- **Route53**: 500 hosted zones per account

### Future Enhancements
- Multi-region deployment
- Blue-green deployment strategy
- Automated testing in CI/CD
- Performance monitoring and alerting

## 🆘 Support and Troubleshooting

### Logs and Monitoring
- **GitHub Actions**: View workflow runs in Actions tab
- **CloudFront**: Access logs in S3 (if enabled)
- **Route53**: Health checks and monitoring

### Common Commands
```bash
# View deployment logs
aws logs describe-log-groups

# Check S3 bucket policy
aws s3api get-bucket-policy --bucket study.pbradygeorgen.com

# List CloudFront distributions
aws cloudfront list-distributions

# Check Route53 hosted zones
aws route53 list-hosted-zones
```

### Getting Help
1. Check GitHub Actions logs for CI/CD issues
2. Verify AWS credentials and permissions
3. Check DNS propagation status
4. Review CloudFront distribution configuration
5. Ensure S3 bucket is properly configured

## 📝 Changelog

### v1.0.0 - Initial Deployment Setup
- Complete AWS S3 + CloudFront + Route53 deployment
- GitHub Actions CI/CD pipeline
- Git hooks for quality assurance
- Comprehensive setup and deployment scripts
- Static export configuration for Next.js

---

**Last Updated**: $(date)
**Maintainer**: n8n Crew - Git and AWS Development Team
**Repository**: [Card Game Study Guide](https://github.com/familiarcat/card-game-interview-study-guide)
