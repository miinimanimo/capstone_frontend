import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Analysis.css';

interface Patient {
  name: string;
  code: string;
}

const Analysis: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [eyeStatus, setEyeStatus] = useState({
    step1: {
      left: false,
      right: false,
    },
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
  
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [showAIDetection, setShowAIDetection] = useState<boolean>(false);
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

  // 환자 검색 관련 상태
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // 이미지 업로드 관련 상태
  const [leftEyeImage, setLeftEyeImage] = useState<string | null>(null);
  const [rightEyeImage, setRightEyeImage] = useState<string | null>(null);

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

    if (!showGrid) {
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
  }, [selectedPixels, showGrid, currentLesion]);

  // 픽셀 선택 처리
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentLesion || !showGrid) return;

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
  }, [currentLesion, showGrid]);

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
        const step2Confirmed = eyeStatus.step2.left && eyeStatus.step2.right;
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
              className={`step-button next ${!step2Confirmed ? 'disabled' : ''}`} 
              onClick={handleNext}
              disabled={!step2Confirmed}
            >
              다음 단계
            </button>
          </div>
        );
      case 3:
        const step3Confirmed = eyeStatus.step3.left && eyeStatus.step3.right;
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
            <button 
              className={`step-button next ${!step3Confirmed ? 'disabled' : ''}`}
              onClick={handleNext}
              disabled={!step3Confirmed}
            >
              완료하기
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  // 환자 검색 핸들러
  const handleSearch = () => {
    // 검색어 입력 여부와 관계없이 환자 정보 표시
    setSelectedPatient({
      name: '장석민',
      code: 'jg0103'
    });
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, eye: 'left' | 'right') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (eye === 'left') {
          setLeftEyeImage(reader.result as string);
          setEyeStatus(prev => ({
            ...prev,
            step1: {
              ...prev.step1,
              left: true
            }
          }));
        } else {
          setRightEyeImage(reader.result as string);
          setEyeStatus(prev => ({
            ...prev,
            step1: {
              ...prev.step1,
              right: true
            }
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 10) 단계별 메인 내용 렌더링
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <div className="patient-info-header">
              {!selectedPatient ? (
                <h2>환자 검색하기</h2>
              ) : null}
              {!selectedPatient && (
                <div className="search-container">
                  <div className="search-icon">
                    <svg width="76" height="76" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M48.3964 21.9224C48.8101 21.5086 49.0426 20.9475 49.0426 20.3624C49.0426 19.7773 48.8101 19.2161 48.3964 18.8024C47.9827 18.3887 47.4215 18.1563 46.8364 18.1562C46.2513 18.1562 45.6902 18.3887 45.2764 18.8024L24.8028 39.2805L17.5493 32.0226C17.3445 31.8177 17.1013 31.6552 16.8336 31.5444C16.5659 31.4335 16.2791 31.3764 15.9893 31.3764C15.6996 31.3764 15.4128 31.4335 15.1451 31.5444C14.8774 31.6552 14.6342 31.8177 14.4294 32.0226C14.2245 32.2274 14.062 32.4707 13.9511 32.7383C13.8403 33.006 13.7832 33.2929 13.7832 33.5826C13.7832 33.8723 13.8403 34.1592 13.9511 34.4268C14.062 34.6945 14.2245 34.9377 14.4294 35.1426L23.2428 43.956C23.4475 44.1612 23.6906 44.324 23.9583 44.4351C24.226 44.5461 24.513 44.6033 24.8028 44.6033C25.0926 44.6033 25.3796 44.5461 25.6473 44.4351C25.915 44.324 26.1581 44.1612 26.3628 43.956L48.3964 21.9224Z" fill="#4200FF"/>
                      <path d="M12.3872 0.53125C10.8351 0.53125 9.29825 0.836954 7.86432 1.43091C6.43039 2.02486 5.1275 2.89543 4.03002 3.99291C1.81355 6.20937 0.568359 9.21554 0.568359 12.3501V50.4066C0.568359 56.9373 5.85643 62.2254 12.3872 62.2254H40.4492C40.7797 60.5949 41.4672 59.0966 42.4322 57.8187H12.3872C10.4214 57.8187 8.53608 57.0378 7.14604 55.6477C5.756 54.2577 4.97508 52.3724 4.97508 50.4066V12.3501C4.97508 8.25624 8.29335 4.93797 12.3872 4.93797H50.4437C54.5375 4.93797 57.8558 8.25624 57.8558 12.3501V31.5634C59.3145 31.3185 60.8038 31.3185 62.2625 31.5634V12.3501C62.2625 5.81932 56.9744 0.53125 50.4437 0.53125H12.3872Z" fill="#4200FF"/>
                      <path d="M68.8737 44.5986C68.8737 46.9361 67.9451 49.1778 66.2923 50.8307C64.6395 52.4835 62.3977 53.4121 60.0603 53.4121C57.7228 53.4121 55.481 52.4835 53.8282 50.8307C52.1754 49.1778 51.2468 46.9361 51.2468 44.5986C51.2468 42.2611 52.1754 40.0194 53.8282 38.3666C55.481 36.7137 57.7228 35.7852 60.0603 35.7852C62.3977 35.7852 64.6395 36.7137 66.2923 38.3666C67.9451 40.0194 68.8737 42.2611 68.8737 44.5986ZM75.4838 64.4289C75.4838 69.9152 71.0771 75.4457 60.0603 75.4457C49.0434 75.4457 44.6367 69.9373 44.6367 64.4289C44.6367 62.6758 45.3331 60.9945 46.5728 59.7548C47.8124 58.5152 49.4937 57.8188 51.2468 57.8188H68.8737C70.6268 57.8188 72.3081 58.5152 73.5477 59.7548C74.7874 60.9945 75.4838 62.6758 75.4838 64.4289Z" fill="#4200FF"/>
                    </svg>
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
                  <div className="info-icon">
                  <svg width="76" height="76" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M48.3964 21.9224C48.8101 21.5086 49.0426 20.9475 49.0426 20.3624C49.0426 19.7773 48.8101 19.2161 48.3964 18.8024C47.9827 18.3887 47.4215 18.1563 46.8364 18.1562C46.2513 18.1562 45.6902 18.3887 45.2764 18.8024L24.8028 39.2805L17.5493 32.0226C17.3445 31.8177 17.1013 31.6552 16.8336 31.5444C16.5659 31.4335 16.2791 31.3764 15.9893 31.3764C15.6996 31.3764 15.4128 31.4335 15.1451 31.5444C14.8774 31.6552 14.6342 31.8177 14.4294 32.0226C14.2245 32.2274 14.062 32.4707 13.9511 32.7383C13.8403 33.006 13.7832 33.2929 13.7832 33.5826C13.7832 33.8723 13.8403 34.1592 13.9511 34.4268C14.062 34.6945 14.2245 34.9377 14.4294 35.1426L23.2428 43.956C23.4475 44.1612 23.6906 44.324 23.9583 44.4351C24.226 44.5461 24.513 44.6033 24.8028 44.6033C25.0926 44.6033 25.3796 44.5461 25.6473 44.4351C25.915 44.324 26.1581 44.1612 26.3628 43.956L48.3964 21.9224Z" fill="#4200FF"/>
                    <path d="M12.3872 0.53125C10.8351 0.53125 9.29825 0.836954 7.86432 1.43091C6.43039 2.02486 5.1275 2.89543 4.03002 3.99291C1.81355 6.20937 0.568359 9.21554 0.568359 12.3501V50.4066C0.568359 56.9373 5.85643 62.2254 12.3872 62.2254H40.4492C40.7797 60.5949 41.4672 59.0966 42.4322 57.8187H12.3872C10.4214 57.8187 8.53608 57.0378 7.14604 55.6477C5.756 54.2577 4.97508 52.3724 4.97508 50.4066V12.3501C4.97508 8.25624 8.29335 4.93797 12.3872 4.93797H50.4437C54.5375 4.93797 57.8558 8.25624 57.8558 12.3501V31.5634C59.3145 31.3185 60.8038 31.3185 62.2625 31.5634V12.3501C62.2625 5.81932 56.9744 0.53125 50.4437 0.53125H12.3872Z" fill="#4200FF"/>
                    <path d="M68.8737 44.5986C68.8737 46.9361 67.9451 49.1778 66.2923 50.8307C64.6395 52.4835 62.3977 53.4121 60.0603 53.4121C57.7228 53.4121 55.481 52.4835 53.8282 50.8307C52.1754 49.1778 51.2468 46.9361 51.2468 44.5986C51.2468 42.2611 52.1754 40.0194 53.8282 38.3666C55.481 36.7137 57.7228 35.7852 60.0603 35.7852C62.3977 35.7852 64.6395 36.7137 66.2923 38.3666C67.9451 40.0194 68.8737 42.2611 68.8737 44.5986ZM75.4838 64.4289C75.4838 69.9152 71.0771 75.4457 60.0603 75.4457C49.0434 75.4457 44.6367 69.9373 44.6367 64.4289C44.6367 62.6758 45.3331 60.9945 46.5728 59.7548C47.8124 58.5152 49.4937 57.8188 51.2468 57.8188H68.8737C70.6268 57.8188 72.3081 58.5152 73.5477 59.7548C74.7874 60.9945 75.4838 62.6758 75.4838 64.4289Z" fill="#4200FF"/>
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

                <div className="upload-section">
                  <div className="upload-container">
                    <span className="upload-label">왼쪽 안저 사진</span>
                    <div className="upload-box">
                      {leftEyeImage ? (
                        <img src={leftEyeImage} alt="왼쪽 안저 사진" />
                      ) : (
                        <div className="upload-placeholder">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 8v8m-4-4h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <label className="upload-button">
                      업로드하기
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'left')}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  <div className="upload-container">
                    <span className="upload-label">오른쪽 안저 사진</span>
                    <div className="upload-box">
                      {rightEyeImage ? (
                        <img src={rightEyeImage} alt="오른쪽 안저 사진" />
                      ) : (
                        <div className="upload-placeholder">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 8v8m-4-4h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <label className="upload-button">
                      업로드하기
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'right')}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>

                <button
                  className="analyze-button"
                  onClick={() => {
                    if (leftEyeImage && rightEyeImage) {
                      setCurrentStep(2);
                    }
                  }}
                  disabled={!leftEyeImage || !rightEyeImage}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.9641 11.9336C20.9641 16.9555 16.9238 21 11.9047 21C6.88571 21 2.84546 16.9555 2.84546 11.9336C2.84546 6.91174 6.88571 2.86719 11.9047 2.86719C16.9238 2.86719 20.9641 6.91174 20.9641 11.9336Z" stroke="white" strokeWidth="1.5"/>
                    <path d="M15.4039 14.3974L15.2655 14.5533C15.1348 14.7092 14.9117 14.7638 14.7269 14.6805L13.3499 14.1125C12.8417 13.9177 12.4527 13.4591 12.334 12.9122C12.3183 12.8083 12.2547 12.7171 12.164 12.6665L8.47036 10.634C8.33446 10.5527 8.16559 10.5904 8.06863 10.7173L7.01672 12.1028C6.93133 12.2133 6.7842 12.2563 6.65456 12.202L3.95489 10.947C3.75693 10.8577 3.6949 10.6088 3.81508 10.4373L7.9465 4.61107C8.06039 4.4473 8.27989 4.40253 8.45505 4.51558L15.4039 8.89249C16.1994 9.39131 16.1994 10.614 15.4039 11.1128L12.72 12.823C12.5996 12.9002 12.5516 13.0546 12.6011 13.1897L13.5132 16.027C13.5746 16.195 13.522 16.3824 13.3818 16.4991L11.9265 17.7179C11.7175 17.8938 11.3929 17.7593 11.3595 17.4915L11.0779 15.1801C11.0509 14.9792 10.8627 14.8311 10.6615 14.8311H9.25758C9.08453 14.8311 8.94551 14.9448 8.89927 15.1089L8.34944 17.1047C8.29375 17.3041 8.09579 17.4366 7.89469 17.3997L6.2835 17.1081C6.06411 17.0672 5.94603 16.8337 6.06307 16.6478L7.66799 14.1908C7.76232 14.036 7.7299 13.8332 7.58769 13.719L3.73076 10.6701" stroke="white" strokeWidth="1.5"/>
                  </svg>
                  AI 분석하기
                </button>
              </div>
            )}
          </div>
        );
      case 2:
        const step2Confirmed = eyeStatus.step2.left && eyeStatus.step2.right;
        return (
          <div className="step-content step-2">
            <div className="patient-info-header">
              <div className="info-group">
                <div className="info-icon">
                  <svg width="24" height="24" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M48.3964 21.9224C48.8101 21.5086 49.0426 20.9475 49.0426 20.3624C49.0426 19.7773 48.8101 19.2161 48.3964 18.8024C47.9827 18.3887 47.4215 18.1563 46.8364 18.1562C46.2513 18.1562 45.6902 18.3887 45.2764 18.8024L24.8028 39.2805L17.5493 32.0226C17.3445 31.8177 17.1013 31.6552 16.8336 31.5444C16.5659 31.4335 16.2791 31.3764 15.9893 31.3764C15.6996 31.3764 15.4128 31.4335 15.1451 31.5444C14.8774 31.6552 14.6342 31.8177 14.4294 32.0226C14.2245 32.2274 14.062 32.4707 13.9511 32.7383C13.8403 33.006 13.7832 33.2929 13.7832 33.5826C13.7832 33.8723 13.8403 34.1592 13.9511 34.4268C14.062 34.6945 14.2245 34.9377 14.4294 35.1426L23.2428 43.956C23.4475 44.1612 23.6906 44.324 23.9583 44.4351C24.226 44.5461 24.513 44.6033 24.8028 44.6033C25.0926 44.6033 25.3796 44.5461 25.6473 44.4351C25.915 44.324 26.1581 44.1612 26.3628 43.956L48.3964 21.9224Z" fill="#4200FF"/>
                    <path d="M12.3872 0.53125C10.8351 0.53125 9.29825 0.836954 7.86432 1.43091C6.43039 2.02486 5.1275 2.89543 4.03002 3.99291C1.81355 6.20937 0.568359 9.21554 0.568359 12.3501V50.4066C0.568359 56.9373 5.85643 62.2254 12.3872 62.2254H40.4492C40.7797 60.5949 41.4672 59.0966 42.4322 57.8187H12.3872C10.4214 57.8187 8.53608 57.0378 7.14604 55.6477C5.756 54.2577 4.97508 52.3724 4.97508 50.4066V12.3501C4.97508 8.25624 8.29335 4.93797 12.3872 4.93797H50.4437C54.5375 4.93797 57.8558 8.25624 57.8558 12.3501V31.5634C59.3145 31.3185 60.8038 31.3185 62.2625 31.5634V12.3501C62.2625 5.81932 56.9744 0.53125 50.4437 0.53125H12.3872Z" fill="#4200FF"/>
                    <path d="M68.8737 44.5986C68.8737 46.9361 67.9451 49.1778 66.2923 50.8307C64.6395 52.4835 62.3977 53.4121 60.0603 53.4121C57.7228 53.4121 55.481 52.4835 53.8282 50.8307C52.1754 49.1778 51.2468 46.9361 51.2468 44.5986C51.2468 42.2611 52.1754 40.0194 53.8282 38.3666C55.481 36.7137 57.7228 35.7852 60.0603 35.7852C62.3977 35.7852 64.6395 36.7137 66.2923 38.3666C67.9451 40.0194 68.8737 42.2611 68.8737 44.5986ZM75.4838 64.4289C75.4838 69.9152 71.0771 75.4457 60.0603 75.4457C49.0434 75.4457 44.6367 69.9373 44.6367 64.4289C44.6367 62.6758 45.3331 60.9945 46.5728 59.7548C47.8124 58.5152 49.4937 57.8188 51.2468 57.8188H68.8737C70.6268 57.8188 72.3081 58.5152 73.5477 59.7548C74.7874 60.9945 75.4838 62.6758 75.4838 64.4289Z" fill="#4200FF"/>
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
                  className={`step-button next ${!step2Confirmed ? 'disabled' : ''}`} 
                  onClick={handleNext}
                  disabled={!step2Confirmed}
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
                  <img src="https://miinimanimo.github.io/capstone_frontend/images/ig.jpeg" alt="Interest Region" />
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
                    src="https://miinimanimo.github.io/capstone_frontend/images/eye.jpeg"
                    alt={`${selectedEye === 'left' ? '좌안' : '우안'} 안저 이미지`}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        const step3Confirmed = eyeStatus.step3.left && eyeStatus.step3.right;
        return (
          <div className="step-content step-3">
            <div className="patient-info-header">
              <div className="info-group">
                <div className="info-icon">
                  <svg width="24" height="24" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M48.3964 21.9224C48.8101 21.5086 49.0426 20.9475 49.0426 20.3624C49.0426 19.7773 48.8101 19.2161 48.3964 18.8024C47.9827 18.3887 47.4215 18.1563 46.8364 18.1562C46.2513 18.1562 45.6902 18.3887 45.2764 18.8024L24.8028 39.2805L17.5493 32.0226C17.3445 31.8177 17.1013 31.6552 16.8336 31.5444C16.5659 31.4335 16.2791 31.3764 15.9893 31.3764C15.6996 31.3764 15.4128 31.4335 15.1451 31.5444C14.8774 31.6552 14.6342 31.8177 14.4294 32.0226C14.2245 32.2274 14.062 32.4707 13.9511 32.7383C13.8403 33.006 13.7832 33.2929 13.7832 33.5826C13.7832 33.8723 13.8403 34.1592 13.9511 34.4268C14.062 34.6945 14.2245 34.9377 14.4294 35.1426L23.2428 43.956C23.4475 44.1612 23.6906 44.324 23.9583 44.4351C24.226 44.5461 24.513 44.6033 24.8028 44.6033C25.0926 44.6033 25.3796 44.5461 25.6473 44.4351C25.915 44.324 26.1581 44.1612 26.3628 43.956L48.3964 21.9224Z" fill="#4200FF"/>
                    <path d="M12.3872 0.53125C10.8351 0.53125 9.29825 0.836954 7.86432 1.43091C6.43039 2.02486 5.1275 2.89543 4.03002 3.99291C1.81355 6.20937 0.568359 9.21554 0.568359 12.3501V50.4066C0.568359 56.9373 5.85643 62.2254 12.3872 62.2254H40.4492C40.7797 60.5949 41.4672 59.0966 42.4322 57.8187H12.3872C10.4214 57.8187 8.53608 57.0378 7.14604 55.6477C5.756 54.2577 4.97508 52.3724 4.97508 50.4066V12.3501C4.97508 8.25624 8.29335 4.93797 12.3872 4.93797H50.4437C54.5375 4.93797 57.8558 8.25624 57.8558 12.3501V31.5634C59.3145 31.3185 60.8038 31.3185 62.2625 31.5634V12.3501C62.2625 5.81932 56.9744 0.53125 50.4437 0.53125H12.3872Z" fill="#4200FF"/>
                    <path d="M68.8737 44.5986C68.8737 46.9361 67.9451 49.1778 66.2923 50.8307C64.6395 52.4835 62.3977 53.4121 60.0603 53.4121C57.7228 53.4121 55.481 52.4835 53.8282 50.8307C52.1754 49.1778 51.2468 46.9361 51.2468 44.5986C51.2468 42.2611 52.1754 40.0194 53.8282 38.3666C55.481 36.7137 57.7228 35.7852 60.0603 35.7852C62.3977 35.7852 64.6395 36.7137 66.2923 38.3666C67.9451 40.0194 68.8737 42.2611 68.8737 44.5986ZM75.4838 64.4289C75.4838 69.9152 71.0771 75.4457 60.0603 75.4457C49.0434 75.4457 44.6367 69.9373 44.6367 64.4289C44.6367 62.6758 45.3331 60.9945 46.5728 59.7548C47.8124 58.5152 49.4937 57.8188 51.2468 57.8188H68.8737C70.6268 57.8188 72.3081 58.5152 73.5477 59.7548C74.7874 60.9945 75.4838 62.6758 75.4838 64.4289Z" fill="#4200FF"/>
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
                <button 
                  className={`step-button next ${!step3Confirmed ? 'disabled' : ''}`}
                  onClick={handleNext}
                  disabled={!step3Confirmed}
                >
                  완료하기
                </button>
              </div>
            </div>

            <div className="final-diagnosis-container">
              <div className="final-diagnosis-left">
                <div className="toggle-controls">
                  <div className="toggle-group">
                    <span className="toggle-text">AI 병변 포착</span>
                    <div
                      className={`toggle-switch ${showAIDetection ? 'active' : ''}`}
                      onClick={() => setShowAIDetection(!showAIDetection)}
                    >
                      <span className="toggle-slider"></span>
                    </div>
                    <span className="toggle-text">{showAIDetection ? 'ON' : 'OFF'}</span>
                  </div>

                  <div className="toggle-group">
                    <span className="toggle-text">Grid로 보기</span>
                    <div
                      className={`toggle-switch ${showGrid ? 'active' : ''}`}
                      onClick={() => setShowGrid(!showGrid)}
                    >
                      <span className="toggle-slider"></span>
                    </div>
                    <span className="toggle-text">{showGrid ? 'ON' : 'OFF'}</span>
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
                    src="https://miinimanimo.github.io/capstone_frontend/images/eye.jpeg"
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
