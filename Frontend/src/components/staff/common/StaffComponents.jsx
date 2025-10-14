/**
 * Reusable Staff Components
 */

import React from 'react';
import { Eye, Check, X, RefreshCw } from 'lucide-react';

/**
 * Loading Spinner Component
 */
export const LoadingSpinner = ({ size = 'medium', text = 'Đang tải...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`${sizeClasses[size]} border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin`}></div>
      {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
    </div>
  );
};

/**
 * Status Badge Component
 */
export const StatusBadge = ({ status, getStatusColor, getStatusText }) => {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{
        backgroundColor: getStatusColor(status) + '20',
        color: getStatusColor(status),
      }}
    >
      {getStatusText(status)}
    </span>
  );
};

/**
 * Action Buttons Component
 */
export const ActionButtons = ({ 
  onView, 
  onApprove, 
  onReject, 
  status, 
  loading = false,
  showApprove = true,
  showReject = true 
}) => {
  return (
    <div className="flex gap-2">
      {onView && (
        <button
          className="staff-btn staff-btn-secondary p-1"
          onClick={onView}
          title="Xem chi tiết"
        >
          <Eye size={14} />
        </button>
      )}
      
      {status === "PENDING" && showApprove && (
        <button
          className="staff-btn staff-btn-success p-1"
          onClick={onApprove}
          disabled={loading}
          title="Duyệt"
        >
          <Check size={14} />
        </button>
      )}
      
      {status === "PENDING" && showReject && (
        <button
          className="staff-btn staff-btn-danger p-1"
          onClick={onReject}
          disabled={loading}
          title="Từ chối"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

/**
 * Refresh Button Component
 */
export const RefreshButton = ({ onRefresh, loading = false, disabled = false }) => {
  return (
    <button
      className="staff-btn staff-btn-secondary p-2"
      onClick={onRefresh}
      disabled={loading || disabled}
      title="Làm mới dữ liệu"
    >
      <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
    </button>
  );
};

/**
 * Empty State Component
 */
export const EmptyState = ({ 
  title = "Không có dữ liệu", 
  description = "Chưa có dữ liệu để hiển thị",
  icon,
  action 
}) => {
  return (
    <div className="text-center py-12">
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      {action && action}
    </div>
  );
};

/**
 * Modal Component
 */
export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  width = 'medium',
  showCloseButton = true 
}) => {
  if (!isOpen) return null;

  const widthClasses = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-lg',
    xlarge: 'max-w-xl',
    full: 'max-w-full'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full ${widthClasses[width]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Table Component
 */
export const Table = ({ 
  columns, 
  data, 
  loading = false, 
  emptyMessage = "Không có dữ liệu",
  className = ""
}) => {
  if (loading) {
    return <LoadingSpinner text="Đang tải dữ liệu..." />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-200">
            {columns.map((column, index) => (
              <th
                key={index}
                className="p-4 text-left font-semibold text-gray-700"
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-100 hover:bg-gray-50">
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="p-4">
                  {column.render ? column.render(row[column.dataIndex], row, rowIndex) : row[column.dataIndex]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Card Component
 */
export const Card = ({ 
  title, 
  children, 
  className = "",
  headerActions,
  loading = false 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {title && (
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {headerActions && (
            <div className="flex items-center gap-2">
              {headerActions}
            </div>
          )}
        </div>
      )}
      <div className="p-6">
        {loading ? <LoadingSpinner /> : children}
      </div>
    </div>
  );
};

/**
 * Stats Card Component
 */
export const StatsCard = ({ 
  title, 
  value, 
  icon, 
  color = 'blue',
  trend,
  className = ""
}) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? '↗' : '↘'} {trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-full bg-gray-100 ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Search Input Component
 */
export const SearchInput = ({ 
  value, 
  onChange, 
  placeholder = "Tìm kiếm...",
  onSearch,
  loading = false,
  className = ""
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={loading}
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      {loading && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};
