import React from "react";
import { Col } from "react-bootstrap";
import { Link } from "react-router-dom";

const FooterColumn = ({ title, links }) => {
  return (
    <Col md={3} className="mb-4">
      <h6 className="fw-bold mb-3">{title}</h6>
      <ul className="list-unstyled">
        {links.map((link, index) => (
          <li key={index} className="mb-2">
            <Link to={link.to} className="text-decoration-none text-muted">
              {link.text}
            </Link>
          </li>
        ))}
      </ul>
    </Col>
  );
};

export default FooterColumn;
