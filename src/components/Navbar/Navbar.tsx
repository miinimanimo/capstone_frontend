import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <h1>Diavision</h1>
        </Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/">홈</Link></li>
        <li><Link to="/analyze">분석하기</Link></li>
        <li><Link to="/register">환자 등록하기</Link></li>
        <li><Link to="/mypage">마이페이지</Link></li>
      </ul>
      <div className="navbar-auth">
        <button className="login-btn">로그인</button>
        <button className="signup-btn">회원가입</button>
      </div>
    </nav>
  );
};

export default Navbar; 