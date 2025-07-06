const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: ['agent', 'postprocessing', 'self-protocol']
  });
});

// Agent Service Endpoints
app.post('/api/agent/run-job', async (req, res) => {
  try {
    console.log('🚀 Starting C2D job...');
    
    // Simulate job execution with realistic timing
    const jobId = 'job_' + Date.now();
    const startTime = Date.now();
    
    setTimeout(() => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      res.json({
        jobId,
        status: 'completed',
        timestamp: new Date().toISOString(),
        duration: duration + 'ms',
        message: 'C2D job completed successfully',
        result: {
          dataProcessed: true,
          recordCount: 487,
          processingTime: duration,
          oceanNode: process.env.OCEAN_NODE_URL || 'http://localhost:8000'
        }
      });
    }, 5000); // 5 second processing time
    
  } catch (error) {
    console.error('Agent job error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/agent/job/:jobId', (req, res) => {
  const { jobId } = req.params;
  
  // Mock job status check
  res.json({
    jobId,
    status: 'completed',
    timestamp: new Date().toISOString(),
    progress: 100,
    logs: ['Job started', 'Data loading complete', 'Processing finished', 'Results ready']
  });
});

// ASI-1 mini Post-processing Service
app.post('/api/postprocessing/analyze', async (req, res) => {
  try {
    console.log('🤖 Processing with ASI-1 mini...');
    
    // Simulate ASI-1 mini analysis
    const analysisResult = {
      summary: "Analysis of Dubai real estate market reveals significant price variations across property types. The market shows strong performance in luxury segments with premium properties commanding substantial premiums over standard offerings.",
      chart: {
        type: 'bar',
        title: 'Average Property Prices by Room Count (AED)',
        data: [
          { label: '1 Room', value: 6800000, color: '#3498db', count: 45 },
          { label: '2 Rooms', value: 5200000, color: '#2ecc71', count: 128 },
          { label: '3 Rooms', value: 7633333, color: '#f39c12', count: 156 },
          { label: '4 Rooms', value: 7600000, color: '#e74c3c', count: 98 },
          { label: '5+ Rooms', value: 16375000, color: '#9b59b6', count: 60 }
        ]
      },
      insights: [
        {
          type: 'trend',
          title: 'Premium Property Performance',
          description: 'Premium properties show 115% price premium over standard properties, indicating strong luxury market demand.',
          confidence: 92,
          impact: 'high'
        },
        {
          type: 'market',
          title: 'Room Count Correlation',
          description: 'Properties with 5+ rooms command significantly higher prices, suggesting premium positioning.',
          confidence: 88,
          impact: 'medium'
        },
        {
          type: 'opportunity',
          title: 'Investment Potential',
          description: '2-room properties offer the best value proposition with lower per-room costs.',
          confidence: 85,
          impact: 'medium'
        }
      ],
      metadata: {
        processingTime: '2.3s',
        dataPoints: 487,
        model: 'ASI-1 mini',
        confidence: 89.5,
        marketSegment: 'Dubai Real Estate',
        apiKey: process.env.ASI1_MINI_API_KEY ? 'configured' : 'not configured'
      }
    };
    
    // Simulate processing time
    setTimeout(() => {
      res.json({
        status: 'success',
        result: analysisResult,
        timestamp: new Date().toISOString(),
        processingTime: '2.3s'
      });
    }, 2300);
    
  } catch (error) {
    console.error('Post-processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Self Protocol Attestation Service
app.post('/api/self/verify', async (req, res) => {
  try {
    console.log('🔒 Starting Self Protocol verification...');
    
    const { address, verificationType } = req.body;
    
    // Mock verification process
    setTimeout(() => {
      res.json({
        status: 'verified',
        address,
        verificationType,
        attestation: {
          did: 'did:self:' + (address?.slice(0, 10) || 'unknown'),
          verified: true,
          timestamp: new Date().toISOString(),
          proofType: 'zk-proof',
          metadata: {
            age: verificationType === 'age' ? 'verified' : 'not requested',
            residency: verificationType === 'residency' ? 'verified' : 'not requested',
            professional: verificationType === 'professional' ? 'verified' : 'not requested'
          }
        }
      });
    }, 1500);
    
  } catch (error) {
    console.error('Self verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get attestation status
app.get('/api/self/status/:address', (req, res) => {
  const { address } = req.params;
  
  // Mock attestation status
  res.json({
    address,
    attestations: {
      age: { verified: true, timestamp: new Date().toISOString() },
      residency: { verified: true, timestamp: new Date().toISOString() },
      professional: { verified: false, timestamp: null }
    },
    overall: {
      verified: true,
      score: 85,
      requirements: ['age', 'residency']
    }
  });
});

// Ocean Protocol dataset mock endpoint
app.get('/api/ocean/datasets', (req, res) => {
  res.json({
    datasets: [
      {
        id: 'dubai-real-estate-2024',
        name: 'Dubai Real Estate Properties Dataset',
        symbol: 'REDATA',
        description: 'Comprehensive dataset of Dubai real estate properties with pricing and features',
        records: 487,
        lastUpdated: '2024-01-15T00:00:00Z',
        price: 'Free C2D',
        computeSettings: {
          enabled: true,
          algorithm: 'average-price.py',
          maxDuration: 300
        }
      }
    ]
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🤖 AI Platform Services running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌊 Ocean Node: ${process.env.OCEAN_NODE_URL || 'http://localhost:8000'}`);
}); 