#!/usr/bin/env bash
set -o errexit

echo "Starting AWS EC2 Setup for DeepShield..."

# 1. Configure 4GB Swap Space (Crucial for 1GB RAM t2.micro Free Tier)
# This prevents PyTorch from triggering an Out-Of-Memory Kernel Panic
if [ ! -f /swapfile ]; then
    echo "Creating 4GB Swap File..."
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "Swap space configured successfully."
else
    echo "Swap file already exists."
fi

# 2. Install Docker & Docker Compose
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    sudo apt-get update
    sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo usermod -aG docker ubuntu
    echo "Docker installed."
fi

# 3. Pull Repository & Build
echo "Building Docker container..."
sudo docker compose down || true
sudo docker compose build --no-cache
sudo docker compose up -d

echo "DeepShield is now running on Port 80!"
echo "You can view it at http://$(curl -s http://checkip.amazonaws.com)"
