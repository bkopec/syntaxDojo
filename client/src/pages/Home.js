import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';

import config from '../config.js'
const backendUrl = config.backendUrl;


const HomePage = ({ user, setUser }) => {
  const [loginData, setLoginData] = useState({
    loginUsername: '',
    loginPassword: ''
  });

  const [registerData, setRegisterData] = useState({
    registerUsername: '',
    registerPassword: ''
  });

  const [loginErrors, setLoginErrors] = useState({});
  const [registerErrors, setRegisterErrors] = useState({});

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!loginData.loginUsername) {
      errors.loginUsername = 'Username is required';
    }
    if (!loginData.loginPassword) {
      errors.loginPassword = 'Password is required';
    }

    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      return;
    }

    try {
      const response = await axios.post(backendUrl + '/api/users/login', {
        username: loginData.loginUsername,
        password: loginData.loginPassword
      });

      setUser({ token: response.data.token, login: response.data.login });
      const cookies = new Cookies();
      cookies.set("jwt-token", response.data.token);
      cookies.set("login", response.data.login);

    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // Validate register form fields
    const errors = {};
    if (!registerData.registerUsername) {
      errors.registerUsername = 'Username is required';
    }
    if (!registerData.registerPassword) {
      errors.registerPassword = 'Password is required';
    }

    if (Object.keys(errors).length > 0) {
      setRegisterErrors(errors);
      return;
    }

    try {
      const response = await axios.post(backendUrl + '/api/users/register', {
        username: registerData.registerUsername,
        password: registerData.registerPassword
      });

      setUser({ token: response.data.token, login: response.data.login });
      const cookies = new Cookies();
      cookies.set("jwt-token", response.data.token);
      cookies.set("login", response.data.login);

    } catch (error) {
      console.error('Registration failed', error);
    }
  };

  return (
    <div className="loginRegisterPage" style={{ display: 'flex' }}>
      {/* Login Column */}
      <div style={{ flex: 1, padding: '20px' }}>
        <h2>Login</h2>
        <form onSubmit={handleLoginSubmit}>
          <label>
            Username:&nbsp;
            <input
              type="text"
              value={loginData.loginUsername}
              onChange={(e) => setLoginData({ ...loginData, loginUsername: e.target.value })}
            />
          </label>
          <br />
          {loginErrors.loginUsername && <p className="formError">{loginErrors.loginUsername}</p>}
          <label>
            Password:&nbsp;
            <input
              type="password"
              value={loginData.loginPassword}
              onChange={(e) => setLoginData({ ...loginData, loginPassword: e.target.value })}
            />
          </label>
          {loginErrors.loginPassword && <p className="formError">{loginErrors.loginPassword}</p>}
          <br />
          <button type="submit">Login</button>
        </form>
      </div>

      {/* Register Column */}
      <div style={{ flex: 1, padding: '20px' }}>
        <h2>Register</h2>
        <form onSubmit={handleRegisterSubmit}>
          <label>
            Username:&nbsp;
            <input
              type="text"
              value={registerData.registerUsername}
              onChange={(e) => setRegisterData({ ...registerData, registerUsername: e.target.value })}
            />
          </label>
          <br />
          {registerErrors.registerUsername && <p className="formError">{registerErrors.registerUsername}</p>}
          <label>
            Password:&nbsp;
            <input
              type="password"
              value={registerData.registerPassword}
              onChange={(e) => setRegisterData({ ...registerData, registerPassword: e.target.value })}
            />
          </label>
          {registerErrors.registerPassword && <p className="formError">{registerErrors.registerPassword}</p>}
          <br />
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
};

export default HomePage;