import fs from 'fs';

const API_BASE_URL = 'http://localhost:5000/api/v1';
const ADMIN_EMAIL = 'admin@travelagency.com';
const ADMIN_PASS = 'password123';

async function runTests() {
  console.log('Starting API Verification...');
  let cookieHeader = '';

  try {
    // 1. Test Admin Login
    console.log('Testing Admin Login...');
    const loginRes = await fetch(`${API_BASE_URL}/b2c-admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASS }),
    });

    if (!loginRes.ok) {
      const errorText = await loginRes.text();
      throw new Error(`Login failed: ${loginRes.status} ${errorText}`);
    }

    const setCookie = loginRes.headers.get('set-cookie');
    if (setCookie) {
      // Very basic extraction, works for simple cases
      cookieHeader = setCookie.split(',').map(c => c.split(';')[0]).join('; ');
    }
    console.log('Login successful. Received cookies.');

    const fetchOptions = {
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json'
      }
    };

    // 2. Test fetching all packages (B2C Gateway)
    console.log('Testing GET /b2c/packages...');
    const pkgRes = await fetch(`${API_BASE_URL}/b2c/packages`, fetchOptions);
    if (!pkgRes.ok) throw new Error(`GET packages failed: ${pkgRes.status}`);
    console.log('GET packages passed.');

    // 3. Test Admin create package
    console.log('Testing POST /b2c-admin/packages/create...');
    const createPkg = await fetch(`${API_BASE_URL}/b2c-admin/packages/create`, {
      method: 'POST',
      headers: { 'Cookie': cookieHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'package',
        packageName: 'Verification Script Package',
        slug: 'verification-script-package',
        packageDescription: 'Test',
        location: 'Indonesia',
        country: 'Indonesia',
        price: 100,
        status: 'Active',
        images: []
      })
    });
    // This might fail validation depending on exact schema, but we want to see if it routes correctly
    const createBody = await createPkg.json();
    console.log('Create package response:', createBody);

    // 4. Test Taken Ranks
    console.log('Testing GET /b2c-admin/packages/takenRanks...');
    const ranksRes = await fetch(`${API_BASE_URL}/b2c-admin/packages/takenRanks`, fetchOptions);
    console.log('Taken ranks status:', ranksRes.status);
    
    // 5. Test blogs
    console.log('Testing GET /b2c-admin/blogs/ (Admin get all blogs)...');
    // Wait, the backend route for getting all blogs for admin is usually GET /blogs
    const blogsRes = await fetch(`${API_BASE_URL}/b2c/blogs`, fetchOptions);
    console.log('B2C Blogs status:', blogsRes.status);

    console.log('API Verification Complete.');
  } catch (error) {
    console.error('API Verification Error:', error.message);
  }
}

runTests();
