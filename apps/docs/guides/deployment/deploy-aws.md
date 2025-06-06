# How to deploy to AWS

> ⚠️ **Future Feature**: This guide describes the planned AWS deployment architecture for production environments. The deployment automation and Infrastructure as Code templates are in development.

This guide walks you through deploying the Panels application to Amazon Web Services using best practices for production environments.

## Prerequisites

- AWS account with appropriate permissions
- AWS CLI installed and configured
- Docker installed locally
- Terraform installed (optional, for Infrastructure as Code)
- Domain name for your application (recommended)

## Step 1: Set Up AWS Resources

### Option A: Manual Setup (Quick Start)

#### Create VPC and Subnets
```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=panels-vpc}]'

# Create public subnets (for load balancer)
aws ec2 create-subnet --vpc-id vpc-xxxxxx --cidr-block 10.0.1.0/24 --availability-zone us-west-2a
aws ec2 create-subnet --vpc-id vpc-xxxxxx --cidr-block 10.0.2.0/24 --availability-zone us-west-2b

# Create private subnets (for application)
aws ec2 create-subnet --vpc-id vpc-xxxxxx --cidr-block 10.0.3.0/24 --availability-zone us-west-2a
aws ec2 create-subnet --vpc-id vpc-xxxxxx --cidr-block 10.0.4.0/24 --availability-zone us-west-2b
```

#### Create Security Groups
```bash
# Security group for load balancer
aws ec2 create-security-group \
  --group-name panels-alb-sg \
  --description "Security group for Panels ALB" \
  --vpc-id vpc-xxxxxx

# Allow HTTP and HTTPS traffic
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxx \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxx \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0
```

### Option B: Infrastructure as Code (Recommended)

Create a Terraform configuration:

```hcl
# infrastructure/main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC Configuration
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  
  name = "panels-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = ["${var.aws_region}a", "${var.aws_region}b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
  
  enable_nat_gateway = true
  enable_vpn_gateway = false
  
  tags = {
    Environment = var.environment
    Project     = "panels"
  }
}

# RDS Database
resource "aws_db_instance" "postgres" {
  identifier = "panels-${var.environment}"
  
  engine         = "postgres"
  engine_version = "16.1"
  instance_class = "db.t3.micro"
  
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_encrypted     = true
  
  db_name  = "panels"
  username = var.db_username
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.database.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = var.environment != "production"
  
  tags = {
    Environment = var.environment
    Project     = "panels"
  }
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "main" {
  name       = "panels-cache-subnet"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id       = "panels-${var.environment}"
  description                = "Redis cluster for Panels"
  
  node_type            = "cache.t3.micro"
  port                 = 6379
  parameter_group_name = "default.redis7"
  
  num_cache_clusters = 2
  
  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.cache.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  tags = {
    Environment = var.environment
    Project     = "panels"
  }
}
```

Apply the infrastructure:
```bash
cd infrastructure
terraform init
terraform plan -var-file="environments/${ENVIRONMENT}.tfvars"
terraform apply -var-file="environments/${ENVIRONMENT}.tfvars"
```

## Step 2: Build and Push Docker Images

### Build Application Images
```bash
# Build API image
docker build -t panels-api:latest -f apps/services/Dockerfile .

# Build frontend image  
docker build -t panels-app:latest -f apps/app/Dockerfile .

# Tag images for ECR
docker tag panels-api:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/panels-api:latest
docker tag panels-app:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/panels-app:latest
```

### Create ECR Repositories
```bash
# Create ECR repositories
aws ecr create-repository --repository-name panels-api
aws ecr create-repository --repository-name panels-app

# Get login token and authenticate Docker
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
```

### Push Images to ECR
```bash
# Push images
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/panels-api:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/panels-app:latest
```

## Step 3: Set Up ECS Cluster

### Create ECS Cluster
```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name panels-cluster --capacity-providers FARGATE
```

### Create Task Definitions
```json
// ecs/api-task-definition.json
{
  "family": "panels-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "panels-api",
      "image": "ACCOUNT.dkr.ecr.REGION.amazonaws.com/panels-api:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "DATABASE_HOST",
          "value": "panels-production.xxxxxx.us-west-2.rds.amazonaws.com"
        },
        {
          "name": "REDIS_HOST", 
          "value": "panels-production.xxxxxx.cache.amazonaws.com"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:us-west-2:ACCOUNT:secret:panels/database:password::"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-west-2:ACCOUNT:secret:panels/jwt:secret::"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/panels-api",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3001/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

### Register Task Definitions
```bash
# Register task definitions
aws ecs register-task-definition --cli-input-json file://ecs/api-task-definition.json
aws ecs register-task-definition --cli-input-json file://ecs/app-task-definition.json
```

## Step 4: Set Up Application Load Balancer

### Create Application Load Balancer
```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name panels-alb \
  --subnets subnet-xxxxxx subnet-yyyyyy \
  --security-groups sg-xxxxxx \
  --scheme internet-facing \
  --type application
```

### Create Target Groups
```bash
# API target group
aws elbv2 create-target-group \
  --name panels-api-tg \
  --protocol HTTP \
  --port 3001 \
  --vpc-id vpc-xxxxxx \
  --target-type ip \
  --health-check-path /health \
  --health-check-interval-seconds 30

# Frontend target group
aws elbv2 create-target-group \
  --name panels-app-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxxxxx \
  --target-type ip \
  --health-check-path /health
```

### Configure Listeners
```bash
# HTTPS listener (requires SSL certificate)
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:us-west-2:ACCOUNT:loadbalancer/app/panels-alb/xxxxxx \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:us-west-2:ACCOUNT:certificate/xxxxxx \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-west-2:ACCOUNT:targetgroup/panels-app-tg/xxxxxx

# API listener rule
aws elbv2 create-rule \
  --listener-arn arn:aws:elasticloadbalancing:us-west-2:ACCOUNT:listener/app/panels-alb/xxxxxx/xxxxxx \
  --conditions Field=path-pattern,Values='/api/*' \
  --priority 100 \
  --actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-west-2:ACCOUNT:targetgroup/panels-api-tg/xxxxxx
```

## Step 5: Create ECS Services

### API Service
```bash
aws ecs create-service \
  --cluster panels-cluster \
  --service-name panels-api \
  --task-definition panels-api:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxxx,subnet-yyyyyy],securityGroups=[sg-xxxxxx],assignPublicIp=DISABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:us-west-2:ACCOUNT:targetgroup/panels-api-tg/xxxxxx,containerName=panels-api,containerPort=3001
```

### Frontend Service
```bash
aws ecs create-service \
  --cluster panels-cluster \
  --service-name panels-app \
  --task-definition panels-app:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxxx,subnet-yyyyyy],securityGroups=[sg-xxxxxx],assignPublicIp=DISABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:us-west-2:ACCOUNT:targetgroup/panels-app-tg/xxxxxx,containerName=panels-app,containerPort=3000
```

## Step 6: Configure Secrets Management

### Store Secrets in AWS Secrets Manager
```bash
# Database password
aws secretsmanager create-secret \
  --name "panels/database" \
  --description "Database credentials for Panels" \
  --secret-string '{"username":"panels","password":"your-secure-password"}'

# JWT secret
aws secretsmanager create-secret \
  --name "panels/jwt" \
  --description "JWT secret for Panels" \
  --secret-string '{"secret":"your-jwt-secret"}'

# API keys
aws secretsmanager create-secret \
  --name "panels/api-keys" \
  --description "External API keys for Panels" \
  --secret-string '{"medplum_client_secret":"your-medplum-secret"}'
```

## Step 7: Set Up Monitoring and Logging

### CloudWatch Log Groups
```bash
# Create log groups
aws logs create-log-group --log-group-name /ecs/panels-api
aws logs create-log-group --log-group-name /ecs/panels-app
aws logs create-log-group --log-group-name /aws/ecs/panels-cluster
```

### CloudWatch Alarms
```bash
# High CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "panels-api-high-cpu" \
  --alarm-description "Alarm when API CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=ServiceName,Value=panels-api Name=ClusterName,Value=panels-cluster \
  --evaluation-periods 2

# Database connection alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "panels-db-connections" \
  --alarm-description "Alarm when DB connections are high" \
  --metric-name DatabaseConnections \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=DBInstanceIdentifier,Value=panels-production \
  --evaluation-periods 2
```

## Step 8: Configure Auto Scaling

### ECS Service Auto Scaling
```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/panels-cluster/panels-api \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/panels-cluster/panels-api \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name panels-api-scaling-policy \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    },
    "ScaleOutCooldown": 300,
    "ScaleInCooldown": 300
  }'
```

## Step 9: Set Up SSL/TLS

### Request SSL Certificate
```bash
# Request certificate from ACM
aws acm request-certificate \
  --domain-name panels.yourdomain.com \
  --domain-name *.panels.yourdomain.com \
  --validation-method DNS \
  --subject-alternative-names api.panels.yourdomain.com
```

### Configure Route 53 (if using)
```bash
# Create hosted zone
aws route53 create-hosted-zone \
  --name panels.yourdomain.com \
  --caller-reference $(date +%s)

# Create A record pointing to ALB
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890 \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "panels.yourdomain.com",
        "Type": "A",
        "AliasTarget": {
          "DNSName": "panels-alb-xxxxxxxxx.us-west-2.elb.amazonaws.com",
          "EvaluateTargetHealth": false,
          "HostedZoneId": "Z1H1FL5HABSF5"
        }
      }
    }]
  }'
```

## Step 10: Deploy and Verify

### Run Database Migrations
```bash
# Connect to ECS task to run migrations
aws ecs run-task \
  --cluster panels-cluster \
  --task-definition panels-api:1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxxx],securityGroups=[sg-xxxxxx],assignPublicIp=ENABLED}" \
  --overrides '{
    "containerOverrides": [{
      "name": "panels-api",
      "command": ["npm", "run", "migration:run"]
    }]
  }'
```

### Verify Deployment
```bash
# Check service status
aws ecs describe-services --cluster panels-cluster --services panels-api panels-app

# Check target group health
aws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:us-west-2:ACCOUNT:targetgroup/panels-api-tg/xxxxxx

# Test endpoints
curl https://panels.yourdomain.com/health
curl https://panels.yourdomain.com/api/health
```

## Best Practices

### Security
- **Use IAM roles** with least privilege access
- **Enable VPC Flow Logs** for network monitoring
- **Use AWS Secrets Manager** for sensitive data
- **Enable encryption** at rest and in transit
- **Regularly rotate** secrets and certificates

### Performance
- **Use CloudFront** for static asset caching
- **Enable ALB access logs** for monitoring
- **Set up RDS read replicas** for read-heavy workloads
- **Use ElastiCache** for application caching
- **Monitor and optimize** database queries

### Cost Optimization
- **Use Spot instances** for non-critical workloads
- **Set up billing alerts** for cost monitoring
- **Right-size instances** based on usage patterns
- **Use Reserved Instances** for predictable workloads
- **Enable AWS Cost Explorer** for cost analysis

## Troubleshooting

### Common Issues

**Q: ECS tasks fail to start**
- Check CloudWatch logs for error messages
- Verify IAM permissions for task execution role
- Ensure ECR images are accessible
- Validate environment variables and secrets

**Q: Load balancer health checks fail**
- Verify security group rules allow ALB to reach targets
- Check application health check endpoint
- Ensure correct target group configuration
- Review ECS service network configuration

**Q: Database connection issues**
- Verify security group allows connections from ECS
- Check database subnet group configuration
- Validate connection string and credentials
- Ensure database is in available state

**Q: High costs**
- Review CloudWatch billing dashboard
- Check for over-provisioned resources
- Consider using Spot instances
- Optimize data transfer costs

## Next Steps

- **[How to set up monitoring](./setup-monitoring.md)** - Configure comprehensive monitoring
- **[How to backup data](./backup-data.md)** - Set up automated backups
- **[How to scale the system](./scale-system.md)** - Scale for high availability
- **[Terraform modules](../../reference/infrastructure/terraform-aws.md)** - Use Infrastructure as Code

## Related Topics

- **[AWS deployment architecture](../../explanation/decisions/cloud-architecture.md)** - Understand the design decisions
- **[Security best practices](../../guides/troubleshooting/security.md)** - Secure your deployment
- **[Monitoring setup](../../guides/deployment/setup-monitoring.md)** - Monitor your application 