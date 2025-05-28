import React, { useState } from 'react';
import './MyPage.css';

const MyPage: React.FC = () => {
  const [userData, setUserData] = useState({
    displayName: '홍길동',
    email: 'user@example.com'
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    // 프로필 업데이트 로직
    setSuccess('프로필이 성공적으로 업데이트되었습니다.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    // 비밀번호 업데이트 로직
    setSuccess('비밀번호가 성공적으로 변경되었습니다.');
    setError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="mypage-container">
      <div className="mypage-box">
        <h2>마이 페이지</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        
        <div className="profile-section">
          <h3>프로필 정보</h3>
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label htmlFor="displayName">이름</label>
              <input
                type="text"
                id="displayName"
                value={userData.displayName}
                onChange={(e) => setUserData({...userData, displayName: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">이메일</label>
              <input
                type="email"
                id="email"
                value={userData.email}
                disabled
              />
            </div>
            <button type="submit" className="submit-button">프로필 업데이트</button>
          </form>
        </div>

        <div className="password-section">
          <h3>비밀번호 변경</h3>
          <form onSubmit={handlePasswordUpdate}>
            <div className="form-group">
              <label htmlFor="currentPassword">현재 비밀번호</label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">새 비밀번호</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">새 비밀번호 확인</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="submit-button">비밀번호 변경</button>
          </form>
        </div>

        <div className="stats-section">
          <h3>통계</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <h4>등록된 환자</h4>
              <p>0명</p>
            </div>
            <div className="stat-item">
              <h4>이번 달 분석</h4>
              <p>0건</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage; 