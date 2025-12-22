# Oreva - Advanced Security Platform

Oreva is a comprehensive security platform designed to secure your code, cloud, and runtime in one central system. It unifies multiple security scanners into a single, cohesive interface, helping you find and fix vulnerabilities automatically.

## 🚀 Features

Oreva integrates 15+ security scanning capabilities to replace multiple disjointed tools:

*   **🛡️ Code Security**:
    *   **SAST (Static Application Security Testing)**: Scans source code for risks.
    *   **SCA (Software Composition Analysis)**: Monitors open-source dependencies (CVEs).
    *   **Secrets Detection**: Finds leaked API keys and credentials.
    *   **Code Quality**: AI-powered code review for bugs and anti-patterns.
    *   **License Scanning**: Checks for restrictive or risky licenses.
*   **☁️ Cloud Security**:
    *   **CSPM (Cloud Security Posture Management)**: Detects infrastructure risks.
    *   **IaC Scanning**: Checks Terraform, CloudFormation, K8s configs.
    *   **Container Scanning**: Vulnerability scanning for container images.
    *   **VM Scanning**: Scans virtual machines for risks.
*   **🔒 Runtime Protection**:
    *   **DAST (Dynamic Application Security Testing)**: Simulates attacks on running apps.
    *   **K8s Runtime Security**: Runtime protection for Kubernetes.
    *   **Malware Detection**: Prevents malicious packages.
*   **🤖 AI-Powered**:
    *   **AutoFix**: AI agent to automatically generate fixes and PRs.
    *   **AutoTriage**: Filters irrelevant alerts based on context.

## 🛠️ Tech Stack

*   **Frontend**: Next.js (React), Tailwind CSS, Lucide React
*   **Authentication**: NextAuth.js, Firebase
*   **Database**: Firebase Firestore
*   **Infrastructure**: AWS CDK (Cloud Development Kit)
*   **AI/ML**: Amazon Bedrock, Google Gemini
*   **Compute**: AWS Lambda (Node.js)

## 📦 Getting Started

### Prerequisites

*   Node.js (v18+)
*   npm or yarn
*   AWS CLI configured with appropriate credentials
*   Firebase project credentials

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/dhruvpal102005/Oreva.git
    cd Oreva
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  Set up environment variables:
    Create a `.env.local` file in the root directory and add your keys (see `.env.example` if available, or ask the team for keys).

### Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Deploying Infrastructure (AWS)

The project uses AWS CDK for infrastructure.

1.  Navigate to the infrastructure directory:
    ```bash
    cd infra
    ```

2.  Install infra dependencies:
    ```bash
    npm install
    ```

3.  Deploy the stack:
    ```bash
    npx cdk deploy
    ```

## 🏗️ Architecture

The security scanning engine is powered by AWS Lambda and Amazon Bedrock.
See [aws-flowchart.md](./aws-flowchart.md) for a visual diagram of the AWS implementation.
