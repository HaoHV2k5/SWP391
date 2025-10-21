import { useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { Search } from 'lucide-react';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // Logic tìm kiếm
    console.log('Tìm kiếm:', searchTerm);
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