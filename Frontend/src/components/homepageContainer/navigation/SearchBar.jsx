import React, { useState } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { Search } from 'lucide-react';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // Logic tìm kiếm
    console.log('Tìm kiếm:', searchTerm);
  };

  return (
    <Form onSubmit={handleSearch} className="flex-grow-1 mx-3" style={{ width: '100%' }}>
      <InputGroup style={{ width: '100%' }}>
        <Form.Control
          type="text"
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-end-0"
        />
        <InputGroup.Text className="bg-white border-end-0">
          <Search size={18} />
        </InputGroup.Text>
      </InputGroup>
    </Form>
  );
};

export default SearchBar;