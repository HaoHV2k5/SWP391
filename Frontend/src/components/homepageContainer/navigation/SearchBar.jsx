import { useState, useRef, useEffect } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import searchService from '../../../services/searchService';

const SearchBar = () => {
  // State quản lý search
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Đóng suggestions khi click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lấy suggestions từ searchService
  const fetchSuggestions = async (keyword) => {
    if (!keyword.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const result = await searchService.fetchSuggestions(keyword);
      if (result.success) {
        setSuggestions(result.data);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce input change - gọi API sau 300ms
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchSuggestions(searchTerm);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Xử lý search khi submit form hoặc click button
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      const result = await searchService.handleSearch(searchTerm);
      
      if (result.success) {
        if (result.redirect) {
          navigate(result.redirect);
        }
      } else {
        toast.warning(result.message);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại!');
    }
    
    setShowSuggestions(false);
  };

  // Xử lý click vào suggestion
  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'tag') {
      // Sử dụng slug từ BE nếu có, fallback về id
      const tagPath = suggestion.slug ? `/tag/${suggestion.slug}` : `/tag/${suggestion.id}`;
      navigate(tagPath);
} else if (suggestion.type === 'keyword') {
      setSearchTerm(suggestion.title);
      navigate(`/?search=${encodeURIComponent(suggestion.title)}`);
    } else if (suggestion.type === 'product') {
      navigate(`/product/${suggestion.id}`);
    } else if (suggestion.type === 'brand') {
      // Chuyển đến trang xe máy điện với filter brand
      setSearchTerm(suggestion.title);
      navigate(`/products/electric-scooter?brand=${encodeURIComponent(suggestion.title)}`);
    } else if (suggestion.type === 'model') {
      // Chuyển đến trang xe máy điện với filter model
      setSearchTerm(suggestion.title);
      navigate(`/products/electric-scooter?model=${encodeURIComponent(suggestion.title)}`);
    } else {
      navigate(`/product/${suggestion.id}`);
    }
    setShowSuggestions(false);
  };

  return (
    <div className="search-container" ref={suggestionsRef}>
      <Form onSubmit={handleSearch} className="navbar-search-form">
        <InputGroup className="navbar-search-input-group">
          {/* Input search */}
          <Form.Control
            ref={searchRef}
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            className="navbar-search-input"
          />
          {/* Button search */}
          <button 
            type="submit" 
            className="navbar-search-button"
            onClick={handleSearch}
          >
            <Search size={18} />
          </button>
        </InputGroup>

        {/* Dropdown suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="search-suggestions">
            {/* Header suggestions */}
            <div className="suggestions-header">
              <span>
                {suggestions[0]?.type === 'product' 
                  ? `Sản phẩm "${searchTerm}"` 
                  : suggestions[0]?.type === 'tag'
                  ? `Gợi ý "${searchTerm}"`
                  : suggestions[0]?.type === 'brand'
                  ? `Thương hiệu "${searchTerm}"`
                  : suggestions[0]?.type === 'model'
                  ? `Mẫu xe "${searchTerm}"`
                  : `Tìm kiếm "${searchTerm}"`}
              </span>
            </div>
            {/* List suggestions */}
            <div className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id || index}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <Search size={16} className="suggestion-icon" />
                  <div className="suggestion-content">
                    <div className="suggestion-title">
                      {suggestion.title}
                    </div>
<div className="suggestion-type text-muted" style={{fontSize: '0.8em'}}>
                      {suggestion.type === 'tag' ? 'Tag' :
                       suggestion.type === 'brand' ? 'Thương hiệu' :
                       suggestion.type === 'model' ? 'Mẫu xe' :
                       suggestion.type === 'product' ? 'Sản phẩm' : 'Khác'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Form>
    </div>
  );
};

export default SearchBar;