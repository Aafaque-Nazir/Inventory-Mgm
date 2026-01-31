/**
 * Simple Load Testing Script for Inventory Management System
 * 
 * Usage:
 * 1. Open terminal
 * 2. Run: node scripts/load-test.js
 * 
 * You might need to install node-fetch if your Node version is old:
 * npm install node-fetch
 */

const https = require('https');
const http = require('http');

// CONFIGURATION
const TARGET_URL = 'https://nvntory-mgm.vercel.app'; // <--- CHANGE THIS TO YOUR DEPLOYED URL
const CONCURRENT_USERS = 5;       // Number of simulated users at once
const TOTAL_REQUESTS = 20;        // Total requests to send across all users
const API_ENDPOINT = '/';         // Endpoint to test (Root page)

// Function to make a request
function makeRequest(id) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const protocol = TARGET_URL.startsWith('https') ? https : http;
        
        const req = protocol.get(`${TARGET_URL}${API_ENDPOINT}`, (res) => {
            let data = '';
            
            // Acknowledge data to flush buffer
            res.on('data', (chunk) => { data += chunk; });
            
            res.on('end', () => {
                const duration = Date.now() - startTime;
                resolve({ 
                    id, 
                    status: res.statusCode, 
                    duration, 
                    success: res.statusCode >= 200 && res.statusCode < 300 
                });
            });
        });

        req.on('error', (e) => {
            const duration = Date.now() - startTime;
            resolve({ 
                id, 
                status: 'ERROR', 
                duration, 
                success: false, 
                error: e.message 
            });
        });

        req.end();
    });
}

async function runLoadTest() {
    console.log(`🚀 Starting Load Test on ${TARGET_URL}...`);
    console.log(`👥 Virtual Users: ${CONCURRENT_USERS}`);
    console.log(`📨 Total Requests: ${TOTAL_REQUESTS}`);
    console.log('-----------------------------------');

    const results = [];
    let requestsSent = 0;

    // Batch processor
    const batchSize = CONCURRENT_USERS;
    
    while(requestsSent < TOTAL_REQUESTS) {
        const batch = [];
        const remaining = TOTAL_REQUESTS - requestsSent;
        const currentBatchSize = Math.min(remaining, batchSize);

        for(let i=0; i<currentBatchSize; i++) {
            batch.push(makeRequest(requestsSent + i + 1));
        }

        console.log(`\nProcessing batch of ${currentBatchSize} requests...`);
        const batchResults = await Promise.all(batch);
        results.push(...batchResults);
        requestsSent += currentBatchSize;
        
        // Slight delay between batches to be nice to the server (unless stress testing)
        // await new Promise(r => setTimeout(r, 500)); 
    }

    console.log('\n-----------------------------------');
    console.log('✅ Load Test Complete. Analyzing results...');

    // Analysis
    const totalDuration = results.reduce((acc, r) => acc + r.duration, 0);
    const avgLatency = (totalDuration / results.length).toFixed(2);
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;
    const maxLatency = Math.max(...results.map(r => r.duration));
    const minLatency = Math.min(...results.map(r => r.duration));

    // Status Code Breakdown
    const statusCounts = results.reduce((acc, r) => {
        const code = r.status;
        acc[code] = (acc[code] || 0) + 1;
        return acc;
    }, {});

    console.log('📊 RESULTS:');
    console.log(`- Total Requests : ${results.length}`);
    console.log(`- Success Rate   : ${((successCount/results.length)*100).toFixed(1)}%`);
    console.log(`- Status Codes   : ${JSON.stringify(statusCounts)}`); // Added breakdown
    console.log(`- Avg Latency    : ${avgLatency} ms`);
    console.log(`- Min Latency    : ${minLatency} ms`);
    console.log(`- Max Latency    : ${maxLatency} ms`);

    if (avgLatency > 1000) {
        console.warn('\n⚠️ WARNING: Average latency is high (>1s). The site might be struggling.');
    }
    if (errorCount > 0) {
        console.warn('\n⚠️ WARNING: Some requests failed. Check server logs.');
    }
}

// Run the test
runLoadTest();
