// src/components/admin/AdminComplaintTab.jsx
import React from "react";
import ComplaintTab from "../staff/ComplaintTab";

const AdminComplaintTab = () => {
  // Reuse the ComplaintTab component used in staff page
  // Since admin and staff now both have ROLE_ADMIN/ROLE_STAFF access to complaints
  return <ComplaintTab />;
};

export default AdminComplaintTab;

