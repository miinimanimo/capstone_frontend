import React from 'react';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-title">캡스톤 프로젝트에 오신 것을 환영합니다</h1>
        <p className="home-subtitle">혁신적인 아이디어를 현실로 만드는 공간</p>
      </header>

      <main className="home-content">
        <div className="feature-card">
          <h2 className="feature-title">프로젝트 관리</h2>
          <p className="feature-description">
            효율적인 프로젝트 관리 도구로 팀원들과 협업하세요.
            실시간으로 진행 상황을 공유하고 업데이트할 수 있습니다.
          </p>
        </div>

        <div className="feature-card">
          <h2 className="feature-title">팀 협업</h2>
          <p className="feature-description">
            팀원들과 실시간으로 소통하고 협업할 수 있는 플랫폼을 제공합니다.
            아이디어를 공유하고 함께 발전시켜 나가세요.
          </p>
        </div>

        <div className="feature-card">
          <h2 className="feature-title">리소스 관리</h2>
          <p className="feature-description">
            프로젝트에 필요한 모든 리소스를 한 곳에서 관리하세요.
            문서, 코드, 미디어 파일을 효율적으로 정리할 수 있습니다.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Home; 