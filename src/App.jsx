import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import UserProfile from './pages/UserProfile';
import AuthSuccess from './pages/AuthSuccess';
import Callback from './pages/CallbackHandler';
import Login from './pages/LoginPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        {/* <Route path="/auth-success" element={<AuthSuccess />} /> */}
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/callback" element={<Callback />} />
            </Routes>
    </Router>
  );
};

export default App;
