import { useState } from "react";

/**
 * Custom hook để xử lý pagination với "Xem thêm"
 * @param {number} initialLimit - Số sản phẩm hiển thị ban đầu (default: 6)
 * @returns {object} - {visibleCount, handleLoadMore, resetPagination}
 */
const usePagination = (initialLimit = 6) => {
  const [visibleCount, setVisibleCount] = useState(initialLimit);

  const handleLoadMore = (totalItems) => {
    setVisibleCount((prev) => Math.min(prev + initialLimit, totalItems));
  };

  const resetPagination = () => {
    setVisibleCount(initialLimit);
  };

  return {
    visibleCount,
    handleLoadMore,
    resetPagination,
  };
};

export default usePagination;

