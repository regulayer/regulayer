# VPC Module

variable "environment" {
  type = string
}

variable "vpc_cidr" {
  type = string
}

locals {
  azs = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "regulayer-${var.environment}"
  }
}

# Public Subnets (Gateway, Web)
resource "aws_subnet" "public" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 4, count.index)
  availability_zone = local.azs[count.index]
  
  map_public_ip_on_launch = true
  
  tags = {
    Name = "regulayer-${var.environment}-public-${count.index}"
    Tier = "public"
  }
}

# Private Subnets (Recorder, Queue, Control Plane)
resource "aws_subnet" "private" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 4, count.index + 3)
  availability_zone = local.azs[count.index]
  
  tags = {
    Name = "regulayer-${var.environment}-private-${count.index}"
    Tier = "private"
  }
}

# Isolated Subnets (Attestation, HSM)
resource "aws_subnet" "isolated" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 4, count.index + 6)
  availability_zone = local.azs[count.index]
  
  tags = {
    Name = "regulayer-${var.environment}-isolated-${count.index}"
    Tier = "isolated"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name = "regulayer-${var.environment}-igw"
  }
}

# NAT Gateway
resource "aws_eip" "nat" {
  domain = "vpc"
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id
  
  tags = {
    Name = "regulayer-${var.environment}-nat"
  }
}

# Outputs
output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  value = aws_subnet.private[*].id
}

output "isolated_subnet_ids" {
  value = aws_subnet.isolated[*].id
}
