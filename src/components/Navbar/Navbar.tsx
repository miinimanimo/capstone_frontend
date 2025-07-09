import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/home">
          <h1>
            <span className="logo-gradient">Diavision</span>
          </h1>
        </Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/home">홈</Link></li>
        <li><Link to="/analysis">분석하기</Link></li>
        <li><Link to="/patient-registration">환자 등록하기</Link></li>
        <li><Link to="/mypage">마이페이지</Link></li>
      </ul>
      <div className="navbar-auth">
        <Link to="/login" className="login-link">로그인</Link>
      </div>
    </nav>
  );
};

export default Navbar; 