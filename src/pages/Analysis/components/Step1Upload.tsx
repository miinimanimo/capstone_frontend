import React, { useEffect, useState } from 'react';
import '../Analysis.css';
import PatientIcon from '../../../components/icons/patient-icon.svg';

interface Step1UploadProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  selectedPatient: { name: string; code: string } | null;
  handleSearch: () => void;
  leftEyeImage: string | null;
  rightEyeImage: string | null;
  leftEyeInputRef: React.RefObject<HTMLInputElement>;
  rightEyeInputRef: React.RefObject<HTMLInputElement>;
  setIsHoveringLeftEyeDropzone: (v: boolean) => void;
  setIsHoveringRightEyeDropzone: (v: boolean) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, eye: 'left' | 'right') => void;
  onAnalyze: () => void;
  removeLeftEyeImage: () => void;
  removeRightEyeImage: () => void;
}

// 검색/AI 아이콘 컴포넌트 추가
const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{marginRight:8, verticalAlign:'middle'}} xmlns="http://www.w3.org/2000/svg">
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99a1 1 0 0 0 1.41-1.41l-4.99-5zm-6 0C8.01 14 6 11.99 6 9.5S8.01 5 10.5 5 15 7.01 15 9.5 12.99 14 10.5 14z" fill="#fff"/>
  </svg>
);
const AIIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{marginRight:8, verticalAlign:'middle'}} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2" fill="none"/>
    <path d="M8 15h1v-4H8v4zm3 0h1v-6h-1v6zm3 0h1v-2h-1v2z" fill="#fff"/>
  </svg>
);

const Step1Upload: React.FC<Step1UploadProps> = ({
  searchQuery,
  setSearchQuery,
  selectedPatient,
  handleSearch,
  leftEyeImage,
  rightEyeImage,
  leftEyeInputRef,
  rightEyeInputRef,
  setIsHoveringLeftEyeDropzone,
  setIsHoveringRightEyeDropzone,
  handleImageUpload,
  onAnalyze,
  removeLeftEyeImage,
  removeRightEyeImage,
}) => {
  // hover 상태 관리
  const [isHoveringLeft, setIsHoveringLeft] = useState(false);
  const [isHoveringRight, setIsHoveringRight] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Backspace' || e.key === 'Delete')) {
        if (isHoveringLeft && leftEyeImage) {
          removeLeftEyeImage();
        }
        if (isHoveringRight && rightEyeImage) {
          removeRightEyeImage();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHoveringLeft, isHoveringRight, leftEyeImage, rightEyeImage, removeLeftEyeImage, removeRightEyeImage]);

  return (
    <div className="step-content">
      <div className="patient-info-header">
        {!selectedPatient ? <h2>환자 검색하기</h2> : null}
        {!selectedPatient && (
          <div className="search-container">
            <div className="search-icon">
              <img src={PatientIcon} alt="환자 아이콘" />
            </div>
            <input
              type="text"
              placeholder="환자 성명 or 환자 코드"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-button" onClick={handleSearch}><SearchIcon />검색하기</button>
          </div>
        )}
      </div>
      {selectedPatient && (
        <div className="selected-patient-info">
          <div className="info-card">
            <div className="info-icon">
              <img src={PatientIcon} alt="환자 아이콘" />
            </div>
            <div className="info-text">
              <span className="date">2025년 2월 3일</span>
              <span className="divider">|</span>
              <span className="patient-name">환자 성명: {selectedPatient.name}</span>
              <span className="divider">|</span>
              <span className="patient-code">환자 코드: {selectedPatient.code}</span>
            </div>
          </div>
          <div className="upload-section">
            <div className="upload-container">
              <span className="upload-label">왼쪽 안저 사진</span>
              <div
                className="upload-box"
                onClick={() => leftEyeInputRef.current?.click()}
                onMouseEnter={() => { setIsHoveringLeftEyeDropzone(true); setIsHoveringLeft(true); }}
                onMouseLeave={() => { setIsHoveringLeftEyeDropzone(false); setIsHoveringLeft(false); }}
                aria-label="왼쪽 안저 사진 업로드 박스"
              >
                {leftEyeImage ? (
                  <img src={leftEyeImage} alt="왼쪽 안저 사진" />
                ) : (
                  <div className="upload-placeholder"><span>클릭하거나 붙여넣어 사진 업로드</span></div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'left')}
                style={{ display: 'none' }}
                ref={leftEyeInputRef}
              />
            </div>
            <div className="upload-container">
              <span className="upload-label">오른쪽 안저 사진</span>
              <div
                className="upload-box"
                onClick={() => rightEyeInputRef.current?.click()}
                onMouseEnter={() => { setIsHoveringRightEyeDropzone(true); setIsHoveringRight(true); }}
                onMouseLeave={() => { setIsHoveringRightEyeDropzone(false); setIsHoveringRight(false); }}
                aria-label="오른쪽 안저 사진 업로드 박스"
              >
                {rightEyeImage ? (
                  <img src={rightEyeImage} alt="오른쪽 안저 사진" />
                ) : (
                  <div className="upload-placeholder"><span>클릭하거나 붙여넣어 사진 업로드</span></div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'right')}
                style={{ display: 'none' }}
                ref={rightEyeInputRef}
              />
            </div>
          </div>
          <button
            className="analyze-button"
            onClick={onAnalyze}
            disabled={!leftEyeImage && !rightEyeImage}
          >
            <AIIcon />AI 분석하기
          </button>
        </div>
      )}
    </div>
  );
};

export default Step1Upload; 