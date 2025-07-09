import React from 'react';
import '../Analysis.css';

interface Step3FinalConfirmProps {
  selectedEye: 'left' | 'right';
  eyeStatus: any;
  handlePrev: () => void;
  handleEyeConfirm: (step: number, eye: 'left' | 'right') => void;
  handleNext: () => void;
  showAIDetection: boolean;
  setShowAIDetection: (v: boolean) => void;
  showGrid: boolean;
  setShowGrid: (v: boolean) => void;
  showSuperpixel: boolean;
  setShowSuperpixel: (v: boolean) => void;
  imageSize: number;
  handleSizeChange: (inc: boolean) => void;
  imageRef: React.RefObject<HTMLDivElement>;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: (e: React.MouseEvent) => void;
  handleWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  imagePosition: { x: number; y: number };
  handleImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  handleCanvasClick: (e: any) => void;
  selectedSeverity: string;
  setSelectedSeverity: (v: string) => void;
  lesionList: { id: string; name: string; status: string }[];
  currentLesion: string | null;
  selectedLesions: string[];
  selectedPixels: { [key: string]: number[] };
  handleLesionSelect: (id: string) => void;
  handleImageKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

const Step3FinalConfirm: React.FC<Step3FinalConfirmProps> = ({
  selectedEye,
  eyeStatus,
  handlePrev,
  handleEyeConfirm,
  handleNext,
  showAIDetection,
  setShowAIDetection,
  showGrid,
  setShowGrid,
  showSuperpixel,
  setShowSuperpixel,
  imageSize,
  handleSizeChange,
  imageRef,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleWheel,
  imagePosition,
  handleImageLoad,
  canvasRef,
  handleCanvasClick,
  selectedSeverity,
  setSelectedSeverity,
  lesionList,
  currentLesion,
  selectedLesions,
  selectedPixels,
  handleLesionSelect,
  handleImageKeyDown,
}) => {
  const step3Confirmed = eyeStatus.step3.left && eyeStatus.step3.right;
  const imageDivRef = imageRef as React.RefObject<HTMLDivElement>;
  React.useEffect(() => {
    if (imageDivRef.current) {
      imageDivRef.current.focus();
    }
  }, [imageDivRef]);
  return (
    <div className="step-content step-3">
      <div className="patient-info-header">
        <div className="info-group">
          <div className="info-icon">{/* ...SVG 생략... */}</div>
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
            <button className={`eye-button ${eyeStatus.step3.left ? 'confirmed' : ''}`} onClick={() => handleEyeConfirm(3, 'left')}>좌안 확인</button>
            <button className={`eye-button ${eyeStatus.step3.right ? 'confirmed' : ''}`} onClick={() => handleEyeConfirm(3, 'right')}>우안 확인</button>
          </div>
          <button className={`step-button next ${!step3Confirmed ? 'disabled' : ''}`} onClick={handleNext} disabled={!step3Confirmed}>완료하기</button>
        </div>
      </div>
      <div className="final-diagnosis-container">
        <div className="final-diagnosis-left">
          <div className="toggle-controls">
            <div className="toggle-group">
              <span className="toggle-text">AI 병변 포착</span>
              <div className={`toggle-switch ${showAIDetection ? 'active' : ''}`} onClick={() => setShowAIDetection(!showAIDetection)}>
                <span className="toggle-slider"></span>
              </div>
              <span className="toggle-text">{showAIDetection ? 'ON' : 'OFF'}</span>
            </div>
            <div className="toggle-group">
              <span className="toggle-text">Grid로 보기</span>
              <div className={`toggle-switch ${showGrid ? 'active' : ''}`} onClick={() => { setShowGrid(!showGrid); if (!showGrid) setShowSuperpixel(false); }}>
                <span className="toggle-slider"></span>
              </div>
              <span className="toggle-text">{showGrid ? 'ON' : 'OFF'}</span>
            </div>
            <div className="toggle-group">
              <span className="toggle-text">Superpixel로 보기</span>
              <div className={`toggle-switch ${showSuperpixel ? 'active' : ''}`} onClick={() => { setShowSuperpixel(!showSuperpixel); if (!showSuperpixel) setShowGrid(false); }}>
                <span className="toggle-slider"></span>
              </div>
              <span className="toggle-text">{showSuperpixel ? 'ON' : 'OFF'}</span>
            </div>
            <div className="size-control">
              <button className="size-button" onClick={() => handleSizeChange(false)}>-</button>
              <span className="size-value">{imageSize}%</span>
              <button className="size-button" onClick={() => handleSizeChange(true)}>+</button>
            </div>
          </div>
          <div
            className="main-eye-image"
            ref={imageRef}
            tabIndex={0}
            onKeyDown={handleImageKeyDown}
            onMouseDown={e => {
              handleMouseDown(e);
              if (e.currentTarget) e.currentTarget.focus();
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onMouseEnter={e => {
              if (e.currentTarget) e.currentTarget.focus();
            }}
            style={{ touchAction: 'none' }}
          >
            <img
              src="https://miinimanimo.github.io/capstone_frontend/images/eye.jpeg"
              alt={`${selectedEye === 'left' ? '좌안' : '우안'} 안저 이미지`}
              onLoad={handleImageLoad}
              style={{
                transform: `translate(-50%, -50%) scale(${Math.round(imageSize) / 100}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                transformOrigin: 'center center',
                transition: undefined // 키보드 이동시 버벅임 방지
              }}
              draggable={false}
            />
            <canvas
              ref={canvasRef}
              onMouseDown={(e) => handleCanvasClick(e)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'auto',
                zIndex: 2,
                cursor: 'crosshair',
                background: 'transparent'
              }}
            />
          </div>
        </div>
        <div className="final-diagnosis-right">
          <div className="severity-confirmation">
            <h4>좌안 중증도 확정</h4>
            <div className="severity-options">
              <div className={`severity-option ${selectedSeverity === 'mild' ? 'selected' : ''}`} onClick={() => setSelectedSeverity('mild')}>비증식성 당뇨망막병증(NPDR) - Mild</div>
              <div className={`severity-option ${selectedSeverity === 'severe' ? 'selected' : ''}`} onClick={() => setSelectedSeverity('severe')}>비증식성 당뇨망막병증(NPDR) - Severe</div>
              <div className={`severity-option ${selectedSeverity === 'moderate' ? 'selected' : ''}`} onClick={() => setSelectedSeverity('moderate')}>비증식성 당뇨망막병증(NPDR) - Moderate</div>
              <div className={`severity-option ${selectedSeverity === 'pdr' ? 'selected' : ''}`} onClick={() => setSelectedSeverity('pdr')}>증식성 당뇨망막병증(PDR)</div>
              <div className={`severity-option ${selectedSeverity === 'normal' ? 'selected' : ''}`} onClick={() => setSelectedSeverity('normal')}>이상없음</div>
            </div>
          </div>
          <div className="lesion-confirmation">
            <h4>좌안 병변 위치 확정하기</h4>
            <p className="lesion-guide">추가할 병변 목록을 클릭한 이후 사진의 픽셀을 클릭하세요.</p>
            <div className="lesion-types">
              {lesionList.map((lesion) => (
                <div
                  key={lesion.id}
                  className={`lesion-type ${lesion.id === currentLesion ? 'active' : ''} ${selectedLesions.includes(lesion.id) ? 'selected' : ''} ${lesion.id === 'retinal' ? 'red' : lesion.id === 'vitreous' ? 'purple' : lesion.id === 'preretinal' ? 'pink' : lesion.id === 'micro' ? 'green' : lesion.id === 'exudates' ? 'blue' : 'sky'}`}
                  onClick={() => handleLesionSelect(lesion.id)}
                >
                  <span className="color-dot"></span>
                  {lesion.name}
                </div>
              ))}
            </div>
            <button className="add-lesion-button">병변 추가하기</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3FinalConfirm; 