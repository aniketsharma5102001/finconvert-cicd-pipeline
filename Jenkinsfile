pipeline {
    agent any
    
    // This tells Jenkins to pull the Node.js tool we just configured
    tools {
        nodejs 'node20' 
    }

    stages {
        stage('Checkout Code') {
            steps {
                // Pulls the latest code from your GitHub repo
                checkout scm 
            }
        }

        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    echo "Installing frontend dependencies..."
                    // Note: We use 'sh' instead of 'npm' because Jenkins is running in Linux
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
    }
}