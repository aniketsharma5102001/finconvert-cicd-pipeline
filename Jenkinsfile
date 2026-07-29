pipeline {
    agent any
    
    tools {
        nodejs 'node20' 
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm 
            }
        }

        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    echo "Installing frontend dependencies..."
                    sh 'npm install'
                    
                    echo "Building the React application..."
                    sh 'npm run build'
                }
            }
        }

        stage('Backend Setup') {
            steps {
                dir('backend') {
                    echo "Installing backend dependencies..."
                    sh 'npm install'
                }
            }
        }

        stage('Containerize Frontend') {
            steps {
                dir('frontend') {
                    echo "Packaging Frontend into Docker Container..."
                    sh 'DOCKER_BUILDKIT=0 docker build -t finconvert-frontend:latest .'
                }
            }
        }

        stage('Containerize Backend') {
            steps {
                dir('backend') {
                    echo "Packaging Backend into Docker Container..."
                    sh 'DOCKER_BUILDKIT=0 docker build -t finconvert-backend:latest .'
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                echo "Downloading kubectl tool..."
                sh 'curl -sLO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"'
                sh 'chmod +x ./kubectl'

                // Point Jenkins to the Docker Desktop Kubernetes API instead of its own localhost
                sh '''
                if [ -f ~/.kube/config ]; then
                    sed -i 's/127.0.0.1/kubernetes.docker.internal/g' ~/.kube/config
                fi
                '''
                
                echo "Deploying applications to Kubernetes cluster..."
                // We use our downloaded ./kubectl and skip local TLS verification for the Docker-internal routing
                sh './kubectl --insecure-skip-tls-verify apply -f K8s/backend.yaml'
                sh './kubectl --insecure-skip-tls-verify apply -f K8s/frontend.yaml'
            }
        }

    }
}