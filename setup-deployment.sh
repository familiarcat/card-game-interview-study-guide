#!/bin/bash

# Setup script for Card Game Study Guide deployment
# Configures the environment for AWS deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="card-game-study-guide"
DOMAIN="pbradygeorgen.com"
SUBDOMAIN="study"
FULL_DOMAIN="${SUBDOMAIN}.${DOMAIN}"

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

echo "🚀 Setting up deployment environment for $PROJECT_NAME"
echo "🌐 Target domain: $FULL_DOMAIN"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    log_error "Please don't run this script as root"
    exit 1
fi

# Check if we're in the project directory
if [ ! -f "package.json" ]; then
    log_error "Please run this script from the project root directory"
    exit 1
fi

# Check if .zshrc exists
if [ ! -f "$HOME/.zshrc" ]; then
    log_warning ".zshrc not found. Creating one..."
    touch "$HOME/.zshrc"
fi

# Check if SSH directory exists
if [ ! -d "$HOME/.ssh" ]; then
    log_warning "SSH directory not found. Creating one..."
    mkdir -p "$HOME/.ssh"
    chmod 700 "$HOME/.ssh"
fi

# Function to add environment variable to .zshrc
add_to_zshrc() {
    local var_name="$1"
    local var_value="$2"
    
    if ! grep -q "^export $var_name=" "$HOME/.zshrc"; then
        echo "export $var_name=$var_value" >> "$HOME/.zshrc"
        log_success "Added $var_name to .zshrc"
    else
        log_info "$var_name already exists in .zshrc"
    fi
}

# Function to add alias to .zshrc
add_alias_to_zshrc() {
    local alias_name="$1"
    local alias_value="$2"
    
    if ! grep -q "^alias $alias_name=" "$HOME/.zshrc"; then
        echo "alias $alias_name='$alias_value'" >> "$HOME/.zshrc"
        log_success "Added alias $alias_name to .zshrc"
    else
        log_info "Alias $alias_name already exists in .zshrc"
    fi
}

# Add project-specific environment variables
log_info "Adding environment variables to .zshrc..."
add_to_zshrc "PROJECT_NAME" "\"$PROJECT_NAME\""
add_to_zshrc "DEPLOYMENT_DOMAIN" "\"$FULL_DOMAIN\""
add_to_zshrc "AWS_REGION" "us-east-1"

# Add useful aliases
log_info "Adding deployment aliases to .zshrc..."
add_alias_to_zshrc "deploy" "npm run deploy"
add_alias_to_zshrc "build-deploy" "npm run build && npm run deploy"
add_alias_to_zshrc "check-aws" "aws sts get-caller-identity"
add_alias_to_zshrc "check-s3" "aws s3 ls s3://$S3_BUCKET"
add_alias_to_zshrc "check-cloudfront" "aws cloudfront list-distributions --query \"DistributionList.Items[?Aliases.Items[?contains(@, '$FULL_DOMAIN')]]\""

# Check AWS CLI installation
log_info "Checking AWS CLI installation..."
if command -v aws &> /dev/null; then
    log_success "AWS CLI is installed"
    aws --version
else
    log_error "AWS CLI is not installed"
    log_info "Please install AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check AWS credentials
log_info "Checking AWS credentials..."
if aws sts get-caller-identity &> /dev/null; then
    log_success "AWS credentials are configured"
    aws sts get-caller-identity
else
    log_warning "AWS credentials are not configured"
    log_info "Please run 'aws configure' to set up your credentials"
fi

# Check if deploy script is executable
log_info "Making deploy script executable..."
chmod +x deploy.sh
log_success "Deploy script is now executable"

# Check if Git hooks are executable
log_info "Making Git hooks executable..."
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/pre-push
log_success "Git hooks are now executable"

# Check Node.js and npm
log_info "Checking Node.js and npm..."
if command -v node &> /dev/null && command -v npm &> /dev/null; then
    log_success "Node.js and npm are installed"
    echo "Node.js version: $(node --version)"
    echo "npm version: $(npm --version)"
else
    log_error "Node.js or npm is not installed"
    exit 1
fi

# Install project dependencies
log_info "Installing project dependencies..."
npm ci
log_success "Dependencies installed"

# Test build
log_info "Testing build process..."
if npm run build; then
    log_success "Build test successful"
else
    log_error "Build test failed"
    exit 1
fi

# Test export
log_info "Testing static export..."
if npm run export; then
    log_success "Export test successful"
else
    log_error "Export test failed"
    exit 1
fi

# Create deployment configuration file
log_info "Creating deployment configuration..."
cat > deployment-config.env << EOF
# Deployment Configuration for $PROJECT_NAME
PROJECT_NAME=$PROJECT_NAME
DOMAIN=$DOMAIN
SUBDOMAIN=$SUBDOMAIN
FULL_DOMAIN=$FULL_DOMAIN
S3_BUCKET=$FULL_DOMAIN
AWS_REGION=us-east-1

# GitHub Secrets Required:
# AWS_ACCESS_KEY_ID
# AWS_SECRET_ACCESS_KEY

# Manual Deployment Commands:
# npm run deploy          # Deploy to AWS
# npm run build-deploy   # Build and deploy
# ./deploy.sh            # Run deployment script directly
EOF

log_success "Deployment configuration created: deployment-config.env"

# Summary
echo ""
log_success "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Configure AWS credentials: aws configure"
echo "2. Set up GitHub repository secrets for CI/CD:"
echo "   - AWS_ACCESS_KEY_ID"
echo "   - AWS_SECRET_ACCESS_KEY"
echo "3. Push to main branch to trigger automatic deployment"
echo "4. Or run manual deployment: npm run deploy"
echo ""
echo "🌐 Your application will be deployed to: https://$FULL_DOMAIN"
echo ""
echo "📚 Useful commands:"
echo "  - deploy          # Deploy to AWS"
echo "  - build-deploy    # Build and deploy"
echo "  - check-aws       # Check AWS credentials"
echo "  - check-s3        # List S3 bucket contents"
echo "  - check-cloudfront # Check CloudFront distribution"
echo ""
echo "⚠️ Don't forget to source your .zshrc or restart your terminal!"
echo "   source ~/.zshrc"
