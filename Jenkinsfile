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

        stage('SonarQube Analysis') {
            environment {
                // This dynamically injects the scanner software path we configured
                SCANNER_HOME = tool 'sonar-scanner'
            }
            steps {
                // This grabs the encrypted token and server URL we configured
                withSonarQubeEnv('sonar-server') {
                    sh '''
                    $SCANNER_HOME/bin/sonar-scanner \
                    -Dsonar.projectKey=finconvert \
                    -Dsonar.projectName="Currency Converter" \
                    -Dsonar.sources=. \
                    -Dsonar.exclusions="**/node_modules/**,**/dist/**,**/.git/**"
                    -Dsonar.ws.timeout=300
                    '''
                }
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

                // Explicitly modify the file where we copied it
                sh '''
                if [ -f /var/jenkins_home/.kube/config ]; then
                    sed -i 's/127.0.0.1/kubernetes.docker.internal/g' /var/jenkins_home/.kube/config
                else
                    echo "ERROR: kubeconfig file not found in /var/jenkins_home/"
                    exit 1
                fi
                '''
                
                echo "Deploying applications to Kubernetes cluster..."
                // Explicitly pass the file location to kubectl
                sh './kubectl --kubeconfig=/var/jenkins_home/.kube/config --insecure-skip-tls-verify apply -f K8s/backend.yaml'
                sh './kubectl --kubeconfig=/var/jenkins_home/.kube/config --insecure-skip-tls-verify apply -f K8s/frontend.yaml'
            }
        }
        
    }
}