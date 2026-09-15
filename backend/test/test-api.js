const http = require('http');

// Simple helper to send HTTP requests to the backend server
function apiRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: process.env.PORT || 3000,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        },
      },
      (res) => {
        let chunks = '';
        res.on('data', (d) => (chunks += d));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(chunks) });
          } catch (e) {
            resolve({ status: res.statusCode, data: chunks });
          }
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING JOB QUEUE API TESTS ---');

  try {
    // 1. Initial GET
    console.log('\n1. Fetching all jobs...');
    const initialGet = await apiRequest('GET', '/jobs');
    console.log(`Status: ${initialGet.status}, Jobs Count: ${initialGet.data.length}`);

    // 2. Validation Test
    console.log('\n2. Testing validation with empty title...');
    const invalidCreate = await apiRequest('POST', '/jobs', { title: '', type: 'email' });
    console.log(`Status: ${invalidCreate.status} (Expected: 400 Bad Request)`);
    console.log('Error message:', invalidCreate.data.message);

    // 3. Create Valid Job
    console.log('\n3. Creating valid job...');
    const created = await apiRequest('POST', '/jobs', {
      title: 'Generate Annual Financial Report',
      type: 'report',
    });
    console.log(`Status: ${created.status}, Created ID: ${created.data.id}, Status: ${created.data.status}`);
    const jobId = created.data.id;

    // 4. Valid Transition: pending -> running
    console.log('\n4. Transitioning job: pending -> running...');
    const toRunning = await apiRequest('PATCH', `/jobs/${jobId}/status`, { status: 'running' });
    console.log(`Status: ${toRunning.status}, New Status: ${toRunning.data.status}`);

    // 5. Invalid Transition: running -> pending
    console.log('\n5. Attempting invalid transition: running -> pending...');
    const invalidPending = await apiRequest('PATCH', `/jobs/${jobId}/status`, { status: 'pending' });
    console.log(`Status: ${invalidPending.status} (Expected: 400 Bad Request)`);
    console.log('Error message:', invalidPending.data.message);

    // 6. Concurrency Test: Simulate two concurrent requests trying to run a pending job at the exact same moment
    console.log('\n6. Concurrency Test: Simulating race condition on pending job...');
    const jobForRace = await apiRequest('POST', '/jobs', { title: 'Concurrent Race Job', type: 'backup' });
    const raceId = jobForRace.data.id;

    const [race1, race2] = await Promise.all([
      apiRequest('PATCH', `/jobs/${raceId}/status`, { status: 'running' }),
      apiRequest('PATCH', `/jobs/${raceId}/status`, { status: 'running' }),
    ]);

    console.log(`Concurrent Request 1: HTTP ${race1.status}`);
    console.log(`Concurrent Request 2: HTTP ${race2.status}`);

    if (race1.status === 200 && (race2.status === 409 || race2.status === 400)) {
      console.log('SUCCESS: Concurrency race condition correctly handled! One succeeded, second was rejected.');
    }

    await apiRequest('DELETE', `/jobs/${raceId}`);

    // 7. Cleanup
    console.log('\n7. Cleaning up test job...');
    const deleted = await apiRequest('DELETE', `/jobs/${jobId}`);
    console.log(`Status: ${deleted.status}, Message: ${deleted.data.message}`);

    console.log('\n--- ALL API TESTS COMPLETED ---');
  } catch (err) {
    console.error('Test execution error (is backend running?):', err.message);
  }
}

runTests();
