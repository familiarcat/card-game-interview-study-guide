#!/bin/bash

# SSH-based AWS and Git Configuration Script
# Uses SSH keys for secure authentication

set -e

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

# Check SSH directory and keys
check_ssh_setup() {
    log_info "Checking SSH configuration..."
    
    # Ensure SSH directory exists
    if [ ! -d "$HOME/.ssh" ]; then
        log_info "Creating ~/.ssh directory..."
        mkdir -p "$HOME/.ssh"
        chmod 700 "$HOME/.ssh"
    fi
    
    # Check for existing SSH keys
    SSH_KEYS=$(ls "$HOME/.ssh/"*.pub 2>/dev/null | head -5 || echo "")
    
    if [ -z "$SSH_KEYS" ]; then
        log_warning "No SSH public keys found"
        generate_ssh_key
    else
        log_success "Found SSH keys:"
        echo "$SSH_KEYS" | sed 's/^/  - /'
    fi
}

# Generate SSH key if needed
generate_ssh_key() {
    log_info "Generating new SSH key for AWS/Git access..."
    
    read -p "Enter your email for SSH key: " SSH_EMAIL
    
    # Generate ED25519 key (more secure than RSA)
    ssh-keygen -t ed25519 -C "$SSH_EMAIL" -f "$HOME/.ssh/aws_deployment_key" -N ""
    
    log_success "SSH key generated: $HOME/.ssh/aws_deployment_key"
    log_info "Public key:"
    cat "$HOME/.ssh/aws_deployment_key.pub"
}

# Configure SSH for Git (GitHub/GitLab)
configure_git_ssh() {
    log_info "Configuring SSH for Git operations..."
    
    # Create SSH config if it doesn't exist
    SSH_CONFIG="$HOME/.ssh/config"
    
    if [ ! -f "$SSH_CONFIG" ]; then
        touch "$SSH_CONFIG"
        chmod 600 "$SSH_CONFIG"
    fi
    
    # Add GitHub configuration
    if ! grep -q "Host github.com" "$SSH_CONFIG"; then
        cat >> "$SSH_CONFIG" << EOF

# GitHub SSH Configuration
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/aws_deployment_key
    AddKeysToAgent yes
    UseKeychain yes

EOF
        log_success "Added GitHub SSH configuration"
    fi
    
    # Test SSH connection to GitHub
    log_info "Testing SSH connection to GitHub..."
    ssh -T git@github.com -o ConnectTimeout=10 || log_warning "GitHub SSH test failed (this is normal if key not added to GitHub)"
}

# Configure AWS CLI with IAM roles and SSH agent forwarding
configure_aws_ssh() {
    log_info "Configuring AWS CLI for secure access..."
    
    # Check if AWS CLI is configured
    if ! aws sts get-caller-identity &>/dev/null; then
        log_warning "AWS CLI not configured. Setting up..."
        
        # Option 1: Use IAM roles with instance profiles (recommended for EC2)
        # Option 2: Use temporary credentials with STS
        # Option 3: Use AWS SSO
        
        log_info "Choose AWS authentication method:"
        echo "1. AWS Access Keys (traditional)"
        echo "2. AWS SSO (recommended for organizations)"
        echo "3. IAM Roles (for EC2/containers)"
        
        read -p "Enter choice (1-3): " AWS_AUTH_METHOD
        
        case $AWS_AUTH_METHOD in
            1)
                configure_aws_access_keys
                ;;
            2)
                configure_aws_sso
                ;;
            3)
                configure_aws_iam_roles
                ;;
            *)
                log_error "Invalid choice"
                exit 1
                ;;
        esac
    else
        log_success "AWS CLI already configured"
        aws sts get-caller-identity
    fi
}

# Configure AWS with access keys
configure_aws_access_keys() {
    log_warning "Using AWS Access Keys (store securely in ~/.zshrc)"
    
    read -p "Enter AWS Access Key ID: " AWS_ACCESS_KEY_ID
    read -s -p "Enter AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
    echo
    
    # Store in ~/.zshrc for security
    {
        echo ""
        echo "# AWS Credentials (added by deployment script)"
        echo "export AWS_ACCESS_KEY_ID=\"$AWS_ACCESS_KEY_ID\""
        echo "export AWS_SECRET_ACCESS_KEY=\"$AWS_SECRET_ACCESS_KEY\""
        echo "export AWS_REGION=\"us-east-1\""
    } >> "$HOME/.zshrc"
    
    log_success "AWS credentials added to ~/.zshrc"
    log_warning "Source your shell: source ~/.zshrc"
}

# Configure AWS SSO
configure_aws_sso() {
    log_info "Configuring AWS SSO..."
    
    read -p "Enter your AWS SSO start URL: " SSO_START_URL
    read -p "Enter your AWS SSO region: " SSO_REGION
    
    aws configure sso \
        --profile deployment \
        --sso-start-url "$SSO_START_URL" \
        --sso-region "$SSO_REGION"
    
    # Set as default profile
    echo "export AWS_PROFILE=deployment" >> "$HOME/.zshrc"
    
    log_success "AWS SSO configured"
}

# Configure IAM roles
configure_aws_iam_roles() {
    log_info "IAM Roles configuration for EC2/containers..."
    log_info "Ensure your EC2 instance/container has the following IAM permissions:"
    
    cat << EOF
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
EOF
    
    log_info "No additional configuration needed for IAM roles"
}

# Set up SSH agent forwarding
setup_ssh_agent() {
    log_info "Setting up SSH agent for key management..."
    
    # Add to shell profile
    {
        echo ""
        echo "# SSH Agent configuration (added by deployment script)"
        echo "if [ -z \"\$SSH_AUTH_SOCK\" ]; then"
        echo "    eval \"\$(ssh-agent -s)\""
        echo "    ssh-add ~/.ssh/aws_deployment_key"
        echo "fi"
    } >> "$HOME/.zshrc"
    
    # Start SSH agent for current session
    eval "$(ssh-agent -s)"
    ssh-add "$HOME/.ssh/aws_deployment_key" 2>/dev/null || log_warning "SSH key not found"
    
    log_success "SSH agent configured"
}

# Create deployment aliases using SSH
create_ssh_deployment_aliases() {
    log_info "Creating SSH-aware deployment aliases..."
    
    {
        echo ""
        echo "# SSH-aware deployment aliases"
        echo "alias deploy-ssh='ssh-add ~/.ssh/aws_deployment_key && ./deploy-ssl-automated.sh'"
        echo "alias git-deploy='ssh-add ~/.ssh/aws_deployment_key && git push origin main'"
        echo "alias aws-identity='aws sts get-caller-identity'"
        echo "alias check-ssh='ssh-add -l'"
    } >> "$HOME/.zshrc"
    
    log_success "SSH deployment aliases created"
}

# Main function
main() {
    log_info "🔐 Configuring SSH-based AWS and Git authentication..."
    
    # 1. Check SSH setup
    check_ssh_setup
    
    # 2. Configure Git SSH
    configure_git_ssh
    
    # 3. Configure AWS
    configure_aws_ssh
    
    # 4. Set up SSH agent
    setup_ssh_agent
    
    # 5. Create deployment aliases
    create_ssh_deployment_aliases
    
    log_success "🎉 SSH configuration completed!"
    
    echo ""
    log_info "📋 Next steps:"
    echo "1. Add your SSH public key to GitHub:"
    echo "   - Go to GitHub Settings > SSH and GPG keys"
    echo "   - Add key: $(cat "$HOME/.ssh/aws_deployment_key.pub" 2>/dev/null | head -c 50)..."
    echo ""
    echo "2. Source your shell configuration:"
    echo "   source ~/.zshrc"
    echo ""
    echo "3. Test deployment with SSH:"
    echo "   deploy-ssh"
    echo ""
    
    log_warning "🔒 Keep your SSH private keys secure and never share them!"
}

# Run main function
main "$@"
