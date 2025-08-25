#!/bin/bash

# AWS Setup Script for Quick-Mailer Serverless Deployment
# This script helps set up the required AWS resources

set -e

echo "🚀 Setting up AWS resources for Quick-Mailer serverless deployment..."

# Configuration
BUCKET_NAME="${1:-quick-mailer-attachments-$(date +%s)}"
REGION="${2:-us-east-1}"
STACK_NAME="quick-mailer-resources"

echo "📋 Configuration:"
echo "  S3 Bucket: $BUCKET_NAME"
echo "  Region: $REGION"
echo "  CloudFormation Stack: $STACK_NAME"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials are not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI and credentials verified"

# Create S3 bucket
echo "🪣 Creating S3 bucket: $BUCKET_NAME"
aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"

# Configure CORS for S3 bucket
echo "🔧 Configuring CORS for S3 bucket"
cat > /tmp/cors.json << EOF
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": []
    }
  ]
}
EOF

aws s3api put-bucket-cors --bucket "$BUCKET_NAME" --cors-configuration file:///tmp/cors.json

# Create CloudFormation stack for additional resources
echo "☁️ Creating CloudFormation stack for additional resources"
cat > /tmp/cloudformation.yaml << EOF
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Quick-Mailer Serverless Resources'

Parameters:
  S3BucketName:
    Type: String
    Default: '$BUCKET_NAME'
    Description: 'S3 bucket name for file attachments'

Resources:
  # IAM Role for Lambda
  LambdaExecutionRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: QuickMailerLambdaRole
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
      Policies:
        - PolicyName: S3Access
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action:
                  - s3:GetObject
                  - s3:PutObject
                  - s3:DeleteObject
                  - s3:PutObjectAcl
                Resource: !Sub 'arn:aws:s3:::\${S3BucketName}/*'

  # S3 Bucket Policy
  S3BucketPolicy:
    Type: AWS::S3::BucketPolicy
    Properties:
      Bucket: !Ref S3BucketName
      PolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Sid: PublicReadGetObject
            Effect: Allow
            Principal: '*'
            Action: 's3:GetObject'
            Resource: !Sub 'arn:aws:s3:::\${S3BucketName}/*'

Outputs:
  S3BucketName:
    Description: 'S3 bucket for file attachments'
    Value: !Ref S3BucketName
    Export:
      Name: !Sub '\${AWS::StackName}-S3Bucket'
  
  LambdaExecutionRoleArn:
    Description: 'ARN of the Lambda execution role'
    Value: !GetAtt LambdaExecutionRole.Arn
    Export:
      Name: !Sub '\${AWS::StackName}-LambdaRole'

EOF

aws cloudformation create-stack \
  --stack-name "$STACK_NAME" \
  --template-body file:///tmp/cloudformation.yaml \
  --parameters ParameterKey=S3BucketName,ParameterValue="$BUCKET_NAME" \
  --region "$REGION"

echo "⏳ Waiting for CloudFormation stack to complete..."
aws cloudformation wait stack-create-complete --stack-name "$STACK_NAME" --region "$REGION"

# Get stack outputs
echo "📊 CloudFormation stack outputs:"
aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" \
  --query 'Stacks[0].Outputs' --output table

# Cleanup temporary files
rm -f /tmp/cors.json /tmp/cloudformation.yaml

echo ""
echo "✅ AWS setup completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Update your .env file with the S3 bucket name: $BUCKET_NAME"
echo "2. Update your frontend environment with the new API Gateway URL"
echo "3. Run 'npm run deploy' to deploy your Lambda function"
echo ""
echo "🔗 S3 Bucket: s3://$BUCKET_NAME"
echo "🌐 Region: $REGION"
