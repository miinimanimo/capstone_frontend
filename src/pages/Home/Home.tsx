import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  // 각 섹션 ref 생성
  const servicesRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = [servicesRef.current, processRef.current, statsRef.current];
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show');
          }
        });
      },
      { threshold: 0.2 }
    );
    sections.forEach(sec => sec && observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-container">
      <nav className="home-nav">
        <a className="nav-logo" href="/">보고</a>
        <div className="nav-links">
          <a href="#" className="nav-link">진단하기</a>
          <a href="#" className="nav-link">통계/분석</a>
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
              AI로 쉽고 빠르게 안구질환을 진단하세요.<br />
              전문의가 검수한 신뢰할 수 있는 결과를 제공합니다.
            </p>
            <div className="hero-buttons same-size-buttons">
              <button className="primary-button" onClick={() => navigate('/analysis')}>진단하기</button>
              <button className="secondary-button">서비스 소개</button>
            </div>
            {/* 회원가입 안내 문구 삭제 */}
          </div>
          <div className="hero-image">
            <img src="/eye-exam.png" alt="Eye examination" />
          </div>
        </div>

        <section className="services-section hidden" ref={servicesRef}>
          <h2 className="section-title">주요 서비스</h2>
          <p className="section-subtitle">AI 기술을 활용한 정확한 안구질환 진단 서비스를 제공합니다</p>
          
          <div className="service-cards">
            <div className="service-card">
              <div className="service-icon ai-icon"></div>
              <h3>AI 진단</h3>
              <p>인공지능 기반의 정확한 안구질환 진단</p>
            </div>
            <div className="service-card">
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

        <section className="process-section hidden" ref={processRef}>
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

        <section className="stats-section hidden" ref={statsRef}>
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