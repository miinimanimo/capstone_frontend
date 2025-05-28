import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PatientRegistration.css';

interface PatientData {
  name: string;
  age: string;
  gender: string;
  phoneNumber: string;
  address: string;
  medicalHistory: string;
}

const PatientRegistration: React.FC = () => {
  const [patientData, setPatientData] = useState<PatientData>({
    name: '',
    age: '',
    gender: '',
    phoneNumber: '',
    address: '',
    medicalHistory: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPatientData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (patientData.name && patientData.age && patientData.gender) {
      // 환자 등록 성공 시 홈으로 이동
      navigate('/');
    } else {
      setError('필수 정보를 모두 입력해주세요.');
    }
  };

  return (
    <div className="patient-registration-container">
      <div className="patient-registration-box">
        <h2>환자 등록</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">환자 성명 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={patientData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="age">나이 *</label>
            <input
              type="number"
              id="age"
              name="age"
              value={patientData.age}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="gender">성별 *</label>
            <select
              id="gender"
              name="gender"
              value={patientData.gender}
              onChange={handleChange}
              required
            >
              <option value="">선택하세요</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">연락처</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={patientData.phoneNumber}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">주소</label>
            <input
              type="text"
              id="address"
              name="address"
              value={patientData.address}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="medicalHistory">과거 병력</label>
            <textarea
              id="medicalHistory"
              name="medicalHistory"
              value={patientData.medicalHistory}
              onChange={handleChange}
              rows={4}
            />
          </div>
          <button type="submit" className="submit-button">환자 등록</button>
        </form>
      </div>
    </div>
  );
};

export default PatientRegistration; 