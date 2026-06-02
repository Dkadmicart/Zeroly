import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('http://localhost:5001/api/users/forgot-password', {
      email: 'test@example.com'
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}

test();
