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

        stage('Trivy Filesystem Scan') {
            steps {
                echo "Scanning for High & Critical Vulnerabilities and Hardcoded Secrets..."
                // Trivy is already installed on our AWS server!
                sh 'trivy fs --scanners vuln,secret --severity HIGH,CRITICAL --exit-code 1 .'
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
        
    
    }
}