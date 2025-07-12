import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Analysis.css';
import { storage } from '../../firebase';
import { ref, getDownloadURL } from 'firebase/storage';
import StepIndicator from './components/StepIndicator';
import Step1Upload from './components/Step1Upload';
import Step2AIResult from './components/Step2AIResult';
import Step3FinalConfirm from './components/Step3FinalConfirm';

interface Patient {
  name: string;
  code: string;
}

interface SuperpixelData {
  imageInfo: {
    width: number;
    height: number;
    filename: string;
  };
  slicResult: {
    labels: number[][];
    numSuperpixels: number;
  };
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
  const [showSuperpixel, setShowSuperpixel] = useState<boolean>(false);
  const imageRef = React.useRef<HTMLDivElement>(null);

  // 중증도 선택
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  // 병변 선택
  const [selectedLesions, setSelectedLesions] = useState<string[]>([]);
  const [allSelected, setAllSelected] = useState<boolean>(false);

  // Grid로
  // 중심점 기준 offset(dx, dy)로 저장
  // 5x5 픽셀 단위로 선택 정보를 저장
  const PIXEL_UNIT = 5;
  const [selectedPixels, setSelectedPixels] = useState<{ [key: string]: Array<{ dx: number, dy: number }> }>({});
  const [currentLesion, setCurrentLesion] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 환자 검색 관련 상태
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // 이미지 업로드 관련 상태
  const [leftEyeImage, setLeftEyeImage] = useState<string | null>(null);
  const [rightEyeImage, setRightEyeImage] = useState<string | null>(null);
  const leftEyeInputRef = useRef<HTMLInputElement>(null);
  const rightEyeInputRef = useRef<HTMLInputElement>(null);

  // 각 업로드 영역 호버 상태
  const [isHoveringLeftEyeDropzone, setIsHoveringLeftEyeDropzone] = useState<boolean>(false);
  const [isHoveringRightEyeDropzone, setIsHoveringRightEyeDropzone] = useState<boolean>(false);

  // Superpixel 관련 상태
  const [superpixelData, setSuperpixelData] = useState<SuperpixelData | null>(null);
  const [selectedSuperpixels, setSelectedSuperpixels] = useState<{[key: string]: number[]}>({});

  // 원본 이미지 크기 저장
  const [originalImageSize, setOriginalImageSize] = useState<{width: number, height: number} | null>(null);

  const justDraggedRef = useRef(false); // 드래그 직후 클릭 방지용 ref

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
      // 3단계에서 2단계로 돌아갈 때 상태 초기화
      setImagePosition({ x: 0, y: 0 });
      setImageSize(100);
      setShowSuperpixel(false);
      setShowGrid(false);
      setSelectedPixels({});
      setSelectedSuperpixels({});
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

  // 셀 크기 단계별 값
  const cellSizeSteps = [5, 10, 15, 20, 25, 30];
  const [cellSizeStep, setCellSizeStep] = useState<number>(1); // 0~4
  const cellSize = cellSizeSteps[cellSizeStep];

  // 셀 크기 단계 조절 핸들러
  const handleCellSizeInc = () => setCellSizeStep((prev) => Math.min(prev + 1, cellSizeSteps.length - 1));
  const handleCellSizeDec = () => setCellSizeStep((prev) => Math.max(prev - 1, 0));

  // 두께 0.1 단위 증감
  const [gridLineWidth, setGridLineWidth] = useState<number>(0.3);
  const handleGridLineWidthInc = () => setGridLineWidth((prev) => Math.min(Number((prev + 0.1).toFixed(1)), 10));
  const handleGridLineWidthDec = () => setGridLineWidth((prev) => Math.max(Number((prev - 0.1).toFixed(1)), 0.1));

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
    justDraggedRef.current = true;
    setTimeout(() => {
      justDraggedRef.current = false;
    }, 0); // 다음 이벤트 루프에서 false로 설정
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

  const handleSelectAll = () => {
    if (allSelected) {
      // 모든 선택 해제
      setSelectedLesions([]);
      setAllSelected(false);
    } else {
      // 모든 병변 선택
      const allLesionIds = lesionList.map(lesion => lesion.id);
      setSelectedLesions(allLesionIds);
      setAllSelected(true);
    }
  };

  // 7) 마우스 휠로 이미지 확대/축소
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (currentStep === 3) {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      setImageSize(prevSize => {
        const newSize = prevSize + (delta * 10);
        return Math.max(50, Math.round(newSize));
      });
    }
  }, [currentStep]);

  // 8) 컴포넌트 마운트/언마운트 시 wheel 이벤트 처리
  useEffect(() => {
    const mainEyeImage = imageRef.current;
    if (!mainEyeImage || currentStep !== 3) return;

    const handleWheelEvent = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      setImageSize(prevSize => {
        const newSize = prevSize + (delta * 10);
        return Math.max(50, Math.round(newSize));
      });
    };

    mainEyeImage.addEventListener('wheel', handleWheelEvent, { passive: false });

    return () => {
      mainEyeImage.removeEventListener('wheel', handleWheelEvent);
    };
  }, [currentStep]);

  // SLIC 데이터 로드
  useEffect(() => {
    const loadSuperpixelData = async () => {
      try {
        // Firebase Storage에서 JSON 파일 URL 가져오기
        const fileRef = ref(storage, 'slic_test_data.json');
        const url = await getDownloadURL(fileRef);
        
        // URL로 JSON 파일 불러오기
        const response = await fetch(url, {
          mode: 'cors'
        });
        const data = await response.json();
        setSuperpixelData(data);
        console.log('Superpixel data loaded successfully');
      } catch (error) {
        console.error('Error loading superpixel data:', error);
      }
    };

    loadSuperpixelData();
  }, []);

  // 이미지 로드 핸들러
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setOriginalImageSize({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
  };

  // Grid와 Superpixel 그리기 함수
  const drawCanvas = useCallback(() => {
    // 디버깅용 로그
    console.log('[drawCanvas 호출]', {
      currentLesion,
      selectedSuperpixels,
      showSuperpixel,
      superpixelDataLoaded: !!superpixelData
    });
    const canvas = canvasRef.current;
    const container = imageRef.current;
    if (!canvas || !container) return;

    // 컨테이너 크기에 맞춰 캔버스 크기 설정
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (showGrid) {
      // [추가] SLIC 스타일 초기화 (그리드 모드 진입 시)
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.transform = '';
      canvas.style.transformOrigin = '';
      // 확대/이동 적용
      ctx.setTransform(1, 0, 0, 1, 0, 0); // 초기화
      const zoomScale = imageSize / 100;
      ctx.translate(canvas.width / 2, canvas.height / 2); // 중심 이동
      ctx.scale(zoomScale, zoomScale); // 확대
      ctx.translate(imagePosition.x, imagePosition.y); // 이동
      ctx.translate(-canvas.width / 2, -canvas.height / 2); // 다시 원점

      // 중심 기준 그리드 그리기 (cellSize 사용)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      // 셀 개수 계산 (캔버스 크기/cellSize, 홀수로 맞춤)
      const gridCountX = Math.ceil(canvas.width / cellSize);
      const gridCountY = Math.ceil(canvas.height / cellSize);
      const halfX = Math.floor(gridCountX / 2);
      const halfY = Math.floor(gridCountY / 2);

      // 병변 픽셀 그리기 (중앙 기준)
      Object.entries(selectedPixels).forEach(([lesionId, pixels]) => {
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

        // 현재 셀 크기(cellSize)로 그리드 셀을 돌면서, 셀 내부에 선택된 5x5 픽셀이 하나라도 있으면 색칠
        pixels.forEach(({ dx, dy }) => {
          const x = centerX + dx * PIXEL_UNIT;
          const y = centerY + dy * PIXEL_UNIT;
          ctx.fillRect(x, y, PIXEL_UNIT, PIXEL_UNIT);
        });
      });

      // 그리드 라인 그리기 (중심 기준, cellSize)
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = gridLineWidth;
      for (let i = -halfX; i <= gridCountX - halfX; i++) {
        // 세로 라인
        ctx.beginPath();
        ctx.moveTo(centerX + i * cellSize, 0);
        ctx.lineTo(centerX + i * cellSize, canvas.height);
        ctx.stroke();
      }
      for (let i = -halfY; i <= gridCountY - halfY; i++) {
        // 가로 라인
        ctx.beginPath();
        ctx.moveTo(0, centerY + i * cellSize);
        ctx.lineTo(canvas.width, centerY + i * cellSize);
        ctx.stroke();
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    if (showSuperpixel && superpixelData && originalImageSize) {
      const { labels } = superpixelData.slicResult;
      const { width: slicWidth, height: slicHeight } = superpixelData.imageInfo;
      
      const imageElement = container?.querySelector('img');
      if (!imageElement) return;

      const containerRect = container.getBoundingClientRect();
      const zoomScale = imageSize / 100;

      // 이미지의 실제 스케일 계산
      const containerAspectRatio = containerRect.width / containerRect.height;
      const imageAspectRatio = originalImageSize.width / originalImageSize.height;
      
      let scaledWidth, scaledHeight;
      if (containerAspectRatio > imageAspectRatio) {
        // 세로에 맞춤
        scaledHeight = containerRect.height;
        scaledWidth = scaledHeight * imageAspectRatio;
      } else {
        // 가로에 맞춤
        scaledWidth = containerRect.width;
        scaledHeight = scaledWidth / imageAspectRatio;
      }

      // 캔버스 크기 설정 (기본 크기)
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;

      // 캔버스 스타일 설정
      canvas.style.position = 'absolute';
      canvas.style.top = '50%';
      canvas.style.left = '50%';
      canvas.style.width = `${scaledWidth}px`;
      canvas.style.height = `${scaledHeight}px`;
      canvas.style.transform = `translate(-50%, -50%) scale(${zoomScale}) translate(${imagePosition.x}px, ${imagePosition.y}px)`;
      canvas.style.transformOrigin = 'center';

      // 디버깅을 위한 크기 정보 출력
      console.log('SLIC 크기:', { slicWidth, slicHeight });
      console.log('원본 이미지 크기:', originalImageSize);
      console.log('컨테이너 크기:', { width: containerRect.width, height: containerRect.height });
      console.log('스케일된 크기:', { width: scaledWidth, height: scaledHeight });
      console.log('Zoom level:', zoomScale);
      console.log('Image position:', imagePosition);

      // 컨텍스트 초기화
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 좌표 변환 설정
      const scaleX = scaledWidth / slicWidth;
      const scaleY = scaledHeight / slicHeight;
      ctx.scale(scaleX, scaleY);

      // 선택된 수퍼픽셀 그리기
      Object.entries(selectedSuperpixels).forEach(([lesionId, superpixelIndices]) => {
        const opacity = lesionId === currentLesion ? 0.5 : 0.3;
        
        switch (lesionId) {
          case 'retinal':
            ctx.fillStyle = `rgba(239, 68, 68, ${opacity})`;
            break;
          case 'vitreous':
            ctx.fillStyle = `rgba(147, 51, 234, ${opacity})`;
            break;
          case 'preretinal':
            ctx.fillStyle = `rgba(236, 72, 153, ${opacity})`;
            break;
          case 'micro':
            ctx.fillStyle = `rgba(16, 185, 129, ${opacity})`;
            break;
          case 'exudates':
            ctx.fillStyle = `rgba(59, 130, 246, ${opacity})`;
            break;
          case 'cotton':
            ctx.fillStyle = `rgba(0, 150, 199, ${opacity})`;
            break;
          default:
            ctx.fillStyle = `rgba(75, 25, 229, ${opacity})`;
        }

        // 선택된 수퍼픽셀 채우기
        for (let y = 0; y < slicHeight; y++) {
          let currentBatch: { startX: number; width: number; } | null = null;

          for (let x = 0; x < slicWidth; x++) {
            const label = labels[y][x];
            
            // 배경(-1)이 아니고 선택된 수퍼픽셀인 경우에만 처리
            if (label !== -1 && superpixelIndices.includes(label)) {
              if (!currentBatch) {
                currentBatch = { startX: x, width: 1 };
              } else {
                currentBatch.width++;
              }
            } else if (currentBatch) {
              // 배치 그리기
              ctx.fillRect(currentBatch.startX, y, currentBatch.width, 1);
              currentBatch = null;
            }
          }

          // 행의 마지막 배치 처리
          if (currentBatch) {
            ctx.fillRect(currentBatch.startX, y, currentBatch.width, 1);
          }
        }
      });

      // 수퍼픽셀 경계선 그리기
      // 줌이 커질수록 경계선은 얇아지고 투명해짐
      const lineWidth = Math.max(0.3, 1 / zoomScale);
      const opacity = Math.max(0.25, 0.4 / Math.sqrt(zoomScale));  // 제곱근을 사용하여 투명도가 너무 빨리 감소하지 않도록 함
      
      ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
      ctx.lineWidth = lineWidth;

      for (let y = 0; y < slicHeight - 1; y++) {
        for (let x = 0; x < slicWidth - 1; x++) {
          const currentLabel = labels[y][x];
          
          // 배경(-1)이 아닌 경우에만 경계선 그리기
          if (currentLabel !== -1) {
            const rightLabel = labels[y][x + 1];
            const bottomLabel = labels[y + 1][x];

            if (rightLabel !== -1 && currentLabel !== rightLabel) {
              ctx.beginPath();
              ctx.moveTo(x + 1, y);
              ctx.lineTo(x + 1, y + 1);
              ctx.stroke();
            }

            if (bottomLabel !== -1 && currentLabel !== bottomLabel) {
              ctx.beginPath();
              ctx.moveTo(x, y + 1);
              ctx.lineTo(x + 1, y + 1);
              ctx.stroke();
            }
          }
        }
      }

      // transform 초기화
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  }, [showGrid, showSuperpixel, selectedPixels, selectedSuperpixels, currentLesion, superpixelData, originalImageSize, imageSize, imagePosition, cellSize, gridLineWidth]);

  // 캔버스 클릭 핸들러 수정
  const handleCanvasClick = useCallback((e: any) => {
    console.log('[handleCanvasClick 진입]');
    if (e.preventDefault && typeof e.preventDefault === 'function') e.preventDefault();
    if (e.stopPropagation && typeof e.stopPropagation === 'function') e.stopPropagation();
    if (justDraggedRef.current) return; // 드래그 직후 클릭 방지
    if (!currentLesion) return;
    if (!showGrid && !showSuperpixel) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (showGrid) {
      const zoomScale = imageSize / 100;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // 확대/축소 및 이동을 역으로 계산하여 실제 그리드 좌표를 찾음
      const transformedX = (clickX - cx) / zoomScale - imagePosition.x + cx;
      const transformedY = (clickY - cy) / zoomScale - imagePosition.y + cy;
      
      const gridCountX = Math.ceil(canvas.width / cellSize);
      const gridCountY = Math.ceil(canvas.height / cellSize);
      const halfX = Math.floor(gridCountX / 2);
      const halfY = Math.floor(gridCountY / 2);
      
      const startX = cx - halfX * cellSize;
      const startY = cy - halfY * cellSize;

      // 중앙 기준 좌표계를 그리드 인덱스로 변환
      const col = Math.floor((transformedX - startX) / cellSize);
      const row = Math.floor((transformedY - startY) / cellSize);
      if (col >= 0 && col < gridCountX && row >= 0 && row < gridCountY) {
        // 이 셀에 포함된 5x5 픽셀들의 dx, dy 목록 생성
        const dx0 = (col - halfX) * (cellSize / PIXEL_UNIT);
        const dy0 = (row - halfY) * (cellSize / PIXEL_UNIT);
        const newPixels: { dx: number, dy: number }[] = [];
        for (let py = 0; py < cellSize / PIXEL_UNIT; py++) {
          for (let px = 0; px < cellSize / PIXEL_UNIT; px++) {
            newPixels.push({ dx: dx0 + px, dy: dy0 + py });
          }
        }
        setSelectedPixels(prev => {
          const currentPixels = prev[currentLesion] || [];
          // 이미 이 셀의 모든 픽셀이 선택되어 있으면 해제, 아니면 추가
          const allSelected = newPixels.every(np => currentPixels.some(p => p.dx === np.dx && p.dy === np.dy));
          let updated;
          if (allSelected) {
            updated = currentPixels.filter(p => !newPixels.some(np => np.dx === p.dx && np.dy === p.dy));
          } else {
            updated = [...currentPixels, ...newPixels.filter(np => !currentPixels.some(p => p.dx === np.dx && p.dy === np.dy))];
          }
          return { ...prev, [currentLesion]: updated };
        });
      }
    }

    if (showSuperpixel && superpixelData) {
      const { width, height } = superpixelData.imageInfo;
      const { labels } = superpixelData.slicResult;

      const container = imageRef.current;
      if (!container || !originalImageSize) return;
      const containerRect = container.getBoundingClientRect();

      // drawCanvas에서와 동일하게 scaledWidth, scaledHeight 계산
      const containerAspectRatio = containerRect.width / containerRect.height;
      const imageAspectRatio = originalImageSize.width / originalImageSize.height;
      let scaledWidth, scaledHeight;
      if (containerAspectRatio > imageAspectRatio) {
        scaledHeight = containerRect.height;
        scaledWidth = scaledHeight * imageAspectRatio;
      } else {
        scaledWidth = containerRect.width;
        scaledHeight = scaledWidth / imageAspectRatio;
      }
      const zoomScale = imageSize / 100;

      // 1. 클릭 좌표를 컨테이너 기준으로 변환
      const clickX = e.clientX - containerRect.left;
      const clickY = e.clientY - containerRect.top;

      // 2. 컨테이너 중심 기준으로 변환
      let relX = clickX - containerRect.width / 2;
      let relY = clickY - containerRect.height / 2;

      // 3. zoom, imagePosition 역적용
      relX = (relX / zoomScale) - imagePosition.x;
      relY = (relY / zoomScale) - imagePosition.y;

      // 4. scaledWidth/height 기준으로 SLIC 이미지 좌표 변환
      const slicX = relX + (scaledWidth / 2);
      const slicY = relY + (scaledHeight / 2);

      const imgX = Math.floor((slicX / scaledWidth) * width);
      const imgY = Math.floor((slicY / scaledHeight) * height);

      // 디버깅 로그 추가
      console.log('[Superpixel 클릭 시도]', { x: clickX, y: clickY, imgX, imgY, width, height });

      if (imgX >= 0 && imgX < width && imgY >= 0 && imgY < height) {
        const selectedLabel = labels[imgY][imgX];
        console.log('[Superpixel 클릭] label:', selectedLabel);

        if (selectedLabel === -1) {
          console.log('[Superpixel 클릭] 배경(-1) 클릭, 무시');
          return;
        }

        setSelectedSuperpixels(prev => {
          const currentSuperpixels = prev[currentLesion] || [];
          const newSuperpixels = { ...prev };
          if (currentSuperpixels.includes(selectedLabel)) {
            newSuperpixels[currentLesion] = currentSuperpixels.filter(l => l !== selectedLabel);
          } else {
            newSuperpixels[currentLesion] = [...currentSuperpixels, selectedLabel];
          }
          console.log('[Superpixel 클릭] currentLesion:', currentLesion, 'selectedLabel:', selectedLabel, 'newSuperpixels:', newSuperpixels);
          return newSuperpixels;
        });
      } else {
        console.log('[Superpixel 클릭] 이미지 영역 밖 클릭');
      }
    }
  }, [currentLesion, showGrid, showSuperpixel, superpixelData, cellSize, imageSize, imagePosition, originalImageSize]);

  // useEffect 수정
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    const handleResize = () => {
      drawCanvas();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [drawCanvas]);

  useEffect(() => {
    drawCanvas();
  }, [imageSize, imagePosition, drawCanvas]);

  // 방향키로 이미지 이동 (3단계에서만, throttle + press & hold 지원)
  const handleImageKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let dx = 0, dy = 0;
    const moveAmount = 10;
    switch (e.key) {
      case 'ArrowLeft':
        dx = moveAmount;
        break;
      case 'ArrowRight':
        dx = -moveAmount;
        break;
      case 'ArrowUp':
        dy = moveAmount;
        break;
      case 'ArrowDown':
        dy = -moveAmount;
        break;
      default:
        return;
    }
    e.preventDefault();
    setImagePosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  // 8) 단계별 버튼 렌더링
  // renderStepButtons 함수 전체 삭제

  // 환자 검색 핸들러
  const handleSearch = () => {
    // 검색어 입력 여부와 관계없이 환자 정보 표시
    setSelectedPatient({
      name: '장석민',
      code: 'jg0103'
    });
  };

  // 이미지 파일 처리 및 상태 업데이트 로직 분리
  const processImageFile = useCallback((file: File, eye: 'left' | 'right') => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (eye === 'left') {
        setLeftEyeImage(result);
        setEyeStatus(prev => ({
          ...prev,
          step1: { ...prev.step1, left: true }
        }));
      } else {
        setRightEyeImage(result);
        setEyeStatus(prev => ({
          ...prev,
          step1: { ...prev.step1, right: true }
        }));
      }
      // 원본 이미지 크기 저장을 위해 임시 이미지 로드
      const img = new Image();
      img.onload = () => {
        // 이 부분은 setOriginalImageSize가 비동기 콜백 내에 있으므로,
        // processImageFile의 직접적인 의존성으로 보기 어려움.
        // useState의 setter는 일반적으로 의존성 배열에 포함하지 않아도 됨.
        setOriginalImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  }, [setLeftEyeImage, setRightEyeImage, setEyeStatus /* setOriginalImageSize는 setter이므로 제외 가능 */]);

  // 이미지 업로드 핸들러
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, eye: 'left' | 'right') => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, eye);
    }
  };

  // 붙여넣기로 이미지 업로드 핸들러
  const handlePaste = useCallback((event: Event) => {
    const clipboardEvent = event as ClipboardEvent; 
    if (currentStep === 1 && selectedPatient) {
      const items = clipboardEvent.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              let targetEye: 'left' | 'right' | null = null;
              if (isHoveringLeftEyeDropzone) {
                targetEye = 'left';
              } else if (isHoveringRightEyeDropzone) {
                targetEye = 'right';
              }

              if (targetEye) {
                processImageFile(file, targetEye); 
                event.preventDefault(); 
                break; 
              }
            }
          }
        }
      }
    }
  }, [currentStep, selectedPatient, processImageFile, isHoveringLeftEyeDropzone, isHoveringRightEyeDropzone]);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  // 10) 단계별 메인 내용 렌더링
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Upload
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedPatient={selectedPatient}
            handleSearch={handleSearch}
            leftEyeImage={leftEyeImage}
            rightEyeImage={rightEyeImage}
            leftEyeInputRef={leftEyeInputRef as React.RefObject<HTMLInputElement>}
            rightEyeInputRef={rightEyeInputRef as React.RefObject<HTMLInputElement>}
            setIsHoveringLeftEyeDropzone={setIsHoveringLeftEyeDropzone}
            setIsHoveringRightEyeDropzone={setIsHoveringRightEyeDropzone}
            handleImageUpload={handleImageUpload}
            onAnalyze={() => {
                    if (leftEyeImage && rightEyeImage) {
                      setCurrentStep(2);
                    }
                  }}
          />
        );
      case 2:
        return (
          <Step2AIResult
            selectedEye={selectedEye}
            allSelected={allSelected}
            handleSelectAll={handleSelectAll}
            lesionList={lesionList}
            selectedLesions={selectedLesions}
            handleLesionSelect={handleLesionSelect}
            eyeStatus={eyeStatus}
            handlePrev={handlePrev}
            handleEyeConfirm={handleEyeConfirm}
            handleNext={handleNext}
            leftEyeImage={leftEyeImage}
            rightEyeImage={rightEyeImage}
            imageSize={imageSize}
            imagePosition={imagePosition}
            handleImageLoad={handleImageLoad}
                  />
        );
      case 3:
        return (
          <Step3FinalConfirm
            selectedEye={selectedEye}
            eyeStatus={eyeStatus}
            handlePrev={handlePrev}
            handleEyeConfirm={handleEyeConfirm}
            handleNext={handleNext}
            showAIDetection={showAIDetection}
            setShowAIDetection={setShowAIDetection}
            showGrid={showGrid}
            setShowGrid={setShowGrid}
            showSuperpixel={showSuperpixel}
            setShowSuperpixel={setShowSuperpixel}
            imageSize={imageSize}
            handleSizeChange={handleSizeChange}
            imageRef={imageRef as React.RefObject<HTMLDivElement>}
            handleMouseDown={handleMouseDown}
            handleMouseMove={handleMouseMove}
            handleMouseUp={handleMouseUp}
            handleWheel={handleWheel}
            imagePosition={imagePosition}
            handleImageLoad={handleImageLoad}
            canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
            handleCanvasClick={handleCanvasClick}
            selectedSeverity={selectedSeverity}
            setSelectedSeverity={setSelectedSeverity}
            lesionList={lesionList}
            currentLesion={currentLesion}
            selectedLesions={selectedLesions}
            selectedPixels={selectedPixels}
            handleLesionSelect={handleLesionSelect}
            handleImageKeyDown={handleImageKeyDown}
            cellSize={cellSize}
            handleCellSizeInc={handleCellSizeInc}
            handleCellSizeDec={handleCellSizeDec}
            gridLineWidth={gridLineWidth}
            handleGridLineWidthInc={handleGridLineWidthInc}
            handleGridLineWidthDec={handleGridLineWidthDec}
          />
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
        <StepIndicator steps={steps} currentStep={currentStep} selectedEye={selectedEye} />

        {/* 메인 컨텐츠 영역 */}
        <div className="main-content">{renderStep()}</div>
      </div>
    </div>
  );
};

export default Analysis;
