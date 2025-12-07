# Oreva AWS Implementation Flowchart

This flowchart illustrates the target **Serverless Architecture** for the Oreva Security Scanner, integrating orchestration, event-driven patterns, and AI.

```mermaid
graph TD
    %% Actors
    User[User / Dashboard]
    GitHub[GitHub Webhooks]

    %% Ingress Layer
    subgraph Ingress["Ingress Layer (Amazon API Gateway)"]
        APIGW[API Gateway]
    end

    %% Event Bus Layer
    subgraph EventLayer["Event Bus (Amazon EventBridge)"]
        EventBus[EventBridge Bus]
        Rule[Event Rules]
    end

    %% Orchestration Layer
    subgraph Orchestration["Orchestration (AWS Step Functions)"]
        SFN[Step Functions Workflow]
        
        subgraph States
            ScanState[Scanning State]
            AnalyzeState[Analyzing State]
            ReportState[Reporting State]
        end
    end

    %% Execution & Compute
    subgraph Compute["Execution Plane (AWS Lambda)"]
        ScannerLambda[Scanner Lambda]
        ParserLambda[Parser/Logic Lambda]
    end

    %% Cognitive Core
    subgraph AI["Cognitive Core (Amazon Bedrock)"]
        Bedrock[Claude 3.5 Sonnet / Titan]
    end

    %% Persistence Layer
    subgraph Data["Persistence (Amazon DynamoDB)"]
        DDB[(DynamoDB Table)]
    end

    %% Connections
    User -->|Manual Trigger| APIGW
    GitHub -->|Push Event| APIGW
    
    APIGW -->|Route Request| EventBus
    
    EventBus -->|Match Rule| Rule
    Rule -->|Trigger Workflow| SFN
    
    SFN -->|Start| ScanState
    ScanState -->|Invoke| ScannerLambda
    ScannerLambda -->|Fetch Code| GitHub
    
    ScanState -->|Next| AnalyzeState
    AnalyzeState -->|Invoke| ParserLambda
    ParserLambda -->|Invoke Model| Bedrock
    Bedrock -->|Analysis Results| ParserLambda
    
    AnalyzeState -->|Next| ReportState
    ReportState -->|Save Findings| DDB
    
    %% Styling
    style User fill:#fff,stroke:#333,stroke-width:2px
    style GitHub fill:#fff,stroke:#333,stroke-width:2px
    
    style APIGW fill:#8C4FFF,stroke:#333,stroke-width:2px,color:white
    style EventBus fill:#FF4F8B,stroke:#333,stroke-width:2px,color:white
    style SFN fill:#FF4F8B,stroke:#333,stroke-width:2px,color:white
    style ScannerLambda fill:#FF9900,stroke:#333,stroke-width:2px,color:white
    style ParserLambda fill:#FF9900,stroke:#333,stroke-width:2px,color:white
    style Bedrock fill:#232F3E,stroke:#333,stroke-width:2px,color:white
    style DDB fill:#3F8624,stroke:#333,stroke-width:2px,color:white
```

## Architecture Components

Based on the target architecture plan:

| Component Type | Included AWS Service | Role |
| :--- | :--- | :--- |
| **Ingress** | **Amazon API Gateway** | Secure entry point for the frontend and webhooks to trigger AWS resources. |
| **Event Bus** | **Amazon EventBridge** | Decouples the trigger (Push event/User action) from the action (Start Scan). |
| **Orchestration** | **AWS Step Functions** | Manages the workflow state (Scanning -> Analyzing -> Reporting). |
| **Execution Plane** | **AWS Lambda** | Ephemeral compute for running scans and logic without managing servers. |
| **Cognitive Core** | **Amazon Bedrock** | Accessing Foundation Models (like Claude 3.5 Sonnet) securely within the VPC. |
| **Persistence** | **Amazon DynamoDB** | Storing findings, compliance state, and performing rapid lookups. |
