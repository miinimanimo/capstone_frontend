import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <nav className="home-nav">
        <div className="nav-logo">보고</div>
        <div className="nav-links">
          <a href="#" className="nav-link">진단하기</a>
          <a href="#" className="nav-link">통계/분석</a>
        </div>
        <div className="nav-buttons">
          <button className="nav-button sign-up">회원가입</button>
        </div>
      </nav>

      <main className="home-main">
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              AI로 더 정확한
              <span className="hero-subtitle">안구질환 진단</span>
            </h1>
            <p className="hero-description">
              인공지능 기술을 활용한 정확하고 신속한 안구질환 진단 서비스를 제공합니다.
              <br />전문의의 검수를 거친 신뢰할 수 있는 결과를 경험하세요.
            </p>
            <div className="hero-buttons">
              <button className="primary-button" onClick={() => navigate('/analysis')}>진단하기</button>
              <button className="secondary-button">서비스 소개</button>
            </div>
            <p className="membership-text">
              처음 방문하셨나요? <a href="#" className="sign-up-link">회원가입하기</a>
            </p>
          </div>
          <div className="hero-image">
            <img src="/eye-exam.png" alt="Eye examination" />
          </div>
        </div>

        <section className="services-section">
          <h2 className="section-title">주요 서비스</h2>
          <p className="section-subtitle">AI 기술을 활용한 정확한 안구질환 진단 서비스를 제공합니다</p>
          
          <div className="service-cards">
            <div className="service-card">
              <div className="service-icon ai-icon"></div>
              <h3>AI 진단</h3>
              <p>인공지능 기반의 정확한 안구질환 진단</p>
            </div>
            <div className="service-card active">
              <div className="service-icon review-icon"></div>
              <h3>전문의 검수</h3>
              <p>전문의의 검수를 통한 신뢰성 확보</p>
            </div>
            <div className="service-card">
              <div className="service-icon analysis-icon"></div>
              <h3>통계 분석</h3>
              <p>진단 결과에 대한 상세한 통계 분석</p>
            </div>
            <div className="service-card">
              <div className="service-icon history-icon"></div>
              <h3>이력 관리</h3>
              <p>환자별 진단 이력 체계적 관리</p>
            </div>
          </div>
        </section>

        <section className="process-section">
          <h2 className="section-title">진단 과정</h2>
          <p className="section-subtitle">3단계의 간단한 과정으로 정확한 진단 결과를 받아보세요</p>
          
          <div className="process-cards">
            <div className="process-card">
              <div className="process-number">1</div>
              <h3>이미지 업로드</h3>
              <p>안구 이미지를 업로드합니다</p>
            </div>
            <div className="process-card">
              <div className="process-number">2</div>
              <h3>AI 분석</h3>
              <p>AI가 이미지를 분석합니다</p>
            </div>
            <div className="process-card">
              <div className="process-number">3</div>
              <h3>결과 확인</h3>
              <p>상세한 분석 결과를 확인합니다</p>
            </div>
          </div>
          <button className="primary-button" onClick={() => navigate('/analysis')}>지금 시작하기</button>
        </section>

        <section className="stats-section">
          <h2 className="section-title">진단 통계</h2>
          <p className="section-subtitle">신뢰할 수 있는 진단 결과를 제공합니다</p>
          
          <div className="stat-cards">
            <div className="stat-card">
              <div className="stat-number">98%</div>
              <p>진단 정확도</p>
            </div>
            <div className="stat-card">
              <div className="stat-number">1,000+</div>
              <p>월간 진단 건수</p>
            </div>
            <div className="stat-card">
              <div className="stat-number">10+</div>
              <p>진단 가능 질환</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home; 