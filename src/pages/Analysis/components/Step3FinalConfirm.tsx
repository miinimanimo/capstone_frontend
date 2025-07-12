import React from 'react';
import '../Analysis.css';
import PatientIcon from '../../../components/icons/patient-icon.svg';

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
  selectedPixels: { [key: string]: { dx: number; dy: number }[] };
  handleLesionSelect: (id: string) => void;
  handleImageKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  cellSize: number;
  handleCellSizeInc: () => void;
  handleCellSizeDec: () => void;
  gridLineWidth: number;
  handleGridLineWidthInc: () => void;
  handleGridLineWidthDec: () => void;
  // 드래그 셀 선택용 추가
  isDraggingGrid: boolean;
  dragGridStart: {x: number, y: number} | null;
  dragGridEnd: {x: number, y: number} | null;
  handleGridMouseDown: (e: React.MouseEvent) => void;
  handleGridMouseMove: (e: React.MouseEvent) => void;
  handleGridMouseUp: (e: React.MouseEvent) => void;
  // SLIC 모드 전용 드래그 관련 props 복구
  isDraggingSLIC: boolean;
  dragSLICStart: {x: number, y: number} | null;
  dragSLICEnd: {x: number, y: number} | null;
  handleSLICMouseDown: (e: React.MouseEvent) => void;
  handleSLICMouseMove: (e: React.MouseEvent) => void;
  handleSLICMouseUp: (e: React.MouseEvent) => void;
  enabledEyes: { left: boolean; right: boolean };
  superpixelOpacity: number;
  setSuperpixelOpacity: (v: number) => void;
  superpixelLineWidth: number;
  handleSuperpixelLineWidthInc: () => void;
  handleSuperpixelLineWidthDec: () => void;
  gridLineOpacity: number;
  setGridLineOpacity: (v: number) => void;
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
  cellSize,
  handleCellSizeInc,
  handleCellSizeDec,
  gridLineWidth,
  handleGridLineWidthInc,
  handleGridLineWidthDec,
  isDraggingGrid,
  dragGridStart,
  dragGridEnd,
  handleGridMouseDown,
  handleGridMouseMove,
  handleGridMouseUp,
  isDraggingSLIC,
  dragSLICStart,
  dragSLICEnd,
  handleSLICMouseDown,
  handleSLICMouseMove,
  handleSLICMouseUp,
  enabledEyes,
  superpixelOpacity,
  setSuperpixelOpacity,
  superpixelLineWidth,
  handleSuperpixelLineWidthInc,
  handleSuperpixelLineWidthDec,
  gridLineOpacity,
  setGridLineOpacity,
}) => {
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
            {enabledEyes.left && (
              <button className={`eye-button ${eyeStatus.step3.left ? 'confirmed' : ''}`} onClick={() => handleEyeConfirm(3, 'left')}>좌안 확인</button>
            )}
            {enabledEyes.right && (
              <button className={`eye-button ${eyeStatus.step3.right ? 'confirmed' : ''}`} onClick={() => handleEyeConfirm(3, 'right')}>우안 확인</button>
            )}
          </div>
          <button className={`step-button next ${!(enabledEyes.left ? eyeStatus.step3.left : true) || !(enabledEyes.right ? eyeStatus.step3.right : true) ? 'disabled' : ''}`}
            onClick={handleNext}
            disabled={!(enabledEyes.left ? eyeStatus.step3.left : true) || !(enabledEyes.right ? eyeStatus.step3.right : true)}>
            완료하기
          </button>
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
            style={{
              touchAction: 'none',
              // 드래그 중이면 grabbing, 아니면 커스텀 커서
              ...(imageRef.current && imageRef.current.classList.contains('dragging')
                ? { cursor: 'grabbing' }
                : { cursor: `url('/Hollow Circle Cursor.png') 16 16` }),
            }}
          >
            {(selectedEye === 'left' && enabledEyes.left) && (
              <img
                src="https://miinimanimo.github.io/capstone_frontend/images/eye.jpeg"
                alt="좌안 안저 이미지"
                onLoad={handleImageLoad}
                style={{
                  transform: `translate(-50%, -50%) scale(${Math.round(imageSize) / 100}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                  transformOrigin: 'center center',
                  transition: undefined
                }}
                draggable={false}
              />
            )}
            {(selectedEye === 'right' && enabledEyes.right) && (
              <img
                src="https://miinimanimo.github.io/capstone_frontend/images/eye.jpeg"
                alt="우안 안저 이미지"
                onLoad={handleImageLoad}
                style={{
                  transform: `translate(-50%, -50%) scale(${Math.round(imageSize) / 100}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                  transformOrigin: 'center center',
                  transition: undefined
                }}
                draggable={false}
              />
            )}
            <canvas
              ref={canvasRef}
              onMouseDown={showGrid ? handleGridMouseDown : showSuperpixel ? handleSLICMouseDown : undefined}
              onMouseMove={showGrid ? handleGridMouseMove : showSuperpixel ? handleSLICMouseMove : undefined}
              onMouseUp={showGrid ? handleGridMouseUp : showSuperpixel ? handleSLICMouseUp : undefined}
              onMouseLeave={showGrid ? handleGridMouseUp : showSuperpixel ? handleSLICMouseUp : undefined}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'auto',
                zIndex: 2,
                background: 'transparent',
                cursor: `url('/Hollow Circle Cursor.png') 16 16, crosshair`,
              }}
            />
            {/* 사진(이미지) 영역 오른쪽 하단에 그리드 조작 패널 표시 */}
            {showGrid && (
              <GridControlPanel
                cellSize={cellSize}
                handleCellSizeInc={handleCellSizeInc}
                handleCellSizeDec={handleCellSizeDec}
                gridLineWidth={gridLineWidth}
                handleGridLineWidthInc={handleGridLineWidthInc}
                handleGridLineWidthDec={handleGridLineWidthDec}
                gridLineOpacity={gridLineOpacity}
                setGridLineOpacity={setGridLineOpacity}
              />
            )}
            {showSuperpixel && (
              <SuperpixelControlPanel
                superpixelLineWidth={superpixelLineWidth}
                handleSuperpixelLineWidthInc={handleSuperpixelLineWidthInc}
                handleSuperpixelLineWidthDec={handleSuperpixelLineWidthDec}
                superpixelOpacity={superpixelOpacity}
                setSuperpixelOpacity={setSuperpixelOpacity}
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

// 1. GridControlPanel 컴포넌트 추가
const GridControlPanel: React.FC<{
  cellSize: number;
  handleCellSizeInc: () => void;
  handleCellSizeDec: () => void;
  gridLineWidth: number;
  handleGridLineWidthInc: () => void;
  handleGridLineWidthDec: () => void;
  gridLineOpacity: number;
  setGridLineOpacity: (v: number) => void;
}> = ({
  cellSize,
  handleCellSizeInc,
  handleCellSizeDec,
  gridLineWidth,
  handleGridLineWidthInc,
  handleGridLineWidthDec,
  gridLineOpacity,
  setGridLineOpacity
}) => {
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
      >
        <span style={{fontWeight: 700, fontSize: '1.1rem'}}>그리드 조작</span>
        <button
          style={{
            marginLeft: 8,
            minWidth: 56, height: 32, borderRadius: 8,
            background: 'rgba(255,255,255,0.97)', border: '1px solid #bbb', fontSize: 15, color: '#555', cursor: 'pointer', padding: '0 16px', lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s', fontWeight: 700
          }}
          title="펼치기"
          onClick={e => { e.stopPropagation(); setMinimized(false); }}
        >펼치기</button>
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
          fontWeight: 700
        }}
        title="최소화"
      >최소화</button>
      <div style={{fontWeight: 700, fontSize: '1.1rem', marginBottom: 4}}>그리드 조작</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <span style={{minWidth: 70}}>셀 크기:</span>
        <button type="button" onClick={handleCellSizeDec} style={{width: 28, height: 28, fontSize: 18, borderRadius: 6, border: '1px solid #bbb', background: '#fff', color: '#4B19E5'}}>-</button>
        <span style={{width: 48, textAlign: 'center', fontWeight: 600}}>{cellSize}px</span>
        <button type="button" onClick={handleCellSizeInc} style={{width: 28, height: 28, fontSize: 18, borderRadius: 6, border: '1px solid #bbb', background: '#fff', color: '#4B19E5'}}>+</button>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <span style={{minWidth: 70}}>두께:</span>
        <button type="button" onClick={handleGridLineWidthDec} style={{width: 28, height: 28, fontSize: 18, borderRadius: 6, border: '1px solid #bbb', background: '#fff', color: '#4B19E5'}}>-</button>
        <span style={{width: 48, textAlign: 'center', fontWeight: 600}}>{gridLineWidth.toFixed(1)}px</span>
        <button type="button" onClick={handleGridLineWidthInc} style={{width: 28, height: 28, fontSize: 18, borderRadius: 6, border: '1px solid #bbb', background: '#fff', color: '#4B19E5'}}>+</button>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <span style={{minWidth: 70}}>투명도:</span>
        <button type="button" onClick={() => setGridLineOpacity(Math.max(0.05, +(gridLineOpacity - 0.05).toFixed(2)))} style={{width: 28, height: 28, fontSize: 18, borderRadius: 6, border: '1px solid #bbb', background: '#fff', color: '#4B19E5'}}>-</button>
        <span style={{width: 48, textAlign: 'center', fontWeight: 600}}>{(gridLineOpacity * 100).toFixed(0)}%</span>
        <button type="button" onClick={() => setGridLineOpacity(Math.min(1, +(gridLineOpacity + 0.05).toFixed(2)))} style={{width: 28, height: 28, fontSize: 18, borderRadius: 6, border: '1px solid #bbb', background: '#fff', color: '#4B19E5'}}>+</button>
      </div>
    </div>
  );
};

// SLIC(Superpixel) 모드용 컨트롤 패널
const SuperpixelControlPanel: React.FC<{
  superpixelLineWidth: number;
  handleSuperpixelLineWidthInc: () => void;
  handleSuperpixelLineWidthDec: () => void;
  superpixelOpacity: number;
  setSuperpixelOpacity: (v: number) => void;
}> = ({
  superpixelLineWidth,
  handleSuperpixelLineWidthInc,
  handleSuperpixelLineWidthDec,
  superpixelOpacity,
  setSuperpixelOpacity
}) => {
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
      >
        <span style={{fontWeight: 700, fontSize: '1.1rem'}}>Superpixel 조작</span>
        <button
          style={{
            marginLeft: 8,
            minWidth: 56, height: 32, borderRadius: 8,
            background: 'rgba(255,255,255,0.97)', border: '1px solid #bbb', fontSize: 15, color: '#555', cursor: 'pointer', padding: '0 16px', lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s', fontWeight: 700
          }}
          title="펼치기"
          onClick={e => { e.stopPropagation(); setMinimized(false); }}
        >펼치기</button>
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
          fontWeight: 700
        }}
        title="최소화"
      >최소화</button>
      <div style={{fontWeight: 700, fontSize: '1.1rem', marginBottom: 4}}>Superpixel 조작</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <span style={{minWidth: 70}}>두께:</span>
        <button type="button" onClick={handleSuperpixelLineWidthDec} style={{width: 28, height: 28, fontSize: 18, borderRadius: 6, border: '1px solid #bbb', background: '#fff', color: '#4B19E5'}}>-</button>
        <span style={{width: 48, textAlign: 'center', fontWeight: 600}}>{superpixelLineWidth.toFixed(1)}px</span>
        <button type="button" onClick={handleSuperpixelLineWidthInc} style={{width: 28, height: 28, fontSize: 18, borderRadius: 6, border: '1px solid #bbb', background: '#fff', color: '#4B19E5'}}>+</button>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <span style={{minWidth: 70}}>투명도:</span>
        <button type="button" onClick={() => setSuperpixelOpacity(Math.max(0.05, +(superpixelOpacity - 0.05).toFixed(2)))} style={{width: 28, height: 28, fontSize: 18, borderRadius: 6, border: '1px solid #bbb', background: '#fff', color: '#4B19E5'}}>-</button>
        <span style={{width: 48, textAlign: 'center', fontWeight: 600}}>{(superpixelOpacity * 100).toFixed(0)}%</span>
        <button type="button" onClick={() => setSuperpixelOpacity(Math.min(1, +(superpixelOpacity + 0.05).toFixed(2)))} style={{width: 28, height: 28, fontSize: 18, borderRadius: 6, border: '1px solid #bbb', background: '#fff', color: '#4B19E5'}}>+</button>
      </div>
    </div>
  );
};

export default Step3FinalConfirm; 