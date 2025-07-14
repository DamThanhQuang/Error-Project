import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    passwordHash: '',
    fullName: '',
    department: '',
    role: 'Employee'
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    const result = await register(userData);
    
    if (result.success) {
      setMessage('Registration successful! You can now login.');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setMessage(result.message);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={userData.username}
          onChange={(e) => setUserData({...userData, username: e.target.value})}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={userData.email}
          onChange={(e) => setUserData({...userData, email: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="Full Name"
          value={userData.fullName}
          onChange={(e) => setUserData({...userData, fullName: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="Department"
          value={userData.department}
          onChange={(e) => setUserData({...userData, department: e.target.value})}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={userData.passwordHash}
          onChange={(e) => setUserData({...userData, passwordHash: e.target.value})}
          required
        />
        <select
          value={userData.role}
          onChange={(e) => setUserData({...userData, role: e.target.value})}
        >
          <option value="Employee">Employee</option>
          <option value="Manager">Manager</option>
          <option value="Admin">Admin</option>
        </select>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {message && (
        <p className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
          {message}
        </p>
      )}
      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default Register;