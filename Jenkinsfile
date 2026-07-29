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
                    sh 'docker build -t finconvert-frontend:latest .'
                }
            }
        }

        stage('Containerize Backend') {
            steps {
                dir('backend') {
                    echo "Packaging Backend into Docker Container..."
                    sh 'docker build -t finconvert-backend:latest .'
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                echo "Deploying applications to Kubernetes cluster..."
                sh "kubectl apply -f K8s/backend.yaml"
                sh "kubectl apply -f K8s/frontend.yaml"
            }
        }

    }
}