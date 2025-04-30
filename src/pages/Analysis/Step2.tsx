import React from 'react';
import './Analysis.css';

interface Lesion {
  id: string;
  name: string;
  status: string;
}

interface Step2Props {
  selectedEye: 'left' | 'right' | null;
  handleEyeConfirm: (eye: 'left' | 'right') => void;
  eyeStatus: {
    step1: { left: boolean; right: boolean };
    step2: { left: boolean; right: boolean };
    step3: { left: boolean; right: boolean };
  };
  selectedLesions: string[];
  handleLesionSelect: (lesionId: string) => void;
  allSelected: boolean;
  handleSelectAll: () => void;
  imageSize: { width: number; height: number };
  imagePosition: { x: number; y: number };
  handleImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  lesionList: Lesion[];
  handlePrev: () => void;
  handleNext: () => void;
  selectedPatient: { name: string; code: string } | null;
}

const Step2: React.FC<Step2Props> = ({
  selectedEye,
  handleEyeConfirm,
  eyeStatus,
  selectedLesions,
  handleLesionSelect,
  allSelected,
  handleSelectAll,
  imageSize,
  imagePosition,
  handleImageLoad,
  lesionList,
  handlePrev,
  handleNext,
  selectedPatient,
}) => {
  const step2Confirmed = eyeStatus.step2.left && eyeStatus.step2.right;

  return (
    <div className="step-content step-2">
      <div className="patient-info-header">
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
            <span className="patient-name">환자 성명: {selectedPatient?.name}</span>
            <span className="divider">|</span>
            <span className="patient-code">환자 코드: {selectedPatient?.code}</span>
          </div>
        </div>

        <div className="eye-confirm-buttons">
          <button
            className={`eye-button ${eyeStatus.step2.left ? 'confirmed' : ''}`}
            onClick={() => handleEyeConfirm('left')}
          >
            좌안 확인
          </button>
          <button
            className={`eye-button ${eyeStatus.step2.right ? 'confirmed' : ''}`}
            onClick={() => handleEyeConfirm('right')}
          >
            우안 확인
          </button>
        </div>
      </div>

      <div className="diagnosis-container">
        <div className="severity-diagnosis">
          <h3>중증도 진단</h3>
          <div className="severity-options">
            <label>
              <input type="radio" name="severity" value="mild" />
              <span>Mild NPDR</span>
            </label>
            <label>
              <input type="radio" name="severity" value="moderate" />
              <span>Moderate NPDR</span>
            </label>
            <label>
              <input type="radio" name="severity" value="severe" />
              <span>Severe NPDR</span>
            </label>
            <label>
              <input type="radio" name="severity" value="pdr" />
              <span>PDR</span>
            </label>
            <label>
              <input type="radio" name="severity" value="normal" />
              <span>No Abnormalities</span>
            </label>
          </div>
        </div>

        <div className="interest-region">
          <h3>관심 영역</h3>
          <div className="region-image">
            <img
              src={selectedEye === 'left' ? 'left-eye.jpg' : 'right-eye.jpg'}
              alt="관심 영역"
              onLoad={handleImageLoad}
              style={{
                width: imageSize.width,
                height: imageSize.height,
                transform: `translate(${imagePosition.x}px, ${imagePosition.y}px)`,
              }}
            />
          </div>
        </div>

        <div className="lesion-detection">
          <h3>병변 검출</h3>
          <div className="detection-list">
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
      </div>

      <div className="navigation-buttons">
        <button className="prev-button" onClick={handlePrev}>
          이전
        </button>
        <button className="next-button" onClick={handleNext}>
          다음
        </button>
      </div>
    </div>
  );
};

export default Step2; 