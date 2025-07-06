# Environment Variables

This document describes the environment variables required for the AI Platform project.

## Required Environment Variables

### Ocean Protocol & Ethereum Configuration

- `PRIVATE_KEY`: Your Ethereum private key for signing transactions
- `OCEAN_PRIVATE_KEY`: Your Ocean Protocol private key (can be same as PRIVATE_KEY)

### Fluence Cloud Configuration

- `FLUENCE_API_KEY`: Your Fluence Cloud API key
- `FLUENCE_HOST`: Fluence deployment host
- `FLUENCE_USER`: Fluence user account
- `FLUENCE_SSH_KEY`: SSH key for Fluence deployment
- `FLUENCE_ADDRESS`: Fluence deployment address

### AI Services Configuration

- `ASI1_MINI_API_KEY`: Your ASI-1 mini API key
- `ASI1_MINI_ENDPOINT`: ASI-1 mini API endpoint (default: https://api.asi1.ai/v1)
- `ASI1_MINI_TIMEOUT`: Request timeout in milliseconds (default: 30000)
- `ASI1_MINI_RETRY_COUNT`: Number of retry attempts (default: 3)

### Self Protocol Configuration

- `SELF_PROTOCOL_API_KEY`: Your Self Protocol API key
- `SELF_PROTOCOL_ENDPOINT`: Self Protocol API endpoint

### Frontend Configuration

- `NEXT_PUBLIC_SELF_API_KEY`: Self Protocol API key for frontend (public)

### Development Configuration

- `NODE_ENV`: Environment mode (development/production)
- `LOG_LEVEL`: Logging level (info/debug/error)

### Optional Configuration

- `OCEAN_NODE_API_KEY`: Ocean Node API key
- `TYPESENSE_API_KEY`: Typesense search API key

## Setting Environment Variables

### For Development

Create a `.env` file in the project root:

```bash
# Copy this template and fill in your actual values
PRIVATE_KEY=your_ethereum_private_key_here
FLUENCE_API_KEY=your_fluence_api_key_here
ASI1_MINI_API_KEY=your_asi1_mini_api_key_here
SELF_PROTOCOL_API_KEY=your_self_protocol_api_key_here
# ... add other variables as needed
```

### For Production

Set environment variables in your deployment environment:

```bash
export PRIVATE_KEY=your_ethereum_private_key_here
export FLUENCE_API_KEY=your_fluence_api_key_here
export ASI1_MINI_API_KEY=your_asi1_mini_api_key_here
export SELF_PROTOCOL_API_KEY=your_self_protocol_api_key_here
```

## Security Notes

- Never commit actual API keys or private keys to version control
- Use different keys for development and production environments
- Store sensitive credentials in secure environment variable stores
- Rotate keys regularly
- Use least-privilege access for all API keys

## Getting API Keys

### ASI-1 Mini

1. Visit https://asi1.ai/
2. Sign up for an account
3. Generate an API key in your dashboard

### Self Protocol

1. Visit Self Protocol website
2. Create a developer account
3. Generate API keys for your application

### Fluence Cloud

1. Visit https://fluence.network/
2. Sign up for Fluence Cloud
3. Create a new project and get your API key

### Ocean Protocol

1. Use any Ethereum private key
2. Ensure the wallet has sufficient funds for gas fees
3. For mainnet, use real ETH; for testnets, use test ETH
