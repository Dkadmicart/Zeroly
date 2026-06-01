import axios from 'axios';

async function test() {
  try {
    const loginRes = await axios.post('http://localhost:5001/api/users/login', {
      email: 'zerolyadmin@gmail.com',
      password: 'zeroly123'
    });
    const token = loginRes.data.token;
    console.log("Logged in successfully. Token:", token.substring(0, 20) + "...");
    
    try {
      const myChatsRes = await axios.get('http://localhost:5001/api/chat/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Chats:", myChatsRes.data);
    } catch (err) {
      console.error("Error fetching chats:", err.response ? err.response.status : err.message);
    }
  } catch (err) {
    console.error("Login failed:", err.response ? err.response.data : err.message);
  }
}

test();
