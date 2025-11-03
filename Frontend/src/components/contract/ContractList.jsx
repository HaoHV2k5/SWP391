import React, { useState } from 'react';
import ContractCard from './ContractCard';
import ContractDetailModal from './ContractDetailModal';
import '../../styles/contract/ContractList.css';

const ContractList = ({ contracts = [], onPay, onCancel, onConfirmReceived, currentUserId }) => {
  const [selectedContract, setSelectedContract] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const handleViewDetail = (contract) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedContract(null);
  };

  const filteredContracts = () => {
    if (filter === 'all') return contracts;
    return contracts.filter(c => c.status === filter);
  };

  const getStatusCount = (status) => {
    return contracts.filter(c => c.status === status).length;
  };

  const categories = [
    { key: 'all', label: 'Tất cả', count: contracts.length },
    { key: 'PENDING', label: 'Đang chờ', count: getStatusCount('PENDING') },
    { key: 'SIGNED', label: 'Đã ký', count: getStatusCount('SIGNED') },
    { key: 'COMPLETED', label: 'Hoàn thành', count: getStatusCount('COMPLETED') },
    { key: 'CANCELLED', label: 'Đã hủy', count: getStatusCount('CANCELLED') }
  ];

  return (
    <div className="contract-list-container">
      <div className="contract-list-header">
        <h2 className="contract-list-title">Quản lý hợp đồng</h2>
        <p className="contract-list-subtitle">Theo dõi trạng thái, thanh toán và mốc thời gian của các hợp đồng</p>
      </div>

      <div className="contract-toolbar">
        <div className="contract-list-categories">
          {categories.map(category => (
            <button
              key={category.key}
              className={`category-btn ${filter === category.key ? 'active' : ''}`}
              onClick={() => setFilter(category.key)}
            >
              <i className={`bi ${
                category.key === 'all' ? 'bi-grid' :
                category.key === 'PENDING' ? 'bi-hourglass-split' :
                category.key === 'SIGNED' ? 'bi-pen' :
                category.key === 'COMPLETED' ? 'bi-check2-circle' :
                'bi-x-circle'
              }`}></i>
              <span>{category.label}</span>
              <span className="category-count">{category.count}</span>
            </button>
          ))}
        </div>

        <div className="status-legend">
          <span className="legend-item legend-pending"><i className="bi bi-hourglass-split"></i> Đang chờ</span>
          <span className="legend-item legend-signed"><i className="bi bi-pen"></i> Đã ký</span>
          <span className="legend-item legend-completed"><i className="bi bi-check2-circle"></i> Hoàn thành</span>
          <span className="legend-item legend-cancelled"><i className="bi bi-x-circle"></i> Đã hủy</span>
        </div>
      </div>

      {filteredContracts().length === 0 ? (
        <div className="contract-list-empty">
          <div className="empty-icon">📄</div>
          <p>Không có hợp đồng nào</p>
        </div>
      ) : (
        <div className="contract-list">
          {filteredContracts().map(contract => (
        <ContractCard
          key={contract.id}
          contract={contract}
          onViewDetail={handleViewDetail}
          onPay={onPay}
          onCancel={onCancel}
          onConfirmReceived={onConfirmReceived}
          currentUserId={currentUserId}
        />
          ))}
        </div>
      )}

      {selectedContract && (
        <ContractDetailModal
          contract={selectedContract}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          currentUserId={currentUserId}
          onPay={onPay}
          onConfirmReceived={onConfirmReceived}
        />
      )}
    </div>
  );
};

export default ContractList;
