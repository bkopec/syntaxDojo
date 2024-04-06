import './App.css';

import { useState, useEffect } from "react";
import Cookies from 'universal-cookie';

import {
  BrowserRouter as Router,
} from 'react-router-dom'

import HomePage from './pages/Home';
import DojoPage from './pages/Dojo';


function App() {
  const [user, setUser] = useState({});
  const cookies = new Cookies();

  useEffect(() => {
    document.title = "Syntax Dojo"
 }, []);

  if (!user.hasOwnProperty('token') && cookies.get('jwt-token') != undefined)
    setUser({token: cookies.get('jwt-token'), login: cookies.get('login')});

  return (
    <Router>
      { user.hasOwnProperty('token') ? <DojoPage user={user} setUser={setUser} /> : <HomePage user={user} setUser={setUser} /> }
    </Router>
  );
}

export default App;