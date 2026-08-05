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
        stage('OWASP Dependency-Check (SCA)') {
            steps {
                echo "Running OWASP Dependency-Check..."
                dependencyCheck additionalArguments: '--scan ./ --format HTML --format XML', odcInstallation: 'DP-Check'
                dependencyCheckPublisher pattern: 'dependency-check-report.xml'
            }
        }

        stage('SonarQube Quality Gate (SAST)') {
            steps {
                echo "Running SonarQube Static Code Analysis..."
                withSonarQubeEnv('SonarQube') {
                    sh '/var/lib/jenkins/tools/hudson.plugins.sonar.SonarRunnerInstallation/SonarScanner/bin/sonar-scanner'
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
                    sh 'DOCKER_BUILDKIT=0 docker build -t aniketsharma05/finconvert-frontend:latest .'
                }
            }
        }

        stage('Containerize Backend') {
            steps {
                dir('backend') {
                    echo "Packaging Backend into Docker Container..."
                    sh 'DOCKER_BUILDKIT=0 docker build -t aniketsharma05/finconvert-backend:latest .'
                }
            }
        }

        stage('Scan Docker Image') {
            steps {
                echo "Scanning Docker image for vulnerabilities..."
                // Fails the pipeline if a High or Critical CVE is found in the container image
                sh 'trivy image --severity HIGH,CRITICAL --exit-code 1 aniketsharma05/finconvert-frontend:latest'
                sh 'trivy image --severity HIGH,CRITICAL --exit-code 1 aniketsharma05/finconvert-backend:latest'
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                    sh 'docker push aniketsharma05/finconvert-frontend:latest'
                    sh 'docker push aniketsharma05/finconvert-backend:latest'
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                echo "Deploying applications to K8s cluster..."
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
            mail to: 'aniketsharma3100example.com',
                 subject: "SUCCESS: ${env.JOB_NAME} [${env.BUILD_NUMBER}]",
                 body: "Great news! The pipeline ${env.JOB_NAME} completed successfully and is deployed to Kubernetes.\n\nView the build here: ${env.BUILD_URL}"
        }
        failure {
            echo "❌ PIPELINE FAILED: Sending email alert..."
            mail to: 'aniketsharma3100example.com',
                 subject: "FAILED: ${env.JOB_NAME} [${env.BUILD_NUMBER}]",
                 body: "Alert! The pipeline ${env.JOB_NAME} has failed.\n\nPlease check the logs immediately: ${env.BUILD_URL}"
        }
    }
}