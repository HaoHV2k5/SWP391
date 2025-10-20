import React, { useState } from "react";
import { Table, Button, Modal, Input, Space, Tag, Spin, Image } from "antd";
import { useKyc } from "../../hooks/useStaff";
import {
  formatDate,
  getStatusColor,
  getStatusText,
  resolveImageUrl,
} from "../../utils/staffUtils";
import { showErrorNotification } from "../../utils/notificationManager";

const KYCTab = () => {
  const { kycList, loadKyc, approveKyc, rejectKyc, loading, isInitialLoading } =
    useKyc();

  const [selected, setSelected] = useState(null);
  const [rejectModal, setRejectModal] = useState({ open: false, id: null });
  const [reason, setReason] = useState("");

  // helper: nhận diện chuỗi giống email
  const isEmailLike = (v) => typeof v === "string" && /\S+@\S+\.\S+/.test(v);

  // ✅ Tên KHÔNG bao giờ rơi về email; không dùng username để tránh username=email
  const safeName = (r) => {
    const candidates = [
      r?._fullName,
      r?.fullName,
      r?.fullname,
      r?.name,
      r?.user?.fullName,
      r?.user?.fullname,
      r?.user?.name,
    ];
    const picked = candidates.find((v) => v && !isEmailLike(v));
    return picked || "N/A";
  };

  const safeEmail = (r) => r?._email || r?.email || r?.user?.email || "—";

  const safePhone = (r) =>
    r?._phone ||
    r?.phone ||
    r?.phoneNumber ||
    r?.user?.phone ||
    r?.user?.phoneNumber ||
    "—";

  const fImg = (r) =>
    resolveImageUrl(
      r?.frontIdImage || r?.frontImage || r?.front_id_image || ""
    );
  const bImg = (r) =>
    resolveImageUrl(r?.backIdImage || r?.backImage || r?.back_id_image || "");

  const handleApprove = async (id) => {
    try {
      await approveKyc(id);
      await loadKyc();
    } catch (err) {
      showErrorNotification(err?.message || "Lỗi khi duyệt KYC");
    }
  };

  const openReject = (id) => {
    setRejectModal({ open: true, id });
    setReason("");
  };

  const confirmReject = async () => {
    if (!reason.trim())
      return showErrorNotification("Vui lòng nhập lý do từ chối");
    try {
      await rejectKyc(rejectModal.id, reason);
      setRejectModal({ open: false, id: null });
      setReason("");
      await loadKyc();
    } catch (err) {
      showErrorNotification(err?.message || "Lỗi khi từ chối KYC");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", render: (v) => `#${v}` },
    { title: "Người dùng", key: "userInfo", render: (_, r) => safeName(r) },
    {
      title: "Email",
      key: "email",
      render: (_, r) => safeEmail(r),
      responsive: ["lg"],
    },
    {
      title: "SĐT",
      key: "phone",
      render: (_, r) => safePhone(r),
      responsive: ["lg"],
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s) => <Tag color={getStatusColor(s)}>{getStatusText(s)}</Tag>,
    },
    {
      title: "Ngày nộp",
      dataIndex: "submittedAt",
      key: "submittedAt",
      render: (d, r) => formatDate(d || r.createdAt || r.created_at),
    },
    {
      title: "Ảnh",
      key: "images",
      render: (_, r) => (
        <Space size={8}>
          {fImg(r) ? (
            <Image
              src={fImg(r)}
              width={48}
              height={30}
              style={{ objectFit: "cover", borderRadius: 4 }}
              alt="front"
              preview={{ mask: "Mặt trước" }}
            />
          ) : (
            <div
              style={{
                width: 48,
                height: 30,
                background: "#eee",
                borderRadius: 4,
                fontSize: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
              }}
            >
              CCCD Front
            </div>
          )}
          {bImg(r) ? (
            <Image
              src={bImg(r)}
              width={48}
              height={30}
              style={{ objectFit: "cover", borderRadius: 4 }}
              alt="back"
              preview={{ mask: "Mặt sau" }}
            />
          ) : (
            <div
              style={{
                width: 48,
                height: 30,
                background: "#eee",
                borderRadius: 4,
                fontSize: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
              }}
            >
              CCCD Back
            </div>
          )}
        </Space>
      ),
      responsive: ["md"],
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, rec) => (
        <Space>
          <Button onClick={() => setSelected(rec)}>Xem</Button>
          {String(rec.status || "").toUpperCase() === "PENDING" && (
            <>
              <Button type="primary" onClick={() => handleApprove(rec.id)}>
                Duyệt
              </Button>
              <Button danger onClick={() => openReject(rec.id)}>
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h3>Danh sách KYC đang chờ</h3>
        <Space>
          <Button onClick={loadKyc}>Làm mới</Button>
          <div style={{ color: "#666" }}>{(kycList || []).length} hồ sơ</div>
        </Space>
      </div>

      {isInitialLoading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin spinning tip="Đang tải danh sách KYC...">
            <div style={{ height: 100 }} />
          </Spin>
        </div>
      ) : (
        <Table
          dataSource={kycList || []}
          columns={columns}
          rowKey={(r) => r.id}
          pagination={{ pageSize: 10 }}
          loading={loading}
        />
      )}

      {/* Modal chi tiết */}
      <Modal
        title="Chi tiết KYC"
        open={!!selected}
        footer={null}
        onCancel={() => setSelected(null)}
        width={900}
      >
        {selected && (
          <div>
            <div style={{ marginBottom: 8 }}>
              <strong>Họ tên:</strong> {safeName(selected)}
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Email:</strong> {safeEmail(selected)}
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>SĐT:</strong> {safePhone(selected)}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginTop: 16,
              }}
            >
              <div>
                <b>Mặt trước:</b>
                <div style={{ marginTop: 8 }}>
                  {fImg(selected) ? (
                    <Image
                      src={fImg(selected)}
                      width={320}
                      style={{ borderRadius: 8 }}
                      alt="front"
                    />
                  ) : (
                    <div
                      style={{
                        width: 320,
                        height: 200,
                        background: "#eee",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#999",
                        fontSize: 28,
                      }}
                    >
                      CCCD Front
                    </div>
                  )}
                </div>
              </div>

              <div>
                <b>Mặt sau:</b>
                <div style={{ marginTop: 8 }}>
                  {bImg(selected) ? (
                    <Image
                      src={bImg(selected)}
                      width={320}
                      style={{ borderRadius: 8 }}
                      alt="back"
                    />
                  ) : (
                    <div
                      style={{
                        width: 320,
                        height: 200,
                        background: "#eee",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#999",
                        fontSize: 28,
                      }}
                    >
                      CCCD Back
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal nhập lý do từ chối */}
      <Modal
        title="Nhập lý do từ chối KYC"
        open={rejectModal.open}
        onCancel={() => setRejectModal({ open: false, id: null })}
        onOk={confirmReject}
      >
        <Input.TextArea
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Nhập lý do..."
        />
      </Modal>
    </div>
  );
};

export default KYCTab;
