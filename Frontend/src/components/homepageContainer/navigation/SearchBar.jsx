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
    <Form onSubmit={handleSearch} className="flex-grow-1 mx-3">
      <InputGroup>
        <Form.Control
          type="text"
          placeholder="Tìm kiếm xe điện, pin, thương hiệu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-end-0"
        />
        <Button 
          variant="outline-secondary" 
          type="submit"
          className="border-start-0"
        >
          <Search size={18} />
        </Button>
      </InputGroup>
    </Form>
  );
};

export default SearchBar;