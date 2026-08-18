# 💱 Currency Converter: Automated Pipeline

> **An end-to-end containerized web application deployed via a fully automated CI/CD pipeline.** 
> This project demonstrates the implementation of Infrastructure as Code (IaC), continuous security scanning, container orchestration, and automated deployments.
<img width="783" height="635" alt="Currency converter" src="https://github.com/user-attachments/assets/aef7c056-8393-45e3-8725-3cb8918067f9" />



---

## 🏗️ Architecture & Tech Stack

This project provisions an enterprise-grade cloud environment from scratch using Terraform, bootstrapping a fully operational toolchain on a single AWS EC2 instance.

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Cloud Provider** | AWS | Hosts the foundational infrastructure (EC2 `m7i-flex.large`, 30GB EBS). |
| **Infrastructure as Code** | Terraform | Automates the provisioning of servers, firewalls, and bootstrap scripts. |
| **CI/CD Server** | Jenkins | Orchestrates the build, test, and deployment pipelines via `Jenkinsfile`. |
| **Continuous Security** | Trivy, SonarQube & OWASP | SAST, SCA (Dependency Checking), and container vulnerability scanning. |
| **Containerization** | Docker | Packages the Frontend and Backend microservices into portable artifacts. |
| **Orchestration** | Kubernetes (Minikube) | Hosts and manages the live application containers. |
| **Notifications** | Jenkins Email Extension | Dispatches automated pipeline success/failure alerts to stakeholders. |

---

## 📂 Repository Structure

    currency-converter/
    ├── backend/                  # Application backend source code
    ├── frontend/                 # Application frontend source code
    ├── infrastructure/           # Terraform IaC configurations
    │   └── main.tf               # AWS provisioning and toolchain bootstrap script
    ├── k8s/                      # Kubernetes deployment manifests
    ├── .gitignore                # Git ignore rules (configured for Terraform/Secrets)
    ├── .trivyignore              # Vulnerability exceptions for Trivy scanner
    ├── Jenkinsfile               # Declarative CI/CD pipeline definition
    ├── README.md                 # Project documentation
    └── sonar-project.properties  # SonarQube configuration mapping

---

## 🚀 The CI/CD Pipeline Flow

When a developer pushes code to the repository, Jenkins triggers a comprehensive, multi-stage DevSecOps pipeline:

1. **Checkout SCM & Tool Install:** Pulls the latest source code and prepares the required build tools.
2. **Trivy Filesystem Scan:** Scans the raw repository for hardcoded secrets and configuration vulnerabilities.
3. **Frontend Build:** Compiles the frontend assets.
4. **OWASP Dependency-Check:** Performs Software Composition Analysis (SCA) to identify known vulnerabilities in project dependencies.
5. **SonarQube Quality Gate (SAST):** Performs deep static code analysis to ensure code reliability and maintainability before allowing the build to proceed.
6. **Backend Setup:** Prepares and compiles the backend application environment.
7. **Containerize Frontend & Backend:** Docker builds the respective container images for the microservices.
8. **Scan Docker Image:** Trivy scans the compiled Docker images for OS and library CVEs before release.
9. **Push to Docker Hub:** Securely pushes the validated container images to the remote registry.
10. **Deploy to Kubernetes:** `kubectl` applies the deployment manifests, rolling out the new images to the Minikube cluster.
11. **Verify Rollout:** Confirms the Kubernetes pods are healthy and successfully running the new application state.
12. **Smoke Test:** Executes automated post-deployment health checks against the live application.
13. **Post Actions:** Sends comprehensive pipeline success/failure email notifications to the development team.
  
<img width="1364" height="648" alt="jenkins" src="https://github.com/user-attachments/assets/9c75ba8e-44ce-429f-aea6-29a46b00fc36" />


---

## ⚙️ Getting Started

### Prerequisites
* **Terraform** installed locally (`v1.5.0+`).
* **AWS CLI** credentials exported to your terminal session.
* **Docker Hub** account and access token.

---

### 1. Provision the Infrastructure

Navigate to the infrastructure directory and execute the Terraform build. This will spin up the EC2 server, install Java 21, and automatically boot Jenkins, SonarQube, and Minikube.

    cd infrastructure
    terraform init
    terraform plan
    terraform apply 

---

### 2. Unlock the Toolchain

Once the server is running, retrieve the initial Jenkins administrator password directly from the server:

    ssh -i <your-key> ubuntu@<server_public_ip>
    sudo cat /var/lib/jenkins/secrets/initialAdminPassword

---

### 3. Configure Jenkins

1. Navigate to `http://<server_public_ip>:8080` and paste the unlock password.
2. Install the following plugins: **Docker Pipeline**, **SonarQube Scanner**, **Kubernetes CLI**, and **Email Extension Plugin**.
3. Add your global credentials to Jenkins:
   * GitHub Access Token
   * Docker Hub Username & Password
   * SonarQube API Token (Generated at `http://<server_public_ip>:9000`)

---

### 4. Execute the Pipeline

Create a new Pipeline Job in Jenkins, point it to this Git repository, and click **Build Now**. The application will automatically build, test, and deploy to the local Kubernetes cluster.

---

## 🧹 Teardown

To avoid incurring unnecessary AWS cloud charges, destroy the infrastructure when you are finished developing:

    cd infrastructure
    terraform destroy 
