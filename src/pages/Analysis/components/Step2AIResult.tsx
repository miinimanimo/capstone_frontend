import React from 'react';
import '../Analysis.css';
import PatientIcon from '../../../components/icons/patient-icon.svg';

interface Step2AIResultProps {
  selectedEye: 'left' | 'right';
  allSelected: boolean;
  handleSelectAll: () => void;
  lesionList: { id: string; name: string; status: string }[];
  selectedLesions: string[];
  handleLesionSelect: (id: string) => void;
  eyeStatus: any;
  handlePrev: () => void;
  handleEyeConfirm: (step: number, eye: 'left' | 'right') => void;
  handleNext: () => void;
  leftEyeImage: string | null;
  rightEyeImage: string | null;
  imageSize: number;
  imagePosition: { x: number; y: number };
  handleImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

const Step2AIResult: React.FC<Step2AIResultProps> = ({
  selectedEye,
  allSelected,
  handleSelectAll,
  lesionList,
  selectedLesions,
  handleLesionSelect,
  eyeStatus,
  handlePrev,
  handleEyeConfirm,
  handleNext,
  leftEyeImage,
  rightEyeImage,
  imageSize,
  imagePosition,
  handleImageLoad,
}) => {
  const step2Confirmed = eyeStatus.step2.left && eyeStatus.step2.right;
  return (
    <div className="step-content step-2">
      <div className="patient-info-header">
        <div className="info-group">
          <div className="info-icon"><img src={PatientIcon} alt="환자 아이콘" /></div>
          <div className="info-text">
            <span className="date">2025년 2월 3일</span>
            <span className="divider">|</span>
            <span className="patient-name">환자 성명: 장석민</span>
            <span className="divider">|</span>
            <span className="patient-code">환자 코드: jg0103</span>
          </div>
        </div>
        <div className="step-buttons">
          <button className="step-button prev" onClick={handlePrev}>이전 단계</button>
          <div className="eye-confirm-buttons">
            <button className={`eye-button ${eyeStatus.step2.left ? 'confirmed' : ''}`} onClick={() => handleEyeConfirm(2, 'left')}>좌안 확인</button>
            <button className={`eye-button ${eyeStatus.step2.right ? 'confirmed' : ''}`} onClick={() => handleEyeConfirm(2, 'right')}>우안 확인</button>
          </div>
          <button className={`step-button next ${!step2Confirmed ? 'disabled' : ''}`} onClick={handleNext} disabled={!step2Confirmed}>다음 단계</button>
        </div>
      </div>
      <div className="diagnosis-container">
        <div className="combined-diagnosis-container">
          <div className="diagnosis-section">
            <div className="severity-section">
              <h3>{selectedEye === 'left' ? '좌안' : '우안'} 중증도 AI 진단</h3>
              <div className="severity-list">
                <div className="severity-header">
                  <span>중증도</span>
                  <span>신뢰도</span>
                </div>
                <div className="severity-item"><div className="severity-label">비증식성 당뇨망막병증(NPDR) - Mild</div><div className="severity-value">78%</div></div>
                <div className="severity-item"><div className="severity-label">비증식성 당뇨망막병증(NPDR) - Moderate</div><div className="severity-value">12%</div></div>
                <div className="severity-item"><div className="severity-label">비증식성 당뇨망막병증(NPDR) - Severe</div><div className="severity-value">6%</div></div>
                <div className="severity-item"><div className="severity-label">증식성 당뇨망막병증(PDR)</div><div className="severity-value">6%</div></div>
              </div>
            </div>
            <div className="interest-region-section">
              <h3>Interest Region</h3>
              <img src="https://miinimanimo.github.io/capstone_frontend/images/ig.jpeg" alt="Interest Region" />
            </div>
          </div>
        </div>
        <div className="detection-container">
          <div className="detection-section">
            <div className="detection-header-container">
              <h3>{selectedEye === 'left' ? '좌안' : '우안'} AI 포착 병변</h3>
              <button className={`select-all-button ${allSelected ? 'selected' : ''}`} onClick={handleSelectAll}>모든 병변 선택</button>
            </div>
            <div className="detection-list">
              <div className="detection-header"><span>병변</span><span>존재 여부</span></div>
              {lesionList.map((lesion) => (
                <div
                  key={lesion.id}
                  className={`detection-item ${selectedLesions.includes(lesion.id) ? 'selected' : ''}`}
                  onClick={() => handleLesionSelect(lesion.id)}
                >
                  <div className="detection-name">{lesion.name}</div>
                  <div className="detection-status">{lesion.status}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="detection-image">
            <img
              src="https://miinimanimo.github.io/capstone_frontend/images/eye.jpeg"
              alt={`${selectedEye === 'left' ? '좌안' : '우안'} 안저 이미지`}
              onLoad={handleImageLoad}
              style={{
                transform: `scale(${Math.round(imageSize) / 100}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                transformOrigin: 'center center'
              }}
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2AIResult; 