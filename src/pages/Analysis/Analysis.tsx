import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Analysis.css';

const Analysis: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [eyeStatus, setEyeStatus] = useState({
    step2: {
      left: false,
      right: false,
    },
    step3: {
      left: false,
      right: false,
    },
  });
  const [selectedEye, setSelectedEye] = useState<'left' | 'right'>('left');

  
  // 이미지 확대/축소 & 드래그 관련 상태
  const [imageSize, setImageSize] = useState<number>(100);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startPosition, setStartPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  const [isAIDetectionOn, setIsAIDetectionOn] = useState<boolean>(true);
  const [isGridOn, setIsGridOn] = useState<boolean>(false);
  const imageRef = React.useRef<HTMLDivElement>(null);

  // 중증도 선택
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  // 병변 선택
  const [selectedLesions, setSelectedLesions] = useState<string[]>([]);
  const [allSelected, setAllSelected] = useState<boolean>(false);

  // SLIC 세그먼트 관련 상태를 Grid로 변경
  const [selectedPixels, setSelectedPixels] = useState<{[key: string]: number[]}>({});
  const [currentLesion, setCurrentLesion] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1) 사이드바 단계 정의
  const steps = [
    {
      number: 1,
      title: '사진 업로드',
      subItems: [],
    },
    {
      number: 2,
      title: 'AI 결과 확인',
      subItems: ['좌안 안저', '우안 안저'],
    },
    {
      number: 3,
      title: '최종 결과 확정',
      subItems: ['좌안 안저', '우안 안저'],
    },
  ];

  // 2) 버튼(이전/다음 단계) 핸들러
  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 3) 좌안/우안 확인 버튼
  const handleEyeConfirm = (step: number, eye: 'left' | 'right') => {
    setSelectedEye(eye);
    if (step === 2) {
      setEyeStatus((prev) => ({
        ...prev,
        step2: {
          ...prev.step2,
          [eye]: true,
        },
      }));
    } else if (step === 3) {
      setEyeStatus((prev) => ({
        ...prev,
        step3: {
          ...prev.step3,
          [eye]: true,
        },
      }));
    }
  };

  // 4) 이미지 확대/축소
  const handleSizeChange = (increment: boolean) => {
    setImageSize((prev) => {
      const newSize = increment ? prev + 10 : prev - 10;
      return Math.max(50, Math.round(newSize));
    });
  };

  // 5) 마우스 드래그로 이미지 이동
  const handleMouseDown = (e: React.MouseEvent) => {
    // 좌클릭만
    if (e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    setStartPosition({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y,
    });

    if (imageRef.current) {
      imageRef.current.classList.add('dragging');
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageRef.current) return;

    e.preventDefault();
    e.stopPropagation();

    const newX = e.clientX - startPosition.x;
    const newY = e.clientY - startPosition.y;

    const containerRect = imageRef.current.getBoundingClientRect();
    const imageElement = imageRef.current.querySelector('img');
    const imageRect = imageElement?.getBoundingClientRect();

    if (imageRect) {
      // 이미지가 너무 벗어나지 않도록 제한
      const maxX = (imageRect.width - containerRect.width) / 2;
      const maxY = (imageRect.height - containerRect.height) / 2;

      const boundedX = Math.min(Math.max(newX, -maxX), maxX);
      const boundedY = Math.min(Math.max(newY, -maxY), maxY);

      setImagePosition({
        x: boundedX,
        y: boundedY,
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);
    if (imageRef.current) {
      imageRef.current.classList.remove('dragging');
    }
  };

  // 6) 병변(lesion) 여러 개 선택
  const lesionList = [
    { id: 'retinal', name: 'Retinal hemorrhages', status: '존재' },
    { id: 'micro', name: 'Microaneurysms', status: '존재' },
    { id: 'exudates', name: 'Exudates', status: '존재' },
    { id: 'cotton', name: 'Cotton wool spots', status: '존재' },
    { id: 'vitreous', name: 'Vitreous hemorrhages', status: '존재' },
    { id: 'preretinal', name: 'Preretinal hemorrhages', status: '존재' },
  ];

  const handleLesionSelect = (lesionId: string) => {
    // 현재 선택된 병변과 같은 병변을 클릭한 경우
    if (currentLesion === lesionId) {
      setCurrentLesion(null);
      setSelectedLesions([]);
    } else {
      // 다른 병변을 선택한 경우
      setCurrentLesion(lesionId);
      setSelectedLesions([lesionId]);
    }
  };

  const handleSelectAll = () => {};

  // 7) 마우스 휠로 이미지 확대/축소
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (currentStep === 3) {
      const mainEyeImage = imageRef.current;
      if (!mainEyeImage) return;

      const rect = mainEyeImage.getBoundingClientRect();
      const isInside = 
        e.clientX >= rect.left && 
        e.clientX <= rect.right && 
        e.clientY >= rect.top && 
        e.clientY <= rect.bottom;

      if (isInside) {
        e.preventDefault();
        e.stopPropagation();

        const delta = e.deltaY * -0.01;
        setImageSize(prevSize => {
          const newSize = prevSize + (delta * 10);
          return Math.max(50, Math.round(newSize));
        });
      }
    }
  };

  // 8) 컴포넌트 마운트/언마운트 시 wheel 이벤트 처리
  useEffect(() => {
    const mainEyeImage = imageRef.current;
    if (!mainEyeImage || currentStep !== 3) return;

    const preventScroll = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    mainEyeImage.addEventListener('wheel', preventScroll, { passive: false });

    // 트랙패드 핀치 줌 방지
    const preventGesture = (e: Event) => {
      e.preventDefault();
    };
    
    mainEyeImage.addEventListener('gesturestart', preventGesture, { passive: false });
    mainEyeImage.addEventListener('gesturechange', preventGesture, { passive: false });
    mainEyeImage.addEventListener('gestureend', preventGesture, { passive: false });

    return () => {
      mainEyeImage.removeEventListener('wheel', preventScroll);
      mainEyeImage.removeEventListener('gesturestart', preventGesture);
      mainEyeImage.removeEventListener('gesturechange', preventGesture);
      mainEyeImage.removeEventListener('gestureend', preventGesture);
    };
  }, [currentStep]);

  // Grid 그리기 함수
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    const container = imageRef.current;
    if (!canvas || !container) return;

    // 컨테이너 크기에 맞춰 캔버스 크기 설정
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!isGridOn) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // 그리드 크기 계산 (200x200)
    const cellWidth = rect.width / 200;
    const cellHeight = rect.height / 200;

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 모든 선택된 병변의 픽셀들 그리기
    Object.entries(selectedPixels).forEach(([lesionId, pixels]) => {
      // 병변 타입에 따른 색상 설정 (현재 선택된 병변은 더 진하게)
      const opacity = lesionId === currentLesion ? 0.5 : 0.3;
      
      switch (lesionId) {
        case 'retinal':
          ctx.fillStyle = `rgba(239, 68, 68, ${opacity})`; // 빨간색
          break;
        case 'vitreous':
          ctx.fillStyle = `rgba(147, 51, 234, ${opacity})`; // 보라색
          break;
        case 'preretinal':
          ctx.fillStyle = `rgba(236, 72, 153, ${opacity})`; // 분홍색
          break;
        case 'micro':
          ctx.fillStyle = `rgba(16, 185, 129, ${opacity})`; // 초록색
          break;
        case 'exudates':
          ctx.fillStyle = `rgba(59, 130, 246, ${opacity})`; // 파란색
          break;
        case 'cotton':
          ctx.fillStyle = `rgba(0, 150, 199, ${opacity})`; // 하늘색
          break;
        default:
          ctx.fillStyle = `rgba(75, 25, 229, ${opacity})`;
      }

      pixels.forEach(pixelIndex => {
        const row = Math.floor(pixelIndex / 200);
        const col = pixelIndex % 200;
        ctx.fillRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
      });
    });

    // 그리드 그리기
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'; // 검정색으로 변경하고 투명도 0.5로 설정
    ctx.lineWidth = 0.3; // 선 두께 유지

    // 세로선
    for (let i = 0; i <= 200; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellWidth, 0);
      ctx.lineTo(i * cellWidth, canvas.height);
      ctx.stroke();
    }

    // 가로선
    for (let i = 0; i <= 200; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * cellHeight);
      ctx.lineTo(canvas.width, i * cellHeight);
      ctx.stroke();
    }
  }, [selectedPixels, isGridOn, currentLesion]);

  // 픽셀 선택 처리
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentLesion || !isGridOn) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // 마우스 좌표를 캔버스 좌표로 변환
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // 그리드 셀 크기
    const cellWidth = canvas.width / 200;
    const cellHeight = canvas.height / 200;

    // 클릭한 셀의 인덱스 계산
    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);
    const pixelIndex = row * 200 + col;

    setSelectedPixels(prev => {
      const currentPixels = prev[currentLesion] || [];
      const newPixels = { ...prev };
      
      // 이미 선택된 픽셀이면 제거, 아니면 추가
      if (currentPixels.includes(pixelIndex)) {
        newPixels[currentLesion] = currentPixels.filter(p => p !== pixelIndex);
      } else {
        newPixels[currentLesion] = [...currentPixels, pixelIndex];
      }
      
      return newPixels;
    });
  }, [currentLesion, isGridOn]);

  // 컴포넌트 마운트/언마운트 시 이벤트 리스너 설정
  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  // 윈도우 리사이즈 시 그리드 다시 그리기
  useEffect(() => {
    const handleResize = () => {
      drawGrid();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [drawGrid]);

  // 이미지 크기나 위치 변경 시 그리드 다시 그리기
  useEffect(() => {
    drawGrid();
  }, [imageSize, imagePosition, drawGrid]);

  // 8) 단계별 버튼 렌더링
  const renderStepButtons = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-buttons">
            <button className="step-button next" onClick={handleNext}>
              다음 단계
            </button>
          </div>
        );
      case 2:
        return (
          <div className="step-buttons">
            <button className="step-button prev" onClick={handlePrev}>
              이전 단계
            </button>
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
              className={`step-button next ${
                eyeStatus.step2.left && eyeStatus.step2.right ? '' : 'disabled'
              }`}
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
            <button className="step-button prev" onClick={handlePrev}>
              이전 단계
            </button>
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
              <button className="step-button next disabled" disabled>
                완료하기
              </button>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // 10) 단계별 메인 내용 렌더링
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
                <button className="step-button next" onClick={handleNext}>
                  다음 단계
                </button>
              </div>
            </div>
            <div className="search-container">
              <div className="search-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21 21L16.65 16.65"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
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
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="#4B19E5"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
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
                <button className="step-button prev" onClick={handlePrev}>
                  이전 단계
                </button>
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
                  className={`step-button next ${
                    eyeStatus.step2.left && eyeStatus.step2.right ? '' : 'disabled'
                  }`}
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
                      <div className="severity-label">
                        비증식성 당뇨망막병증(NPDR) - Mild
                      </div>
                      <div className="severity-value">78%</div>
                    </div>
                    <div className="severity-item">
                      <div className="severity-label">
                        비증식성 당뇨망막병증(NPDR) - Moderate
                      </div>
                      <div className="severity-value">12%</div>
                    </div>
                    <div className="severity-item">
                      <div className="severity-label">
                        비증식성 당뇨망막병증(NPDR) - Severe
                      </div>
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
                  <img src="/images/ig.png" alt="Interest Region" />
                </div>
              </div>

              <div className="detection-container">
                <div className="detection-section">
                  <h3>
                    {selectedEye === 'left' ? '좌안' : '우안'} AI 포착 병변
                  </h3>
                  <div className="detection-list">
                    <div className="detection-header">
                      <span>병변</span>
                      <span>존재 여부</span>
                    </div>
                    {lesionList.map((lesion) => (
                      <div
                        key={lesion.id}
                        className={`detection-item ${
                          selectedLesions.includes(lesion.id) ? 'selected' : ''
                        }`}
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
                    src="/images/eye.jpeg"
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
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="#4B19E5"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
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
                  <div className="toggle-group">
                    <span className="toggle-text">AI 병변 포착</span>
                    <div
                      className={`toggle-switch ${isAIDetectionOn ? 'active' : ''}`}
                      onClick={() => setIsAIDetectionOn(!isAIDetectionOn)}
                    >
                      <span className="toggle-slider"></span>
                    </div>
                    <span className="toggle-text">{isAIDetectionOn ? 'ON' : 'OFF'}</span>
                  </div>

                  <div className="toggle-group">
                    <span className="toggle-text">Grid로 보기</span>
                    <div
                      className={`toggle-switch ${isGridOn ? 'active' : ''}`}
                      onClick={() => setIsGridOn(!isGridOn)}
                    >
                      <span className="toggle-slider"></span>
                    </div>
                    <span className="toggle-text">{isGridOn ? 'ON' : 'OFF'}</span>
                  </div>

                  <div className="size-control">
                    <button className="size-button" onClick={() => handleSizeChange(false)}>
                      -
                    </button>
                    <span className="size-value">{imageSize}%</span>
                    <button className="size-button" onClick={() => handleSizeChange(true)}>
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
                  onWheel={handleWheel}
                >
                  <img
                    src="/images/eye.jpeg"
                    alt={`${selectedEye === 'left' ? '좌안' : '우안'} 안저 이미지`}
                    style={{
                      transform: `scale(${Math.round(imageSize) / 100}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                      transformOrigin: 'center center'
                    }}
                    draggable={false}
                  />
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      transform: `scale(${Math.round(imageSize) / 100}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                      transformOrigin: 'center center',
                      pointerEvents: 'auto'
                    }}
                  />
                </div>
              </div>

              <div className="final-diagnosis-right">
                <div className="severity-confirmation">
                  <h4>좌안 중증도 확정</h4>
                  <div className="severity-options">
                    <div
                      className={`severity-option ${selectedSeverity === 'mild' ? 'selected' : ''}`}
                      onClick={() => setSelectedSeverity('mild')}
                    >
                      비증식성 당뇨망막병증(NPDR) - Mild
                    </div>
                    <div
                      className={`severity-option ${selectedSeverity === 'severe' ? 'selected' : ''}`}
                      onClick={() => setSelectedSeverity('severe')}
                    >
                      비증식성 당뇨망막병증(NPDR) - Severe
                    </div>
                    <div
                      className={`severity-option ${selectedSeverity === 'moderate' ? 'selected' : ''}`}
                      onClick={() => setSelectedSeverity('moderate')}
                    >
                      비증식성 당뇨망막병증(NPDR) - Moderate
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
                      이상없음
                    </div>
                  </div>
                </div>

                <div className="lesion-confirmation">
                  <h4>좌안 병변 위치 확정하기</h4>
                  <p className="lesion-guide">
                    추가할 병변 목록을 클릭한 이후 사진의 픽셀을 클릭하세요.
                  </p>
                  <div className="lesion-types">
                    {lesionList.map((lesion) => (
                      <div
                        key={lesion.id}
                        className={`lesion-type ${lesion.id === currentLesion ? 'active' : ''} ${
                          selectedLesions.includes(lesion.id) ? 'selected' : ''
                        } ${
                          lesion.id === 'retinal'
                            ? 'red'
                            : lesion.id === 'vitreous'
                            ? 'purple'
                            : lesion.id === 'preretinal'
                            ? 'pink'
                            : lesion.id === 'micro'
                            ? 'green'
                            : lesion.id === 'exudates'
                            ? 'blue'
                            : 'sky'
                        }`}
                        onClick={() => handleLesionSelect(lesion.id)}
                      >
                        <span className="color-dot"></span>
                        {lesion.name}
                        {selectedPixels[lesion.id]?.length > 0 && (
                          <span className="segment-count">
                            ({selectedPixels[lesion.id].length})
                          </span>
                        )}
                      </div>
                    ))}
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

  // 최종 렌더
  return (
    <div className="analysis-container">
      <div className="analysis-layout">
        {/* 사이드바 */}
        <div className="step-sidebar">
          {steps.map((step) => {
            const isActive = currentStep === step.number;
            return (
              <div key={step.number} className={`step-item ${isActive ? 'active' : ''}`}>
                <div className="step-header">
                  <div className={`step-number ${isActive ? 'active' : ''}`}>{step.number}</div>
                  <span className="step-title">{step.title}</span>
                </div>
                {isActive && step.subItems.length > 0 && (
                  <div className="step-subitems">
                    {step.subItems.map((item, index) => {
                      const isLeftEye = item.includes('좌안');
                      const isRightEye = item.includes('우안');
                      const isSelected =
                        (isLeftEye && selectedEye === 'left') ||
                        (isRightEye && selectedEye === 'right');

                      return (
                        <div key={index} className={`subitem ${isSelected ? 'selected' : ''}`}>
                          • {item}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="main-content">{renderStep()}</div>
      </div>
    </div>
  );
};

export default Analysis;
