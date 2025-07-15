// Test script to verify login endpoints
async function testLoginEndpoints() {
  const baseUrl = 'http://localhost:3000'
  
  // Test 1: Traditional login with admin user
  console.log('Testing traditional login...')
  try {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@villagesacco.com',
        password: 'admin123'
      })
    })
    
    const data = await response.json()
    console.log('Traditional login response:', response.status, data)
  } catch (error) {
    console.error('Traditional login error:', error)
  }
  
  // Test 2: Check if wallet endpoint is being called incorrectly
  console.log('\nTesting wallet login endpoint with invalid data...')
  try {
    const response = await fetch(`${baseUrl}/api/auth/login-wallet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@villagesacco.com',
        password: 'admin123'
      })
    })
    
    const data = await response.json()
    console.log('Wallet endpoint with email/password:', response.status, data)
  } catch (error) {
    console.error('Wallet endpoint error:', error)
  }
}

// Run in browser console
console.log('Copy and paste this function in browser console, then call testLoginEndpoints()')
console.log(testLoginEndpoints.toString())
