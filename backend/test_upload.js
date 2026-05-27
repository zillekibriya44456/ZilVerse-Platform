const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testUpload() {
  try {
    const form = new FormData();
    form.append('video', fs.createReadStream('package.json'));
    form.append('title', 'Test');
    form.append('description', 'Test desc');
    
    console.log('Sending request...');
    const res = await axios.post('http://localhost:5002/api/reels/upload', form, {
      headers: form.getHeaders()
    });
    console.log('Success:', res.data);
  } catch (err) {
    if (err.response) {
      console.log('Error Response:', err.response.data);
    } else {
      console.log('Error Message:', err.message);
    }
  }
}
testUpload();
