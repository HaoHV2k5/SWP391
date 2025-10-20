import { useLocation } from 'react-router-dom';
import CategoryPage from './CategoryPage';
import CategoryBrandPage from './CategoryBrandPage';

const CategoryRouter = () => {
  const location = useLocation();
  
  // Kiểm tra xem có brand hoặc model parameter trong URL không
  const urlParams = new URLSearchParams(location.search);
  const hasBrand = urlParams.get('brand');
  const hasModel = urlParams.get('model');
  
  // Nếu có brand hoặc model parameter, sử dụng CategoryBrandPage
  if (hasBrand || hasModel) {
    return <CategoryBrandPage />;
  }
  
  // Nếu không có, sử dụng CategoryPage bình thường
  return <CategoryPage />;
};

export default CategoryRouter;
