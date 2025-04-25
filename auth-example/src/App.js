import { useState } from 'react';
import './App.css';

function App() {
  const [view, setView] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [greeting, setGreeting] = useState('');
  const SERVER_URL = "https://appdev-example.onrender.com";

  const handleLogin = async () => {
    const res = await fetch(`${SERVER_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (res.ok) {
      setAuthToken(data.token);
      fetchName(data.token);
    } else {
      alert(data.error);
    }
  };

  const handleRegister = async () => {
    const res = await fetch(`${SERVER_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, name }),
    });

    const data = await res.json();
    if (res.ok) {
      alert('User created! Now log in.');
      setView('login');
    } else {
      alert(data.error);
    }
  };

  const fetchName = async (token) => {
    console.log("AUTH TOKEN", token);
    const res = await fetch(`${SERVER_URL}/get_name`, {
      headers: { Authorization: token },
    });

    const data = await res.json();
    if (res.ok) {
      setGreeting(`Hello ${data.name}!`);
    } else {
      alert(data.error);
    }
  };

  if (greeting) {
    return <h1>{greeting}</h1>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h2>{view === 'login' ? 'Login' : 'Create Account'}</h2>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {view === 'register' && (
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <button onClick={view === 'login' ? handleLogin : handleRegister}>
          {view === 'login' ? 'Login' : 'Register'}
        </button>
        <p onClick={() => setView(view === 'login' ? 'register' : 'login')} style={{ cursor: 'pointer', marginTop: '1rem' }}>
          {view === 'login' ? 'Create account' : 'Already have an account? Log in'}
        </p>
      </header>
    </div>
  );
}

export default App;
