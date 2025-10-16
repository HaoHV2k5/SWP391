import React, { useState, useMemo } from 'react';
import { memberService } from '../../services/memberService';

const EditProfileModal = ({ user, onClose, onSuccess }) => {
  const initialFullname = user?.fullName || user?.fullname || '';
  const initialGender = user?.gender || '';
  const initialPhone = user?.phone || '';
  const initialAddress = user?.address || '';
  const initialYobStr = user?.yob || '';

  const yyyyMmDdFromDdMmYyyy = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length !== 3) return '';
    const [dd, mm, yyyy] = parts;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  };

  const ddMmYyyyFromYyyyMmDd = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return '';
    const [yyyy, mm, dd] = parts;
    return `${dd.padStart(2, '0')}/${mm.padStart(2, '0')}/${yyyy}`;
  };

  const [fullname, setFullname] = useState(initialFullname);
  const [gender, setGender] = useState(initialGender);
  const [phone, setPhone] = useState(initialPhone);
  const [address, setAddress] = useState(initialAddress);
  const [yobInput, setYobInput] = useState(
    initialYobStr.includes('/') ? yyyyMmDdFromDdMmYyyy(initialYobStr) : initialYobStr
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isValid = useMemo(() => {
    return fullname.trim().length > 0 && yobInput.trim().length > 0;
  }, [fullname, yobInput]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError(null);
    const payload = {
      fullname: fullname.trim(),
      gender: gender || null,
      yob: ddMmYyyyFromYyyyMmDd(yobInput.trim()),
      phone: phone || null,
      address: address || null,
      avatar: user?.avatar || null,
    };
    const result = await memberService.updateMemberProfile(payload);
    if (result.success) {
      onSuccess?.();
      onClose?.();
    } else {
      setError(result.message || 'Cập nhật thất bại');
    }
    setSubmitting(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>Chỉnh sửa thông tin</h3>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'grid', gap: '14px' }}>
          {error && (
            <div style={{ color: '#dc3545', fontSize: '14px' }}>{error}</div>
          )}

          <div style={{ display: 'grid', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: '#555' }}>Họ và tên</label>
            <input
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Nhập họ và tên"
              style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ display: 'grid', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: '#555' }}>Giới tính</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd' }}
            >
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div style={{ display: 'grid', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: '#555' }}>Ngày sinh</label>
            <input
              type="date"
              value={yobInput}
              onChange={(e) => setYobInput(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <span style={{ fontSize: '12px', color: '#888' }}>Định dạng gửi: dd/MM/yyyy</span>
          </div>

          <div style={{ display: 'grid', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: '#555' }}>Số điện thoại</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại"
              style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ display: 'grid', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: '#555' }}>Địa chỉ</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Nhập địa chỉ"
              style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                backgroundColor: '#f1f3f5',
                color: '#333',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!isValid || submitting}
              style={{
                backgroundColor: !isValid || submitting ? '#9bd7bf' : '#00A86B',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: !isValid || submitting ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;


