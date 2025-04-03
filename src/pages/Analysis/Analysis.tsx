import React, { useState } from 'react';
import './Analysis.css';

const Analysis: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(2);
  const [eyeStatus, setEyeStatus] = useState({
    step2: {
      left: false,
      right: false
    },
    step3: {
      left: false,
      right: false
    }
  });
  const [selectedEye, setSelectedEye] = useState<'left' | 'right'>('left');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [imageSize, setImageSize] = useState<number>(100);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startPosition, setStartPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isAIDetectionOn, setIsAIDetectionOn] = useState<boolean>(true);
  const imageRef = React.useRef<HTMLDivElement>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [selectedLesions, setSelectedLesions] = useState<string[]>([]);
  const [allSelected, setAllSelected] = useState<boolean>(false);

  const steps = [
    {
      number: 1,
      title: '사진 업로드',
      subItems: []
    },
    {
      number: 2,
      title: 'AI 결과 확인',
      subItems: ['좌안 안저', '우안 안저']
    },
    {
      number: 3,
      title: '최종 결과 확정',
      subItems: ['좌안 안저', '우안 안저']
    }
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      if (currentStep === 2) {
        const unconfirmedEyes = [];
        if (!eyeStatus.step2.left) unconfirmedEyes.push('좌안');
        if (!eyeStatus.step2.right) unconfirmedEyes.push('우안');
        
        if (unconfirmedEyes.length > 0) {
          setModalMessage(`${unconfirmedEyes.join(', ')}이(가) 확인되지 않았습니다.`);
          setShowModal(true);
          return;
        }
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleEyeConfirm = (step: number, eye: 'left' | 'right') => {
    setSelectedEye(eye);
    if (step === 2) {
      setEyeStatus(prev => ({
        ...prev,
        step2: {
          ...prev.step2,
          [eye]: true
        }
      }));
    } else if (step === 3) {
      setEyeStatus(prev => ({
        ...prev,
        step3: {
          ...prev.step3,
          [eye]: true
        }
      }));
    }
  };

  const handleSizeChange = (increment: boolean) => {
    setImageSize(prev => {
      const newSize = increment ? prev + 10 : prev - 10;
      return Math.min(Math.max(50, newSize), 200); // 최소 50%, 최대 200%
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (imageRef.current) {
      if (e.button === 0) { // 좌클릭일 때만
        setIsDragging(true);
        setStartPosition({
          x: e.clientX - imagePosition.x,
          y: e.clientY - imagePosition.y
        });
        imageRef.current.classList.add('dragging');
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageRef.current) return;

    const newX = e.clientX - startPosition.x;
    const newY = e.clientY - startPosition.y;

    // 이미지가 너무 많이 벗어나지 않도록 제한
    const containerRect = imageRef.current.getBoundingClientRect();
    const imageRect = imageRef.current.querySelector('img')?.getBoundingClientRect();
    
    if (imageRect) {
      const maxX = (imageRect.width - containerRect.width) / 2;
      const maxY = (imageRect.height - containerRect.height) / 2;

      const boundedX = Math.min(Math.max(newX, -maxX), maxX);
      const boundedY = Math.min(Math.max(newY, -maxY), maxY);

      setImagePosition({
        x: boundedX,
        y: boundedY
      });
    }
  };

  const handleMouseUp = () => {
    if (imageRef.current) {
      setIsDragging(false);
      imageRef.current.classList.remove('dragging');
    }
  };

  const handleLesionSelect = (lesionId: string) => {
    setSelectedLesions(prev => {
      if (prev.includes(lesionId)) {
        const newSelected = prev.filter(id => id !== lesionId);
        setAllSelected(false);
        return newSelected;
      } else {
        const newSelected = [...prev, lesionId];
        setAllSelected(newSelected.length === lesionList.length);
        return newSelected;
      }
    });
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedLesions([]);
      setAllSelected(false);
    } else {
      setSelectedLesions(lesionList.map(lesion => lesion.id));
      setAllSelected(true);
    }
  };

  const lesionList = [
    { id: 'retinal', name: 'Retinal hemorrhages', status: '존재' },
    { id: 'micro', name: 'Microaneurysms', status: '존재' },
    { id: 'exudates', name: 'Exudates', status: '존재' },
    { id: 'cotton', name: 'Cotton wool spots', status: '존재' },
    { id: 'vitreous', name: 'Vitreous hemorrhages', status: '존재' },
    { id: 'preretinal', name: 'Preretinal hemorrhages', status: '존재' },
  ];

  const renderStepButtons = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-buttons">
            <button className="step-button next" onClick={handleNext}>다음 단계</button>
          </div>
        );
      case 2:
        return (
          <div className="step-buttons">
            <button className="step-button prev" onClick={handlePrev}>이전 단계</button>
            <div className="eye-confirm-buttons">
              <button 
                className={`eye-button ${eyeStatus.step2.left ? 'confirmed' : ''}`}
                onClick={() => handleEyeConfirm(2, 'left')}
              >
                좌안 확인
              </button>
              <button 
                className={`eye-button ${eyeStatus.step2.right ? 'confirmed' : ''}`}
                onClick={() => handleEyeConfirm(2, 'right')}
              >
                우안 확인
              </button>
            </div>
            <button 
              className={`step-button next ${eyeStatus.step2.left && eyeStatus.step2.right ? '' : 'disabled'}`}
              onClick={handleNext}
              disabled={!eyeStatus.step2.left || !eyeStatus.step2.right}
            >
              다음 단계
            </button>
          </div>
        );
      case 3:
        const allConfirmed = eyeStatus.step3.left && eyeStatus.step3.right;
        return (
          <div className="step-buttons">
            <button className="step-button prev" onClick={handlePrev}>이전 단계</button>
            <div className="eye-confirm-buttons">
              <button 
                className={`eye-button ${eyeStatus.step3.left ? 'confirmed' : ''}`}
                onClick={() => handleEyeConfirm(3, 'left')}
              >
                좌안 확인
              </button>
              <button 
                className={`eye-button ${eyeStatus.step3.right ? 'confirmed' : ''}`}
                onClick={() => handleEyeConfirm(3, 'right')}
              >
                우안 확인
              </button>
            </div>
            {allConfirmed ? (
              <button className="step-button complete">완료하기</button>
            ) : (
              <button className="step-button next disabled" disabled>완료하기</button>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <div className="patient-info-header">
              <div className="info-group">
                <h2>환자 정보</h2>
              </div>
              <div className="step-buttons">
                <button className="step-button next" onClick={handleNext}>다음 단계</button>
              </div>
            </div>
            <div className="search-container">
              <div className="search-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="환자 성명 or 환자 코드"
                className="search-input"
              />
              <button className="search-button">검색하기</button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="step-content">
            <div className="patient-info-header">
              <div className="info-group">
                <div className="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="#4B19E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
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
                  <button 
                    className={`eye-button ${eyeStatus.step2.left ? 'confirmed' : ''}`}
                    onClick={() => handleEyeConfirm(2, 'left')}
                  >
                    좌안 확인
                  </button>
                  <button 
                    className={`eye-button ${eyeStatus.step2.right ? 'confirmed' : ''}`}
                    onClick={() => handleEyeConfirm(2, 'right')}
                  >
                    우안 확인
                  </button>
                </div>
                <button 
                  className={`step-button next ${eyeStatus.step2.left && eyeStatus.step2.right ? '' : 'disabled'}`}
                  onClick={handleNext}
                  disabled={!eyeStatus.step2.left || !eyeStatus.step2.right}
                >
                  다음 단계
                </button>
              </div>
            </div>

            <div className="diagnosis-container">
              <div className="diagnosis-top-row">
                <div className="diagnosis-section">
                  <h3>{selectedEye === 'left' ? '좌안' : '우안'} 중증도 AI 진단</h3>
                  <div className="severity-list">
                    <div className="severity-header">
                      <span>중증도</span>
                      <span>신뢰도</span>
                    </div>
                    <div className="severity-item">
                      <div className="severity-label">비증식성 당뇨망막병증(NPDR) - Mild</div>
                      <div className="severity-value">78%</div>
                    </div>
                    <div className="severity-item">
                      <div className="severity-label">비증식성 당뇨망막병증(NPDR) - Moderate</div>
                      <div className="severity-value">12%</div>
                    </div>
                    <div className="severity-item">
                      <div className="severity-label">비증식성 당뇨망막병증(NPDR) - Severe</div>
                      <div className="severity-value">6%</div>
                    </div>
                    <div className="severity-item">
                      <div className="severity-label">증식성 당뇨망막병증(PDR)</div>
                      <div className="severity-value">6%</div>
                    </div>
                  </div>
                </div>

                <div className="interest-region-container">
                  <h3>Interest Region</h3>
                  <img 
                    src="/IG.png"
                    alt="Interest Region"
                  />
                </div>
              </div>

              <div className="detection-container">
                <div className="detection-section">
                  <h3>
                    {selectedEye === 'left' ? '좌안' : '우안'} AI 포착 병변
                    <button 
                      className="select-all-button"
                      onClick={handleSelectAll}
                    >
                      {allSelected ? '모두 해제' : '모든 병변 선택'}
                    </button>
                  </h3>
                  <div className="detection-list">
                    <div className="detection-header">
                      <span>병변</span>
                      <span>존재 여부</span>
                    </div>
                    {lesionList.map(lesion => (
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
                    src="/눈.jpeg"
                    alt={`${selectedEye === 'left' ? '좌안' : '우안'} 안저 이미지`}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="step-content">
            <div className="patient-info-header">
              <div className="info-group">
                <div className="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="#4B19E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="info-text">
                  <span className="date">2025년 2월 3일</span>
                  <span className="divider">|</span>
                  <span className="patient-name">환자 성명: 장석민</span>
                  <span className="divider">|</span>
                  <span className="patient-code">환자 코드: jg0103</span>
                </div>
              </div>
              {renderStepButtons()}
            </div>

            <div className="final-diagnosis-container">
              <div className="final-diagnosis-left">
                <div className="toggle-controls">
                  <span className="toggle-text">AI 병변 포착</span>
                  <div 
                    className={`toggle-switch ${isAIDetectionOn ? 'active' : ''}`}
                    onClick={() => setIsAIDetectionOn(!isAIDetectionOn)}
                  >
                    <span className="toggle-slider"></span>
                  </div>
                  <span className="toggle-text">{isAIDetectionOn ? 'ON' : 'OFF'}</span>
                  <div className="size-control">
                    <button 
                      className="size-button"
                      onClick={() => handleSizeChange(false)}
                    >
                      -
                    </button>
                    <span className="size-value">{imageSize}%</span>
                    <button 
                      className="size-button"
                      onClick={() => handleSizeChange(true)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div 
                  className="main-eye-image"
                  ref={imageRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <img 
                    src="/눈.jpeg"
                    alt={`${selectedEye === 'left' ? '좌안' : '우안'} 안저 이미지`}
                    style={{ 
                      transform: `scale(${imageSize / 100}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                      transformOrigin: 'center center'
                    }}
                    draggable={false}
                  />
                </div>
              </div>

              <div className="final-diagnosis-right">
                <div className="severity-confirmation">
                  <h4>{selectedEye === 'left' ? '좌안' : '우안'} 중증도 확정</h4>
                  <div className="severity-options">
                    <div 
                      className={`severity-option ${selectedSeverity === 'mild' ? 'selected' : ''}`}
                      onClick={() => setSelectedSeverity('mild')}
                    >
                      비증식성 당뇨망막병증(NPDR) - Mild
                    </div>
                    <div 
                      className={`severity-option ${selectedSeverity === 'moderate' ? 'selected' : ''}`}
                      onClick={() => setSelectedSeverity('moderate')}
                    >
                      비증식성 당뇨망막병증(NPDR) - Moderate
                    </div>
                    <div 
                      className={`severity-option ${selectedSeverity === 'severe' ? 'selected' : ''}`}
                      onClick={() => setSelectedSeverity('severe')}
                    >
                      비증식성 당뇨망막병증(NPDR) - Severe
                    </div>
                    <div 
                      className={`severity-option ${selectedSeverity === 'pdr' ? 'selected' : ''}`}
                      onClick={() => setSelectedSeverity('pdr')}
                    >
                      증식성 당뇨망막병증(PDR)
                    </div>
                    <div 
                      className={`severity-option ${selectedSeverity === 'normal' ? 'selected' : ''}`}
                      onClick={() => setSelectedSeverity('normal')}
                    >
                      이상 없음
                    </div>
                  </div>
                </div>

                <div className="lesion-confirmation">
                  <h4>{selectedEye === 'left' ? '좌안' : '우안'} 병변 위치 확정하기</h4>
                  <p className="lesion-guide">추가할 병변 목록을 클릭한 이후 사진의 픽셀을 클릭하세요.</p>
                  <div className="lesion-types">
                    <div 
                      className={`lesion-type red ${selectedLesions.includes('retinal') ? 'selected' : ''}`}
                      onClick={() => handleLesionSelect('retinal')}
                    >
                      <span className="color-dot"></span>
                      Retinal hemorrhages
                    </div>
                    <div 
                      className={`lesion-type green ${selectedLesions.includes('micro') ? 'selected' : ''}`}
                      onClick={() => handleLesionSelect('micro')}
                    >
                      <span className="color-dot"></span>
                      Microaneurysms
                    </div>
                    <div 
                      className={`lesion-type blue ${selectedLesions.includes('exudates') ? 'selected' : ''}`}
                      onClick={() => handleLesionSelect('exudates')}
                    >
                      <span className="color-dot"></span>
                      Exudates
                    </div>
                    <div 
                      className={`lesion-type yellow ${selectedLesions.includes('cotton') ? 'selected' : ''}`}
                      onClick={() => handleLesionSelect('cotton')}
                    >
                      <span className="color-dot"></span>
                      Cotton wool spots
                    </div>
                    <div 
                      className={`lesion-type red ${selectedLesions.includes('vitreous') ? 'selected' : ''}`}
                      onClick={() => handleLesionSelect('vitreous')}
                    >
                      <span className="color-dot"></span>
                      Vitreous hemorrhages
                    </div>
                    <div 
                      className={`lesion-type red ${selectedLesions.includes('preretinal') ? 'selected' : ''}`}
                      onClick={() => handleLesionSelect('preretinal')}
                    >
                      <span className="color-dot"></span>
                      Preretinal hemorrhages
                    </div>
                  </div>
                  <button className="add-lesion-button">병변 추가하기</button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="analysis-container">
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>확인 필요</h3>
            </div>
            <div className="modal-body">
              {modalMessage}
            </div>
            <div className="modal-footer">
              <button 
                className="modal-button"
                onClick={() => setShowModal(false)}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="analysis-layout">
        <div className="step-sidebar">
          {steps.map((step) => (
            <div 
              key={step.number} 
              className={`step-item ${currentStep === step.number ? 'active' : ''}`}
            >
              <div className="step-header">
                <div className={`step-number ${currentStep === step.number ? 'active' : ''}`}>
                  {step.number}
                </div>
                <span className="step-title">{step.title}</span>
              </div>
              {currentStep === step.number && step.subItems.length > 0 && (
                <div className="step-subitems">
                  {step.subItems.map((item, index) => {
                    const isLeftEye = item.includes('좌안');
                    const isRightEye = item.includes('우안');
                    const isSelected = 
                      (isLeftEye && selectedEye === 'left') || 
                      (isRightEye && selectedEye === 'right');
                    
                    return (
                      <div 
                        key={index} 
                        className={`subitem ${isSelected ? 'selected' : ''}`}
                      >
                        • {item}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="main-content">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default Analysis; 