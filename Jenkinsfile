pipeline {
    agent any
    
    tools {
        nodejs 'node20' 
    }

    // 1. Define the dynamic tag globally
    environment {
        IMAGE_TAG = "v1.0.${env.BUILD_NUMBER}"
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
        
        stage('OWASP Dependency-Check (SCA)') {
            steps {
                withCredentials([string(credentialsId: 'nvd-api-key', variable: 'NVD_API_KEY')]) {
                    echo "Running OWASP Dependency-Check..."
                    // We pass the securely injected NVD_API_KEY into the scanner arguments
                    dependencyCheck additionalArguments: "--scan ./ --format HTML --format XML --nvdApiKey ${NVD_API_KEY}", odcInstallation: 'DP-Check'
                    dependencyCheckPublisher pattern: 'dependency-check-report.xml'
                }
            }
        }

        stage('SonarQube Quality Gate (SAST)') {
            environment {
                SCANNER_HOME = tool 'SonarScanner'
            }
            steps {
                echo "Running SonarQube Static Code Analysis..."
                withSonarQubeEnv('SonarQube') {
                    sh "$SCANNER_HOME/bin/sonar-scanner -Dsonar.projectKey=finconvert-app -Dsonar.sources=."
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
                    // 2. Use double quotes to inject the IMAGE_TAG
                    sh "DOCKER_BUILDKIT=0 docker build -t aniketsharma05/finconvert-frontend:${IMAGE_TAG} ."
                }
            }
        }

        stage('Containerize Backend') {
            steps {
                dir('backend') {
                    echo "Packaging Backend into Docker Container..."
                    sh "DOCKER_BUILDKIT=0 docker build -t aniketsharma05/finconvert-backend:${IMAGE_TAG} ."
                }
            }
        }

        stage('Scan Docker Image') {
            steps {
                echo "Scanning Docker image for vulnerabilities..."
                sh "trivy image --severity HIGH,CRITICAL --exit-code 1 aniketsharma05/finconvert-frontend:${IMAGE_TAG}"
                sh "trivy image --severity HIGH,CRITICAL --exit-code 1 aniketsharma05/finconvert-backend:${IMAGE_TAG}"
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    // Password parsing can stay in single quotes to prevent early shell expansion
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                    sh "docker push aniketsharma05/finconvert-frontend:${IMAGE_TAG}"
                    sh "docker push aniketsharma05/finconvert-backend:${IMAGE_TAG}"
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                echo "Deploying applications to K8s cluster..."
                
                // 3. Dynamically replace 'v1.0.0' with our new BUILD_NUMBER tag in the YAMLs
                sh "sed -i 's/v1.0.0/${IMAGE_TAG}/g' k8s/backend-deployment.yaml"
                sh "sed -i 's/v1.0.0/${IMAGE_TAG}/g' k8s/frontend-deployment.yaml"

                // Apply backend manifests
                sh 'kubectl apply -f k8s/backend-deployment.yaml'
                sh 'kubectl apply -f k8s/backend-service.yaml'
                
                // Apply frontend manifests
                sh 'kubectl apply -f k8s/frontend-deployment.yaml'
                sh 'kubectl apply -f k8s/frontend-service.yaml'
            }
        }

        stage('Verify Rollout') {
            steps {
                echo "Verifying zero-downtime deployment rollout..."
                // Blocks the pipeline until the new K8s pods are fully healthy
                sh 'kubectl rollout status deployment/finconvert-backend --timeout=120s'
                sh 'kubectl rollout status deployment/finconvert-frontend --timeout=120s'
            }
        }
    
        stage('Smoke Test') {
            steps {
                echo "Running automated smoke test on the live frontend..."
                sh '''
                    # Fetch the internal K8s cluster IP
                    MINIKUBE_IP=$(minikube ip)

                    # Curl the frontend and extract just the HTTP status code
                    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$MINIKUBE_IP:30080)
                    
                    if [ "$HTTP_STATUS" -eq 200 ]; then
                        echo "Smoke test passed! Application is live and responding with 200 OK."
                    else
                        echo "Smoke test failed! HTTP Status: $HTTP_STATUS"
                        exit 1
                    fi
                '''
            }
        }       
    }
    
    post {
        success {
            echo "✅ PIPELINE SUCCESS: Sending email notification..."
            mail to: 'aniketsharma3100@gmail.com',
                 subject: "SUCCESS: ${env.JOB_NAME} [${env.BUILD_NUMBER}]",
                 body: "Great news! The pipeline ${env.JOB_NAME} completed successfully and is deployed to Kubernetes.\n\nView the build here: ${env.BUILD_URL}"
        }
        failure {
            echo "❌ PIPELINE FAILED: Sending email alert..."
            mail to: 'aniketsharma3100@gmail.com',
                 subject: "FAILED: ${env.JOB_NAME} [${env.BUILD_NUMBER}]",
                 body: "Alert! The pipeline ${env.JOB_NAME} has failed.\n\nPlease check the logs immediately: ${env.BUILD_URL}"
        }
    }
}