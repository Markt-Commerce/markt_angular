#!/usr/bin/env node

const https = require('https');
const http = require('http');

const API_BASE_URL = 'https://test.api.marktcommerce.com/api/v1';

// Test endpoints
const endpoints = [
  { name: 'Auth - Health Check', path: '/auth/health', method: 'GET' },
  { name: 'Products - List', path: '/products', method: 'GET' },
  { name: 'Categories - List', path: '/categories', method: 'GET' },
  { name: 'Social Posts', path: '/socials/posts', method: 'GET' },
  { name: 'Cart', path: '/cart', method: 'GET' },
  { name: 'Orders', path: '/orders', method: 'GET' },
  { name: 'Payments', path: '/payments', method: 'GET' },
  { name: 'Requests', path: '/requests', method: 'GET' },
  { name: 'Search', path: '/search', method: 'GET' }
];

console.log('🔌 MARKT API CONNECTIVITY TEST');
console.log('================================');
console.log(`Testing API at: ${API_BASE_URL}`);
console.log('');

async function testEndpoint(endpoint) {
  const url = `${API_BASE_URL}${endpoint.path}`;
  const urlObj = new URL(url);
  
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + (urlObj.search || ''),
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Markt-API-Test/1.0'
      },
      timeout: 10000
    };

    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(options, (res) => {
      const duration = Date.now() - startTime;
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        let parsedData;
        try {
          parsedData = JSON.parse(data);
        } catch (e) {
          parsedData = data;
        }
        
        resolve({
          success: res.statusCode >= 200 && res.statusCode < 400,
          status: res.statusCode,
          statusText: res.statusMessage,
          duration,
          data: parsedData,
          headers: res.headers
        });
      });
    });

    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      resolve({
        success: false,
        error: error.message,
        duration
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const duration = Date.now() - startTime;
      resolve({
        success: false,
        error: 'Timeout after 10 seconds',
        duration
      });
    });

    req.end();
  });
}

async function runTests() {
  const results = [];
  
  for (const endpoint of endpoints) {
    process.stdout.write(`Testing ${endpoint.name}... `);
    
    const result = await testEndpoint(endpoint);
    results.push({ endpoint, result });
    
    if (result.success) {
      console.log(`✅ ${result.status} (${result.duration}ms)`);
    } else {
      console.log(`❌ ${result.error || result.status} (${result.duration}ms)`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('');
  console.log('📊 SUMMARY');
  console.log('===========');
  
  const successful = results.filter(r => r.result.success).length;
  const total = results.length;
  const averageTime = results.reduce((sum, r) => sum + r.result.duration, 0) / results.length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${total - successful}`);
  console.log(`Success Rate: ${((successful / total) * 100).toFixed(1)}%`);
  console.log(`Average Response Time: ${Math.round(averageTime)}ms`);
  
  if (successful === 0) {
    console.log('');
    console.log('🚨 ALL TESTS FAILED');
    console.log('This likely means:');
    console.log('1. The API server is not running');
    console.log('2. The API URL is incorrect');
    console.log('3. There are network connectivity issues');
    console.log('4. CORS is blocking requests');
  } else if (successful < total) {
    console.log('');
    console.log('⚠️  SOME TESTS FAILED');
    console.log('Failed endpoints may require authentication or have different URLs');
  } else {
    console.log('');
    console.log('🎉 ALL TESTS PASSED!');
    console.log('The API appears to be healthy and accessible');
  }
  
  console.log('');
  console.log('💡 NEXT STEPS:');
  console.log('1. Launch the Angular app: npm start');
  console.log('2. Navigate to /app/api-test for detailed testing');
  console.log('3. Test authentication flow with real credentials');
  
  // Detailed results for debugging
  if (process.argv.includes('--verbose')) {
    console.log('');
    console.log('🔍 DETAILED RESULTS');
    console.log('===================');
    
    results.forEach(({ endpoint, result }) => {
      console.log(`\n${endpoint.name} (${endpoint.method} ${endpoint.path}):`);
      if (result.success) {
        console.log(`  Status: ${result.status} ${result.statusText}`);
        console.log(`  Duration: ${result.duration}ms`);
        if (result.headers['content-type']) {
          console.log(`  Content-Type: ${result.headers['content-type']}`);
        }
        if (typeof result.data === 'object' && result.data !== null) {
          console.log(`  Response: ${JSON.stringify(result.data, null, 2).slice(0, 200)}...`);
        }
      } else {
        console.log(`  Error: ${result.error}`);
        console.log(`  Duration: ${result.duration}ms`);
      }
    });
  }
}

// Run the tests
runTests().catch(console.error); 