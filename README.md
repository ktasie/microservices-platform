# Microservice Platform

A cloud-native media platform built with Node.js and deployed end-to-end on Microsoft Azure. The system decomposes a media-sharing backend into independently deployable services, each containerised with Docker and orchestrated via Azure Container Apps.

Services communicate through a custom-built API Gateway that centralises JWT verification using RS256 asymmetric signing, keeping individual services stateless and independently scalable.

---

## Architecture Diagram

```text
                         ┌──────────────────┐
                         │     Frontend     │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   API Gateway    │ ← JWT verification (RS256)
                         └────────┬─────────┘   Route-based forwarding
                                  │
      ┌──────────────┬────────────┼────────────┬
      ▼              ▼            ▼            ▼

┌──────────┐  ┌──────────┐ ┌──────────┐ ┌──────────┐
│   Auth   │  │ Comment  │ │   Like   │ │  Photo   │
│ Service  │  │ Service  │ │ Service  │ │ Service  │
└────┬─────┘  └────┬─────┘ └────┬─────┘ └────┬─────┘
     │             │            │            │
     └─────────────┴────────────┴────────────┘
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼

     ┌──────────────┐         ┌────────────────┐
     │ Azure Cosmos │         │ Azure Blob     │
     │ DB (MongoDB) │         │ Storage        │
     └──────────────┘         └────────────────┘
```

## Database Design

Services currently share a single Cosmos DB instance. In production, a database-per-service pattern would improve autonomy and reduce coupling — a deliberate tradeoff to keep operational complexity low while the focus was on service decomposition and deployment.

### Request Flow

```text
Client
   │
   ▼
Frontend
   │
   ▼
API Gateway
   │
   ├── Auth Service
   ├── Comment Service
   ├── Like Service
   └── Photo Service
```

The API Gateway acts as the single entry point into the backend and is responsible for request routing and JWT validation.

![System Architecture](assets/screenshots/architecture-diagram.png)

_High-level overview of the microservice architecture deployed on Azure._

---

## Services

| Service         | Responsibility                                          | Port   |
| --------------- | ------------------------------------------------------- | ------ |
| API Gateway     | Request routing, JWT verification, auth enforcement     | `4000` |
| Auth Service    | User login, JWT issuance (RS256)                        | `4001` |
| Photo Service   | File upload, validation, Azure Blob Storage integration | `4004` |
| Comment Service | Create and retrieve comments                            | `4002` |
| Like Service    | Like/unlike content, engagement tracking                | `4003` |
| Frontend        | Server-rendered UI (Pug), client-side content filtering | `3000` |

---

## API Reference

All requests route through the gateway at `{{GATEWAY_BASE_URL}}:4000`. Protected routes require a `Bearer` token in the `Authorization` header or JWT cookie.

### Authentication Service

| Method | Endpoint | Auth | Description                    |
| ------ | -------- | ---- | ------------------------------ |
| `POST` | `/auth`  | None | Authenticate user, returns JWT |

**Login response:**

```json
{
  "status": "success",
  "token": "eyJhbGciOiJSUzI1NiIs...",
  "data": {
     "user":{
       "_id": "6a29a9...",
       "firstName": "John",
       ...
     }
  }
}
```

---

### Comment Service

| Method | Endpoint            | Auth     | Description              |
| ------ | ------------------- | -------- | ------------------------ |
| `POST` | `/comment`          | Required | Add comment to a photo   |
| `GET`  | `/comment/:photoId` | Required | Get comments for a photo |

---

### Like Service

| Method | Endpoint         | Auth     | Description              |
| ------ | ---------------- | -------- | ------------------------ |
| `POST` | `/like/:photoId` | Required | Like a photo             |
| `GET`  | `/like/:photoId` | Required | Get all likes of a photo |

---

### Photo Service

| Method | Endpoint           | Auth     | Description        |
| ------ | ------------------ | -------- | ------------------ |
| `POST` | `/upload`          | Required | Upload media file  |
| `GET`  | `/upload`          | Required | List all photos    |
| `GET`  | `/upload/:photoId` | Required | List photo details |

---

## Technology Stack

| Layer            | Technology                                 |
| ---------------- | ------------------------------------------ |
| Runtime          | Node.js + Express.js                       |
| Auth             | JSON Web Tokens — RS256 asymmetric signing |
| Database         | Azure Cosmos DB (MongoDB-compatible API)   |
| Media storage    | Azure Blob Storage                         |
| Containerisation | Docker                                     |
| Hosting          | Azure Container Apps                       |
| CI/CD            | Azure DevOps + Docker Hub                  |
| Monitoring       | Azure Application Insights                 |
| Templating       | Pug                                        |

---

## Engineering Decisions

**RS256 over HS256 for JWT signing**
Asymmetric signing means the private key lives only in the Auth Service. All other services verify tokens using the public key — no shared secret distributed across the system.

**Custom API Gateway over a managed solution**
Building the gateway in Express gave precise control over routing logic and JWT middleware. It enforces auth at the network boundary so individual services remain stateless and don't duplicate verification logic.

**Cosmos DB with MongoDB-compatible API**
Using the MongoDB-compatible interface avoids locking data access patterns to a vendor-specific query API, while still benefiting from Cosmos DB's managed scaling and global distribution.

**Externalised media storage (Azure Blob)**
Storing media outside the application tier keeps services stateless and avoids disk I/O coupling between the photo service and its replicas.

**Stateless services and replica-based scaling**
Because JWT verification is handled at the gateway and media is stored in Azure Blob, no service holds local state. This means any service can be horizontally scaled by adding replicas on Azure Container Apps without session affinity or shared disk concerns.

**Synchronous HTTP between services**
Chosen for simplicity at this scale. The tradeoff is tighter temporal coupling — a downstream service outage stalls the caller. An event-driven approach (message queue) would be preferable at higher throughput.

---

## Repository Structure

```text
microservices-platform/
├── frontend/
├── gateway/
├── services/
│   ├── auth-service/
│   ├── comment-service/
│   ├── like-service/
│   └── photo-service/
├── assets/
│   └── screenshots/
├── docker-compose.yml
├── azure-pipelines.yml
└── README.md
```

---

## JWT Key Configuration

The platform uses RS256. Generate a key pair before running locally:

Generate the keys:

```bash
openssl genpkey -algorithm RSA -out jwt_rsa -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in private.pem -out jwt_rsa.pub
```

Place the generated files in `keys/` at the root directory of the mono repo:

```text
microservice-platform/
├── keys/
    ├── jwt_rsa
    └── jwt_rsa.pub
```

Reference the keys/ path in each service's .env and .env.docker file via the JWT_PRIVATE_KEY_PATH / JWT_PUBLIC_KEY_PATH variables."
The application loads these files at startup for JWT signing and verification.

> Important: Do not commit `jwt_rsa` to version control.

---

### Environment Variables

Each service is configured via environment variables. Copy the example files and fill in values:

```bash
cp services/auth-service/.env.example services/auth-service/.env
# repeat for each service
```

| Variable                         | Description                                    |
| -------------------------------- | ---------------------------------------------- |
| `COSMOS_CONNECTION_STRING`       | Azure Cosmos DB connection string              |
| `BLOB_STORAGE_CONNECTION_STRING` | Azure Blob Storage connection string           |
| `JWT_PRIVATE_KEY_PATH`           | Path to `jwt_rsa` (Auth Service only)          |
| `JWT_PUBLIC_KEY_PATH`            | Path to `jwt_rsa.pub`                          |
| `FRONTEND_URL`                   | URL used to access the frontend                |
| `NODE_ENV`                       | use `development` for local install and docker |

For docker:

```bash
cp services/auth-service/.env.example services/auth-service/.env.docker
# repeat for each service
```

---

## Cloud Deployment

The platform is deployed on Microsoft Azure using a container-based architecture.

### Azure Services Used

| Service              | Purpose                         |
| -------------------- | ------------------------------- |
| Azure Container Apps | Hosting microservices           |
| Azure Cosmos DB      | Application data storage        |
| Azure Blob Storage   | Media storage                   |
| Docker Hub           | Container image registry        |
| Azure Log Analytics  | Monitoring and diagnostics      |
| Azure DevOps         | Build and deployment automation |

---

## Screenshots

### Login & Authentication

![Login Page](assets/screenshots/login-page.png)

---

### Home Feed

![Home Feed](assets/screenshots/home-feed.png)

---

### Upload Functionality

![Upload Service](assets/screenshots/upload.png)

---

### Comment and Like Functionality

![Comment Service](assets/screenshots/comment-like.png)

---

## Azure Deployment Screenshots

### Azure Container Apps

![Azure Container Apps](assets/screenshots/azure-container-apps.png)

_Independent deployment of microservices using Azure Container Apps._

---

### Azure Cosmos DB

![Azure Cosmos DB](assets/screenshots/azure-cosmosdb.png)

_Application metadata and user information stored in Azure Cosmos DB._

---

### Azure Blob Storage

![Azure Blob Storage](assets/screenshots/azure-blob-storage.png)

_Cloud storage for uploaded media assets._

---

### Azure App Insights

![Azure Log Analytics](assets/screenshots/azure-app-insights.png)

_Application Insights integration._

---

### Azure DevOps Pipeline

![Azure DevOps Pipeline](assets/screenshots/azure-devops-pipeline.png)

_Build and deployment automation workflow._

---

## Local Development

### Prerequisites

- Node.js `24.12.0`
- MongoDB (local instance or Docker)
- Docker
- Azurite (Azure Storage Emulator)

### Clone Repository

```bash
git clone https://github.com/ktasie/microservices-platform.git
cd microservices-platform
```

### Install Dependencies

Run for each service:

```bash
cd services/auth-service && npm install
cd ../comment-service && npm install
cd ../like-service && npm install
cd ../photo-service && npm install
cd ../../gateway && npm install
cd ../frontend && npm install
```

### Start Local Infrastructure

Start MongoDB and Azurite.

### Run Services

```bash
npm run start
```

or

```bash
node app.js
```

Each microservice must be started independently.

### For Docker setup

Use the root-level `docker-compose.yml` to start all services together:

```bash
docker compose up --build
```

### Load Seeders

To populate the database with initial data for local development:

**Without Docker:**

```bash
cd services/auth-service/
node seed-users.js
```

**With docker:**

```bash
docker compose exec auth-service node seed-users.js
```

---

### Default Credentials

Navigate to your web browser and type `http://{{FRONTEND_URL}}:3000/`. Use the credentials below to login.

| Role          | User                   | Password      |
| ------------- | ---------------------- | ------------- |
| Administrator | `john.doe@example.com` | `StrongPass`  |
| Normal User   | `ktasie@example.com`   | `AnotherPass` |

> These credentials are for local development only. Never use default credentials in a production environment.

---

## CI/CD

Defined in `azure-pipelines.yml`. On push to `main`:

1. Source pulled from repository
2. Docker image built per service
3. Image pushed to Docker Hub
4. Service deployed to Azure Container Apps

Each service has its own pipeline stage, so a change to the Like Service doesn't trigger a redeploy of Auth.

---

## Monitoring & Observability

Operational visibility is provided through Application Insights. This is accessible via the Azure portal after deployment.

---

## Known Tradeoffs

| Area                  | Current state                      | Better approach at scale                                           |
| --------------------- | ---------------------------------- | ------------------------------------------------------------------ |
| Service communication | Synchronous HTTP                   | Message queue (e.g. Azure Service Bus) for async decoupling        |
| Search / filtering    | Client-side filtering              | Dedicated search index (e.g. Azure Cognitive Search)               |
| Testing               | No automated tests                 | Unit tests per service + contract tests at the gateway boundary    |
| Observability         | Log Analytics + basic App Insights | Distributed tracing (e.g. OpenTelemetry) across service boundaries |
| Deployment            | Single-region                      | Multi-region with Azure Front Door + WAF                           |

---

**Kelechukwu Tasie** · [github.com/ktasie/microservices-platform](https://github.com/ktasie/microservices-platform)
