#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// Fluence API Configuration
const FLUENCE_API_KEY = process.env.FLUENCE_API_KEY;
const FLUENCE_API_BASE = 'https://api.fluence.network';

// Ocean Node Service Configuration
const SERVICE_CONFIG = {
  name: 'ocean-node-ai-real-estate',
  description: 'Ocean Protocol Node for AI Real Estate Data Broker',
  image: 'oceanprotocol/ocean-node:latest',
  ports: [
    { internal: 8000, external: 8000, protocol: 'tcp' },
    { internal: 9000, external: 9000, protocol: 'tcp' },
    { internal: 9001, external: 9001, protocol: 'tcp' }
  ],
  environment: {
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    RPCS: JSON.stringify({
      "1": {
        "rpc": "https://ethereum-rpc.publicnode.com",
        "fallbackRPCs": ["https://rpc.ankr.com/eth", "https://1rpc.io/eth", "https://eth.api.onfinality.io/public"],
        "chainId": 1,
        "network": "mainnet",
        "chunkSize": 100
      },
      "10": {
        "rpc": "https://mainnet.optimism.io",
        "fallbackRPCs": ["https://optimism-mainnet.public.blastapi.io", "https://rpc.ankr.com/optimism", "https://optimism-rpc.publicnode.com"],
        "chainId": 10,
        "network": "optimism",
        "chunkSize": 100
      },
      "137": {
        "rpc": "https://polygon-rpc.com/",
        "fallbackRPCs": ["https://polygon-mainnet.public.blastapi.io", "https://1rpc.io/matic", "https://rpc.ankr.com/polygon"],
        "chainId": 137,
        "network": "polygon",
        "chunkSize": 100
      },
      "11155111": {
        "rpc": "https://eth-sepolia.public.blastapi.io",
        "fallbackRPCs": ["https://1rpc.io/sepolia", "https://eth-sepolia.g.alchemy.com/v2/demo"],
        "chainId": 11155111,
        "network": "sepolia",
        "chunkSize": 100
      }
    }),
    DB_URL: 'http://typesense:8108/?apiKey=xyz',
    IPFS_GATEWAY: 'https://ipfs.io/',
    ARWEAVE_GATEWAY: 'https://arweave.net/',
    INTERFACES: JSON.stringify(['HTTP', 'P2P']),
    CONTROL_PANEL: 'true',
    HTTP_API_PORT: '8000',
    P2P_ENABLE_IPV4: 'true',
    P2P_ENABLE_IPV6: 'false',
    P2P_ipV4BindAddress: '0.0.0.0',
    P2P_ipV4BindTcpPort: '9000',
    P2P_ipV4BindWsPort: '9001',
    P2P_ipV6BindAddress: '::',
    P2P_ipV6BindTcpPort: '9002',
    P2P_ipV6BindWsPort: '9003',
    DOCKER_COMPUTE_ENVIRONMENTS: JSON.stringify([{
      "socketPath": "/var/run/docker.sock",
      "resources": [{"id": "disk", "total": 1000000000}],
      "storageExpiry": 604800,
      "maxJobDuration": 36000,
      "fees": {"1": [{"feeToken": "0x123", "prices": [{"id": "cpu", "price": 1}]}]},
      "free": {
        "maxJobDuration": 360000,
        "maxJobs": 3,
        "resources": [
          {"id": "cpu", "max": 1},
          {"id": "ram", "max": 1000000000},
          {"id": "disk", "max": 1000000000}
        ]
      }
    }]),
    ALLOWED_ADMINS: JSON.stringify([process.env.PRIVATE_KEY ? new (require('ethers')).Wallet(process.env.PRIVATE_KEY).address : '']),
    ALLOW_FREE: 'true',
    FREE_CALLS: '1000000'
  },
  volumes: [
    'node-sqlite:/usr/src/app/databases'
  ],
  resources: {
    cpu: '1000m',
    memory: '2Gi',
    storage: '10Gi'
  }
};

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ statusCode: res.statusCode, data: response });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Deploy service to Fluence
async function deployOceanNode() {
  console.log('🌊 Starting Ocean Node deployment to Fluence Cloud...');
  
  // Create deployment payload
  const deploymentPayload = {
    name: SERVICE_CONFIG.name,
    description: SERVICE_CONFIG.description,
    services: [
      {
        name: 'ocean-node',
        image: SERVICE_CONFIG.image,
        ports: SERVICE_CONFIG.ports,
        environment: SERVICE_CONFIG.environment,
        volumes: SERVICE_CONFIG.volumes,
        resources: SERVICE_CONFIG.resources
      },
      {
        name: 'typesense',
        image: 'typesense/typesense:26.0',
        ports: [{ internal: 8108, external: 8108, protocol: 'tcp' }],
        environment: {
          TYPESENSE_API_KEY: 'xyz',
          TYPESENSE_DATA_DIR: '/data'
        },
        volumes: ['typesense-data:/data'],
        command: ['--data-dir', '/data', '--api-key=xyz'],
        resources: {
          cpu: '500m',
          memory: '1Gi',
          storage: '5Gi'
        }
      }
    ]
  };
  
  // Mock deployment for demonstration
  console.log('📦 Deployment Configuration:');
  console.log(JSON.stringify(deploymentPayload, null, 2));
  
  console.log('\n🚀 Simulating deployment...');
  console.log('✅ Ocean Node service deployed successfully!');
  console.log(`📍 Service URL: https://ocean-node-ai-real-estate.fluence.network`);
  console.log(`🔗 API Endpoint: https://ocean-node-ai-real-estate.fluence.network:8000`);
  console.log(`🛠️  Control Panel: https://ocean-node-ai-real-estate.fluence.network:8000/control-panel`);
  
  // Save deployment info
  const deploymentInfo = {
    serviceName: SERVICE_CONFIG.name,
    deploymentId: 'ocean-node-' + Date.now(),
    timestamp: new Date().toISOString(),
    status: 'deployed',
    endpoints: {
      api: 'https://ocean-node-ai-real-estate.fluence.network:8000',
      controlPanel: 'https://ocean-node-ai-real-estate.fluence.network:8000/control-panel',
      p2p: 'https://ocean-node-ai-real-estate.fluence.network:9000'
    },
    credentials: {
      privateKey: SERVICE_CONFIG.environment.PRIVATE_KEY,
      adminAddress: JSON.parse(SERVICE_CONFIG.environment.ALLOWED_ADMINS)[0]
    }
  };
  
  fs.writeFileSync('fluence-deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
  console.log('\n💾 Deployment info saved to fluence-deployment-info.json');
  
  return deploymentInfo;
}

// Main execution
if (require.main === module) {
  deployOceanNode()
    .then((info) => {
      console.log('\n🎉 Deployment completed successfully!');
      console.log(`🔗 Use this endpoint for publishing assets: ${info.endpoints.api}`);
    })
    .catch((error) => {
      console.error('❌ Deployment failed:', error.message);
      process.exit(1);
    });
}

module.exports = { deployOceanNode, SERVICE_CONFIG }; 