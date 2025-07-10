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
  gridSize: number;
  handleGridSizeInc: () => void;
  handleGridSizeDec: () => void;
  handleGridSizeChange: (value: number) => void;
  gridLineWidth: number;
  handleGridLineWidthInc: () => void;
  handleGridLineWidthDec: () => void;
  handleGridLineWidthChange: (value: number) => void;
}

// 1. GridControlPanel 컴포넌트 추가
const GridControlPanel: React.FC<{
  gridSize: number;
  handleGridSizeInc: () => void;
  handleGridSizeDec: () => void;
  handleGridSizeChange: (value: number) => void;
  gridLineWidth: number;
  handleGridLineWidthInc: () => void;
  handleGridLineWidthDec: () => void;
  handleGridLineWidthChange: (value: number) => void;
}> = ({
  gridSize,
  handleGridSizeInc,
  handleGridSizeDec,
  handleGridSizeChange,
  gridLineWidth,
  handleGridLineWidthInc,
  handleGridLineWidthDec,
  handleGridLineWidthChange
}) => {
  // 상태: 입력 중 string 지원
  const [gridSizeInput, setGridSizeInput] = React.useState<string>(String(gridSize));
  const [gridLineWidthInput, setGridLineWidthInput] = React.useState<string>(String(gridLineWidth));

  React.useEffect(() => { setGridSizeInput(String(gridSize)); }, [gridSize]);
  React.useEffect(() => { setGridLineWidthInput(String(gridLineWidth)); }, [gridLineWidth]);

  // 입력창 onChange 핸들러
  const handleGridSizeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGridSizeInput(e.target.value);
  };
  const handleGridLineWidthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGridLineWidthInput(e.target.value);
  };
  // 입력 확정(blur/Enter) 핸들러
  const commitGridSizeInput = () => {
    const num = Number(gridSizeInput);
    if (!isNaN(num) && num >= 10 && num <= 500) {
      handleGridSizeChange(num);
    } else if (!isNaN(num) && num < 10) {
      handleGridSizeChange(10);
    } else if (!isNaN(num) && num > 500) {
      handleGridSizeChange(500);
    } else {
      setGridSizeInput(String(gridSize)); // 복구
    }
  };
  const commitGridLineWidthInput = () => {
    const num = Number(gridLineWidthInput);
    if (!isNaN(num) && num >= 0.1 && num <= 10) {
      handleGridLineWidthChange(num);
    } else if (!isNaN(num) && num < 0.1) {
      handleGridLineWidthChange(0.1);
    } else if (!isNaN(num) && num > 10) {
      handleGridLineWidthChange(10);
    } else {
      setGridLineWidthInput(String(gridLineWidth)); // 복구
    }
  };
  // 최소화 상태
  const [minimized, setMinimized] = React.useState(false);
  if (minimized) {
    return (
      <div className="grid-control-panel" style={{
        position: 'absolute', right: 16, bottom: 16, zIndex: 10,
        background: 'rgba(255,255,255,0.97)', borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
        padding: '10px 20px', minWidth: 0, color: '#222', fontSize: '1rem', fontWeight: 500,
        display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, pointerEvents: 'auto',
        cursor: 'pointer',
      }}
        onClick={() => setMinimized(false)}
      >
        <span style={{fontWeight: 700, fontSize: '1.1rem'}}>그리드 조작</span>
      </div>
    );
  }
  return (
    <div className="grid-control-panel" style={{
      position: 'absolute',
      right: 16,
      bottom: 16,
      zIndex: 10,
      background: 'rgba(255,255,255,0.97)',
      borderRadius: 16,
      boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
      padding: '16px 20px',
      minWidth: 200,
      color: '#222',
      fontSize: '1rem',
      fontWeight: 500,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      alignItems: 'flex-start',
      pointerEvents: 'auto',
    }}>
      {/* 최소화 버튼 */}
      <button onClick={() => setMinimized(true)}
        style={{
          position: 'absolute', top: 8, right: 12,
          minWidth: 56, height: 32, borderRadius: 8,
          background: 'rgba(255,255,255,0.97)', border: '1px solid #bbb', fontSize: 15, color: '#555', cursor: 'pointer', padding: '0 16px', lineHeight: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}
        onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.97)')}
        onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.97)')}
        title="최소화"
      >
        <span style={{fontWeight: 700, fontSize: 15, letterSpacing: 0}}>최소화</span>
      </button>
      <div style={{fontWeight: 700, fontSize: '1.1rem', marginBottom: 4}}>그리드 조작</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <span style={{minWidth: 70}}>크기(셀):</span>
        <button type="button" onClick={handleGridSizeDec} style={{width: 28, height: 28, fontSize: 18, borderRadius: 6, border: '1px solid #bbb', background: '#fff', color: '#4B19E5'}}>-</button>
        <input type="number" min={10} max={500} value={gridSizeInput} 
          onChange={handleGridSizeInputChange}
          onBlur={commitGridSizeInput}
          onKeyDown={e => { if (e.key === 'Enter') commitGridSizeInput(); }}
          style={{width: 60, textAlign: 'center', borderRadius: 6, border: '1px solid #bbb', fontSize: 16, padding: '2px 4px', MozAppearance: 'textfield'}}
          className="no-spin"
        />
        <button type="button" onClick={handleGridSizeInc} style={{width: 28, height: 28, fontSize: 18, borderRadius: 6, border: '1px solid #bbb', background: '#fff', color: '#4B19E5'}}>+</button>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <span style={{minWidth: 70}}>두께(px):</span>
        <button type="button" onClick={handleGridLineWidthDec} style={{width: 28, height: 28, fontSize: 18, borderRadius: 6, border: '1px solid #bbb', background: '#fff', color: '#4B19E5'}}>-</button>
        <input type="number" min={0.1} max={10} step={0.1} value={gridLineWidthInput}
          onChange={handleGridLineWidthInputChange}
          onBlur={commitGridLineWidthInput}
          onKeyDown={e => { if (e.key === 'Enter') commitGridLineWidthInput(); }}
          style={{width: 60, textAlign: 'center', borderRadius: 6, border: '1px solid #bbb', fontSize: 16, padding: '2px 4px', MozAppearance: 'textfield'}}
          className="no-spin"
        />
        <button type="button" onClick={handleGridLineWidthInc} style={{width: 28, height: 28, fontSize: 18, borderRadius: 6, border: '1px solid #bbb', background: '#fff', color: '#4B19E5'}}>+</button>
      </div>
    </div>
  );
};

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
  gridSize,
  handleGridSizeInc,
  handleGridSizeDec,
  handleGridSizeChange,
  gridLineWidth,
  handleGridLineWidthInc,
  handleGridLineWidthDec,
  handleGridLineWidthChange,
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
            {/* 여기서 grid-control-section 등 그리드 조작 UI 완전히 삭제 */}
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
              // 그리드 조작 패널 클릭 시 이미지 드래그/선택 무시
              if ((e.target as HTMLElement).closest('.grid-control-panel')) return;
              handleMouseDown(e);
              if (e.currentTarget) e.currentTarget.focus();
            }}
            onMouseMove={e => {
              if ((e.target as HTMLElement).closest('.grid-control-panel')) return;
              handleMouseMove(e);
            }}
            onMouseUp={e => {
              if ((e.target as HTMLElement).closest('.grid-control-panel')) return;
              handleMouseUp(e);
            }}
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
            {/* 사진(이미지) 영역 오른쪽 하단에 그리드 조작 패널 표시 */}
            {showGrid && (
              <GridControlPanel
                gridSize={gridSize}
                handleGridSizeInc={handleGridSizeInc}
                handleGridSizeDec={handleGridSizeDec}
                handleGridSizeChange={handleGridSizeChange}
                gridLineWidth={gridLineWidth}
                handleGridLineWidthInc={handleGridLineWidthInc}
                handleGridLineWidthDec={handleGridLineWidthDec}
                handleGridLineWidthChange={handleGridLineWidthChange}
              />
            )}
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