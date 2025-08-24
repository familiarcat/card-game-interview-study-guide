# 🚀 N8N Crew - Quick Reference Card

## 🎯 Project Overview
**Card Game Study Guide** - Interview preparation application deployed to `study.pbradygeorgen.com`

## 🏗️ Infrastructure Summary
- **Frontend**: Next.js 15.5.0 with static export
- **Hosting**: AWS S3 + CloudFront CDN
- **DNS**: Route53 for subdomain management
- **CI/CD**: GitHub Actions with automated deployment
- **Domain**: `study.pbradygeorgen.com`

## ⚡ Quick Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build application
npm run export       # Export static files
npm run lint         # Run ESLint
```

### Deployment
```bash
npm run deploy       # Build and deploy to AWS
./deploy.sh          # Run deployment script directly
./setup-deployment.sh # Initial environment setup
```

### AWS Management
```bash
check-aws            # Verify AWS credentials
check-s3             # List S3 bucket contents
check-cloudfront     # Check CloudFront distribution
```

## 🔑 Key Files for N8N Integration

### Deployment Scripts
- `deploy.sh` - Main deployment logic
- `setup-deployment.sh` - Environment configuration
- `.github/workflows/deploy.yml` - CI/CD pipeline

### Configuration Files
- `next.config.ts` - Next.js static export config
- `package.json` - Build scripts and dependencies
- `deployment-config.env` - Environment variables

### Git Hooks
- `.git/hooks/pre-commit` - Quality checks before commit
- `.git/hooks/pre-push` - Deployment readiness check

## 🌐 AWS Resources Created

### S3 Bucket
- **Name**: `study.pbradygeorgen.com`
- **Purpose**: Static file hosting
- **Access**: Public read for web hosting

### CloudFront Distribution
- **Origin**: S3 bucket
- **Alias**: `study.pbradygeorgen.com`
- **HTTPS**: Enforced
- **Compression**: Enabled

### Route53 Records
- **Type**: A Record (Alias)
- **Target**: CloudFront distribution
- **TTL**: Automatic

## 🔄 CI/CD Pipeline

### Trigger
- Push to `main` branch
- Manual workflow dispatch

### Process
1. Checkout code
2. Install dependencies
3. Lint and build
4. Export static files
5. Deploy to S3
6. Update CloudFront
7. Configure DNS
8. Invalidate cache

### GitHub Secrets Required
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

## 🚨 Common Issues & Solutions

### Build Failures
```bash
rm -rf .next out
npm ci
npm run build
```

### AWS Permission Issues
- Verify IAM user has S3, CloudFront, Route53 permissions
- Check AWS credentials: `aws sts get-caller-identity`

### DNS Issues
- DNS changes take up to 48 hours to propagate
- Verify Route53 hosted zone exists for `pbradygeorgen.com`

## 📊 Monitoring & Health Checks

### Deployment Status
- GitHub Actions tab for CI/CD logs
- AWS Console for resource status
- CloudFront distribution monitoring

### Performance Metrics
- CloudFront cache hit rates
- S3 bucket access logs
- Route53 health checks

## 🔧 N8N Workflow Integration Points

### Webhook Triggers
- GitHub push events
- AWS CloudWatch events
- Manual deployment triggers

### API Endpoints
- AWS CLI commands for resource management
- GitHub API for repository operations
- CloudFront invalidation API

### Data Sources
- AWS resource status
- GitHub commit history
- Deployment logs and metrics

## 📝 Decision Making Context

### When to Deploy
- Feature completion
- Bug fixes
- Performance improvements
- Security updates

### Rollback Strategy
- Git revert and push
- Manual deployment to previous version
- CloudFront cache invalidation

### Scaling Considerations
- Current: Single region (us-east-1)
- Future: Multi-region, blue-green deployment
- Monitoring: Performance metrics and alerting

---

**For N8N Crew**: This infrastructure is designed for automated deployment with minimal manual intervention. The GitHub Actions pipeline handles most deployment tasks, while the scripts provide manual override capabilities when needed.
