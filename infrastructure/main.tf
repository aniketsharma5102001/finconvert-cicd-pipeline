terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-south-1"
}

# 1. Fetch the latest Ubuntu 22.04 LTS Image dynamically
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

# 2. Create the Security Group (Firewall Rules)
resource "aws_security_group" "devops_sg" {
  name        = "devops-pipeline-sg"
  description = "Allow Jenkins, SonarQube, SSH, and K8s traffic"

  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] 
  }
  # Jenkins
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] 
  }
  # SonarQube
  ingress {
    from_port   = 9000
    to_port     = 9000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] 
  }
  # Minikube NodePort
  ingress {
    from_port   = 30080
    to_port     = 30080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] 
  }
  # Outbound Internet Access
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 3. Provision the m7i-flex.large Server
resource "aws_instance" "devops_server" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = "m7i-flex.large"
  vpc_security_group_ids      = [aws_security_group.devops_sg.id]
  associate_public_ip_address = true # nosonar

  # 30GB Disk Space to prevent out-of-disk crashes
  root_block_device {
    volume_size = 30
    volume_type = "gp3"
  }

  # 4. The  Bootstrap Script
  user_data = <<-EOF
              #!/bin/bash
              
              # --- NEW: Kill background apt updates to prevent lock errors ---
              systemctl stop apt-daily.timer apt-daily-upgrade.timer
              systemctl stop apt-daily.service apt-daily-upgrade.service
              while fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; do sleep 5; done
              # ---------------------------------------------------------------

              # A. Create 4GB Swap File
              fallocate -l 4G /swapfile
              chmod 600 /swapfile
              mkswap /swapfile
              swapon /swapfile
              echo '/swapfile none swap sw 0 0' >> /etc/fstab

              # B. Update OS and install prerequisites (JAVA 21)
              apt-get update -y
              apt-get install -y fontconfig openjdk-21-jre docker.io wget apt-transport-https gnupg curl

              # C. Install Jenkins (2026 KEY)
              mkdir -p /etc/apt/keyrings
              wget -O /etc/apt/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key
              echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | tee /etc/apt/sources.list.d/jenkins.list > /dev/null
              apt-get update -y
              apt-get install -y jenkins

              # D. Install Trivy
              wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | tee /usr/share/keyrings/trivy.gpg > /dev/null
              echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | tee -a /etc/apt/sources.list.d/trivy.list
              apt-get update -y
              apt-get install -y trivy

              # E. Install Minikube & Kubectl
              curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
              install minikube-linux-amd64 /usr/local/bin/minikube
              curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
              install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

              # F. Configure System memory for SonarQube (Elasticsearch requirement)
              sysctl -w vm.max_map_count=262144
              echo "vm.max_map_count=262144" >> /etc/sysctl.conf

              # G. Grant Docker permissions and restart services
              usermod -aG docker jenkins
              usermod -aG docker ubuntu
              systemctl restart docker
              systemctl restart jenkins

              # H. Start SonarQube Container Automatically
              docker run -d --name sonarqube --restart unless-stopped -p 9000:9000 sonarqube:lts-community

              # I. Start Minikube Cluster Automatically (Run as 'ubuntu' user)
              su - ubuntu -c "minikube start --driver=docker"
              EOF

  tags = {
    Name = "Finconvert-DevOps-Automated"
  }
}

# 5. Output the new server's Public IP
output "server_public_ip" {
  description = "The public IP address of your new server"
  value       = aws_instance.devops_server.public_ip
}