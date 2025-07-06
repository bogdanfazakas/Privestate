# 🏠 Privestate

**Privestate** is a privacy-preserving, AI-powered data broker for real estate analytics. It enables attested users to run secure compute-to-data (C2D) jobs on private datasets using Ocean Protocol, with post-processing powered by Katana AI.

---

## 🔍 Overview

This project was developed for **ETHGlobal Cannes 2025** to showcase the future of decentralized, privacy-respecting AI in real estate.

- 🔐 **Self Protocol** – gate access to datasets using verifiable attestations
- 🌊 **Ocean Protocol** – run compute-to-data jobs without exposing raw data
- 🧠 **Katana AI** – enrich and interpret outputs using LLMs
- ☁️ **Fluence** – host the Ocean Node in a decentralized cloud
- 🧑‍💻 **Next.js Frontend** – simple UI for demo interaction

---

## 🏁 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/bogdanfazakas/Privestate.git
cd Privestate
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure credentials

See [CREDENTIALS.md](./CREDENTIALS.md) for detailed setup instructions.

```bash
# Create .env file with your credentials
PRIVATE_KEY=your_ethereum_private_key_here
FLUENCE_API_KEY=your_fluence_api_key_here
```

### 4. Deploy Ocean Node and publish assets

```bash
# Deploy Ocean Node to Fluence Cloud
npm run deploy-ocean-node

# Publish real estate dataset and algorithm
npm run publish-assets
```

---

## 🌊 Ocean Node Deployment & Publishing Guide

This section provides detailed steps for deploying an Ocean Protocol Node on Fluence Cloud and publishing real estate assets with compute-to-data capabilities.

### Prerequisites

- **Node.js** (v14 or higher)
- **Ethereum Private Key** (for signing transactions)
- **Fluence Cloud Account** with API key
- **Docker** (for local development)

### Step 1: Environment Setup

1. **Create Environment File**

   ```bash
   cp CREDENTIALS.md .env
   # Edit .env with your actual credentials
   ```

2. **Required Environment Variables**

   ```bash
   PRIVATE_KEY=your_ethereum_private_key_here
   FLUENCE_API_KEY=your_fluence_api_key_here
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

### Step 2: Ocean Node Deployment on Fluence Cloud

#### Option A: Automated Deployment (Recommended)

```bash
# Deploy Ocean Node service to Fluence Cloud
node scripts/deployToFluence.js
```

This script will:

- ✅ Configure Ocean Node with your private key
- ✅ Set up Typesense backend for metadata search
- ✅ Enable free compute-to-data with 1M calls
- ✅ Configure P2P networking for Ocean Protocol
- ✅ Deploy to Fluence Cloud infrastructure

#### Option B: Manual Docker Deployment (Local Development)

```bash
# Start Ocean Node locally with Docker
docker-compose up -d

# Check service health
curl http://localhost:8000/health
```

#### Deployment Verification

1. **Check Ocean Node Health**

   ```bash
   curl https://ocean-node-ai-real-estate.fluence.network:8000/health
   ```

2. **Access Control Panel**

   - URL: `https://ocean-node-ai-real-estate.fluence.network:8000/control-panel`
   - Verify services are running: Ocean Node, Typesense, P2P

3. **Verify Configuration**
   ```bash
   # Check node configuration
   curl https://ocean-node-ai-real-estate.fluence.network:8000/api/v1/config
   ```

### Step 3: Asset Publishing

#### Publish Real Estate Dataset & Algorithm

```bash
# Set environment and publish assets
PRIVATE_KEY=your_key_here npm run publish-assets
```

This will publish:

1. **Dubai Real Estate Dataset** (`data.json`)

   - Comprehensive property data with prices, locations, features
   - DID: `did:op:generated-unique-identifier`
   - Free access with compute-to-data enabled

2. **Price Analysis Algorithm** (`average-price.py`)
   - Python algorithm for statistical price analysis
   - DID: `did:op:generated-unique-identifier`
   - Compatible with dataset for C2D jobs

#### Publishing Process Details

The publishing script performs these steps:

1. **Initialize Ocean Publisher**

   - Connect to Fluence Ocean Node
   - Load private key and derive wallet address
   - Verify node health and connectivity

2. **Upload Dataset**

   ```typescript
   // Asset metadata structure
   {
     main: {
       type: "dataset",
       name: "Dubai Real Estate Properties Dataset",
       author: "Real Estate Data Broker",
       license: "CC0: Public Domain",
       files: [{ url: "...", contentType: "application/json" }]
     },
     additionalInformation: {
       description: "Comprehensive dataset for AI analysis",
       tags: ["real-estate", "dubai", "property", "dataset", "ai"]
     }
   }
   ```

3. **Upload Algorithm**

   ```typescript
   // Algorithm metadata structure
   {
     main: {
       type: "algorithm",
       name: "Real Estate Average Price Calculator",
       algorithm: {
         language: "python",
         format: "docker-image",
         container: { image: "python:3.9-slim" }
       }
     }
   }
   ```

4. **Configure Compute-to-Data**
   - Enable free access (0 OCEAN cost)
   - Allow raw algorithms
   - Allow network algorithms
   - Set resource limits: 1 CPU, 1GB RAM, 1GB disk

### Step 4: Verification & Testing

#### Verify Assets on Ocean Node

1. **Check Asset Visibility**

   ```bash
   # List published datasets
   curl https://ocean-node-ai-real-estate.fluence.network:8000/api/v1/aquarius/assets/ddo

   # Get specific asset details
   curl https://ocean-node-ai-real-estate.fluence.network:8000/api/v1/aquarius/assets/ddo/{DID}
   ```

2. **Test Compute-to-Data**

   ```bash
   # Start a C2D job (example)
   curl -X POST https://ocean-node-ai-real-estate.fluence.network:8000/api/v1/compute \
     -H "Content-Type: application/json" \
     -d '{
       "dataset": "did:op:dataset-did",
       "algorithm": "did:op:algorithm-did",
       "compute": { "Instances": 1, "namespace": "ocean-compute" }
     }'
   ```

3. **Monitor Ocean Node**
   - Control Panel: `https://ocean-node-ai-real-estate.fluence.network:8000/control-panel`
   - Check logs, job status, and system health

#### Deployment Output Files

Successful deployment creates these files:

- `fluence-deployment-info.json` - Ocean Node service details
- `fluence-assets-deployment.json` - Published asset metadata
- `deployment-info.json` - Legacy format (if created)

Example deployment info:

```json
{
	"timestamp": "2025-07-05T12:47:42.368Z",
	"fluenceNodeUrl": "https://ocean-node-ai-real-estate.fluence.network:8000",
	"publisherAddress": "WALLET_ADDRESS_DERIVED_FROM_PRIVATE_KEY",
	"assets": {
		"dataset": {
			"did": "did:op:e329bb0a301a2d322e5a981671a057a69707e97ca70ca6b8a7020c392f9fdf11",
			"accessUrl": "https://ocean-node-ai-real-estate.fluence.network:8000/api/v1/datasets/..."
		},
		"algorithm": {
			"did": "did:op:bf7c6d3cbc29cddaffcc07948850eb465a8fdcd4d8e3057a21e9f25642a42551",
			"accessUrl": "https://ocean-node-ai-real-estate.fluence.network:8000/api/v1/algorithms/..."
		}
	}
}
```

### Step 5: Configuration Options

#### Ocean Node Configuration

Edit `ocean-node-service.yaml` or `docker-compose.yml` to customize:

- **Network Settings**: RPC endpoints, chain configurations
- **P2P Settings**: Ports, announce addresses, bootstrap nodes
- **C2D Settings**: Resource limits, job duration, pricing
- **Admin Settings**: Allowed admin addresses, permissions

#### Environment Variables Reference

| Variable          | Description                      | Example      |
| ----------------- | -------------------------------- | ------------ |
| `PRIVATE_KEY`     | Ethereum private key for signing | `0x1234...`  |
| `FLUENCE_API_KEY` | Fluence Cloud API key            | `abc-123...` |
| `WALLET_ADDRESS`  | Auto-derived from private key    | `0xabc...`   |
| `ALLOW_FREE`      | Enable free C2D access           | `true`       |
| `FREE_CALLS`      | Max free calls allowed           | `1000000`    |

---

## 🔧 Troubleshooting

### Common Issues

1. **Ocean Node not responding**

   ```bash
   # Check service status
   docker-compose ps

   # View logs
   docker-compose logs ocean-node
   ```

2. **Asset publishing fails**

   - Verify `PRIVATE_KEY` is set correctly
   - Check Ocean Node health endpoint
   - Ensure sufficient ETH for gas fees

3. **C2D jobs failing**

   - Check algorithm compatibility
   - Verify dataset accessibility
   - Review resource limits

4. **Environment variables not loaded**
   ```bash
   # Debug environment
   node -e "console.log(process.env.PRIVATE_KEY ? 'Key loaded' : 'Key missing')"
   ```

### Debug Commands

```bash
# Check Ocean Node logs
docker-compose logs -f ocean-node

# Test API endpoints
curl -v https://ocean-node-ai-real-estate.fluence.network:8000/health

# Verify asset metadata
curl https://ocean-node-ai-real-estate.fluence.network:8000/api/v1/aquarius/assets/ddo/{DID}
```

---

## 📚 Additional Resources

- [Ocean Protocol Documentation](https://docs.oceanprotocol.com/)
- [Fluence Cloud Documentation](https://docs.fluence.network/)
- [Self Protocol Documentation](https://docs.self.id/)
- [Katana AI Documentation](https://katana.ai/docs)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🏆 ETHGlobal Cannes 2025

Built for **ETHGlobal Cannes 2025** - showcasing the future of privacy-preserving AI in real estate through decentralized infrastructure.
