import React from 'react';
import '../Analysis.css';

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
}

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
}) => {
  return (
    <div className="step-content">
      <div className="patient-info-header">
        {!selectedPatient ? <h2>환자 검색하기</h2> : null}
        {!selectedPatient && (
          <div className="search-container">
            <div className="search-icon">
              {/* ...SVG 생략... */}
            </div>
            <input
              type="text"
              placeholder="환자 성명 or 환자 코드"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-button" onClick={handleSearch}>검색하기</button>
          </div>
        )}
      </div>
      {selectedPatient && (
        <div className="selected-patient-info">
          <div className="info-card">
            <div className="info-icon">{/* ...SVG 생략... */}</div>
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
                onMouseEnter={() => setIsHoveringLeftEyeDropzone(true)}
                onMouseLeave={() => setIsHoveringLeftEyeDropzone(false)}
              >
                {leftEyeImage ? (
                  <img src={leftEyeImage} alt="왼쪽 안저 사진" />
                ) : (
                  <div className="upload-placeholder">{/* ...SVG 생략... */}<span>클릭하거나 붙여넣어 사진 업로드</span></div>
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
                onMouseEnter={() => setIsHoveringRightEyeDropzone(true)}
                onMouseLeave={() => setIsHoveringRightEyeDropzone(false)}
              >
                {rightEyeImage ? (
                  <img src={rightEyeImage} alt="오른쪽 안저 사진" />
                ) : (
                  <div className="upload-placeholder">{/* ...SVG 생략... */}<span>클릭하거나 붙여넣어 사진 업로드</span></div>
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
            disabled={!leftEyeImage || !rightEyeImage}
          >
            {/* ...SVG 생략... */}
            AI 분석하기
          </button>
        </div>
      )}
    </div>
  );
};

export default Step1Upload; 