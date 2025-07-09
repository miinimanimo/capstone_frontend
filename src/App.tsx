import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login/Login';
import PatientRegistration from './pages/PatientRegistration/PatientRegistration';
import MyPage from './pages/MyPage/MyPage';
import Home from './pages/Home/Home';
import Analysis from './pages/Analysis/Analysis';
import Navbar from './components/Navbar/Navbar';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="content-wrapper">
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/login" element={<Login />} />
            <Route path="/patient-registration" element={<PatientRegistration />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
