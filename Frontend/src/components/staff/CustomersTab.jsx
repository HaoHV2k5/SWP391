// src/components/staff/CustomersTab.jsx
import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Spin, Space } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useStaff } from "../../hooks/useStaff";
import { showErrorNotification } from "../utils/notificationManager";

const CustomersTab = () => {
  const { loadKyc, kycList, approveKyc, rejectKyc, loading } = useStaff();

  const [reasonModal, setReasonModal] = useState({ open: false, id: null });
  const [reason, setReason] = useState("");
  const [detailUser, setDetailUser] = useState(null);

  useEffect(() => {
    loadKyc();
  }, [loadKyc]);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 70,
      render: (v) => `#${v}`,
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s) => (s === "PENDING" ? "Đang chờ" : s),
    },
    {
      title: "Thao tác",
      render: (_, r) => (
        <Space>
          <Button onClick={() => setDetailUser(r)}>Xem</Button>
          {r.status === "PENDING" && (
            <>
              <Button type="primary" onClick={() => approveKyc(r.id)}>
                Duyệt
              </Button>
              <Button
                danger
                onClick={() => setReasonModal({ open: true, id: r.id })}
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const confirmReject = async () => {
    if (!reason.trim()) {
      showErrorNotification("Vui lòng nhập lý do từ chối");
      return;
    }
    try {
      await rejectKyc(reasonModal.id, reason);
      setReasonModal({ open: false, id: null });
      setReason("");
      await loadKyc();
    } catch (err) {
      showErrorNotification(err.message || "Lỗi khi từ chối KYC");
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h3>Danh sách KYC</h3>
        <Button icon={<ReloadOutlined />} onClick={loadKyc}>
          Làm mới
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin spinning={loading} tip="Đang tải danh sách KYC...">
            <div style={{ height: 100 }} />
          </Spin>
        </div>
      ) : (
        <Table
          dataSource={kycList || []}
          columns={columns}
          rowKey={(r) => r.id}
          pagination={{ pageSize: 10 }}
        />
      )}

      {/* Modal từ chối */}
      <Modal
        title="Nhập lý do từ chối"
        open={reasonModal.open}
        onCancel={() => setReasonModal({ open: false, id: null })}
        onOk={confirmReject}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{ width: "100%", minHeight: 100 }}
          placeholder="Nhập lý do từ chối..."
        />
      </Modal>

      {/* Modal chi tiết */}
      <Modal
        title="Chi tiết người dùng"
        open={!!detailUser}
        footer={null}
        onCancel={() => setDetailUser(null)}
        width={800}
      >
        {detailUser && (
          <div>
            <p>
              <b>Họ tên:</b> {detailUser.fullName}
            </p>
            <p>
              <b>Email:</b> {detailUser.email}
            </p>
            <p>
              <b>Trạng thái:</b> {detailUser.status}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomersTab;
