import './App.css';

import { useState } from "react";
import Cookies from 'universal-cookie';

import {
  BrowserRouter as Router,
  Routes, Route, Link,
  useMatch, useParams,
  createSearchParams, useNavigate, useLocation
} from 'react-router-dom'

import HomePage from './pages/Home';
import DojoPage from './pages/Dojo';

//axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
//axios.defaults.headers.get['Access-Control-Allow-Origin'] = '*';

//axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';


const backendUrl = "http://localhost:3001";



function App() {
  const [user, setUser] = useState({});
  const cookies = new Cookies();

  if (!user.hasOwnProperty('token') && cookies.get('jwt-token') != undefined)
    setUser({token: cookies.get('jwt-token'), login: cookies.get('login')});

  return (
    <Router>
      { user.hasOwnProperty('token') ? <DojoPage user={user} setUser={setUser} /> : <HomePage user={user} setUser={setUser} /> }
    </Router>
  );
}

export default App;