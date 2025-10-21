// src/components/staff/KYCTab.jsx
import React, { useMemo, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Input,
  Space,
  Tag,
  Image,
  Row,
  Col,
  Empty,
} from "antd";
import { ReloadOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { usePendingKyc } from "../../hooks/useStaff";
import { vnDate, statusTag, resolveImageUrl } from "../../utils/staffUtils";

/** Lấy 2 ảnh CCCD (front/back) từ rất nhiều tên key có thể có */
function extractKycImages(rec = {}) {
  const tryKeys = (o, keys) => {
    for (const k of keys) {
      const v = o?.[k];
      if (v != null && String(v).trim() !== "") return v;
    }
    return null;
  };

  // Các tên key hay gặp BE đặt khác nhau
  const frontRaw = tryKeys(rec, [
    "frontUrl",
    "frontURL",
    "front",
    "front_image",
    "frontImage",
    "frontImageUrl",
    "urlFront",
    "frontCCCD",
    "cccdFront",
    "imageFront",
  ]);

  const backRaw = tryKeys(rec, [
    "backUrl",
    "backURL",
    "back",
    "back_image",
    "backImage",
    "backImageUrl",
    "urlBack",
    "backCCCD",
    "cccdBack",
    "imageBack",
  ]);

  const front = resolveImageUrl(frontRaw);
  const back = resolveImageUrl(backRaw);

  // Nếu BE trả mảng images có đúng 2 ảnh, vẫn hỗ trợ
  let fallback = [];
  const listCandidates = [
    rec.images,
    rec.imageUrls,
    rec.image_urls,
    rec.imagesUrl,
    rec.photos,
    rec.pictures,
  ].filter(Boolean);
  for (const arr of listCandidates) {
    if (Array.isArray(arr)) {
      fallback = arr.map(resolveImageUrl).filter(Boolean);
      break;
    } else if (typeof arr === "string") {
      fallback = arr
        .split(",")
        .map((s) => resolveImageUrl(s.trim()))
        .filter(Boolean);
      break;
    }
  }

  // Ưu tiên front/back; nếu không có thì trả mảng fallback
  const pair = [front, back].filter(Boolean);
  return pair.length ? pair : fallback.slice(0, 2);
}

const KYCTab = () => {
  const { list, reload, approve, reject, loading, initial, loadUserInfo } =
    usePendingKyc();
  const [detail, setDetail] = useState(null);
  const [reasonModal, setReasonModal] = useState({ open: false, id: null });
  const [reason, setReason] = useState("");

  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: 80,
        render: (v) => `#${v}`,
      },
      { title: "User ID", dataIndex: "userId", key: "userId" },
      {
        title: "Gửi lúc",
        key: "createdAt",
        render: (_, r) => vnDate(r.createdAt || r.created_at),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (s) => (
          <Tag color={statusTag(s).color}>{statusTag(s).text}</Tag>
        ),
      },
      {
        title: "Ảnh",
        key: "images",
        render: (_, r) => {
          const imgs = extractKycImages(r);
          if (!imgs.length) return "—";
          return (
            <Space>
              {imgs.map((u, i) => (
                <Image
                  key={i}
                  src={u}
                  width={48}
                  height={36}
                  style={{ objectFit: "cover", borderRadius: 6 }}
                />
              ))}
            </Space>
          );
        },
      },
      {
        title: "Thao tác",
        key: "actions",
        width: 240,
        render: (_, r) => (
          <Space>
            <Button onClick={() => openDetail(r)}>Chi tiết</Button>
            <Button
              type="primary"
              loading={loading}
              onClick={() => approveConfirm(r.id)}
            >
              Duyệt
            </Button>
            <Button
              danger
              loading={loading}
              onClick={() => setReasonModal({ open: true, id: r.id })}
            >
              Từ chối
            </Button>
          </Space>
        ),
      },
    ],
    [loading]
  );

  const approveConfirm = (id) => {
    Modal.confirm({
      title: "Xác nhận duyệt KYC?",
      icon: <ExclamationCircleOutlined />,
      okText: "Duyệt",
      cancelText: "Hủy",
      onOk: async () => {
        await approve(id);
      },
    });
  };

  const doReject = async () => {
    const id = reasonModal.id;
    if (!id) return;
    const text = reason.trim();
    if (text.length < 3) return;
    await reject(id, text);
    setReason("");
    setReasonModal({ open: false, id: null });
  };

  const openDetail = async (rec) => {
    const userResp = await loadUserInfo(rec.id);
    // unwrap nếu BE trả {code, message, data}
    const user = userResp?.data ?? userResp?.user ?? userResp ?? null;
    setDetail({ ...rec, __user: user });
  };

  const imgs = extractKycImages(detail || {});

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <Button icon={<ReloadOutlined />} onClick={reload}>
          Tải lại
        </Button>
      </Space>

      <Table
        rowKey={(r) => r.id}
        loading={initial}
        columns={columns}
        dataSource={list}
        pagination={{ pageSize: 10 }}
      />

      {/* Modal từ chối */}
      <Modal
        title="Nhập lý do từ chối"
        open={reasonModal.open}
        onCancel={() => setReasonModal({ open: false, id: null })}
        onOk={doReject}
        okButtonProps={{ disabled: !reason.trim() || reason.trim().length < 3 }}
      >
        <Input.TextArea
          rows={4}
          placeholder="Lý do (tối thiểu 3 ký tự)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Modal>

      {/* Modal chi tiết */}
      <Modal
        title={`Chi tiết KYC #${detail?.id ?? "—"}`}
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={null}
        width={920}
      >
        {detail && (
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: 8 }}>
                <b>User ID:</b> {detail.userId}
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Gửi lúc:</b> {vnDate(detail.createdAt || detail.created_at)}
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Trạng thái:</b> {statusTag(detail.status).text}
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>User:</b>{" "}
                {detail.__user?.username || detail.__user?.email || "—"}
              </div>
              <pre
                style={{
                  background: "#f5f5f5",
                  padding: 12,
                  borderRadius: 8,
                  maxHeight: 260,
                  overflow: "auto",
                }}
              >
                {JSON.stringify(detail.__user ?? {}, null, 2)}
              </pre>
            </Col>

            <Col span={12}>
              {imgs.length ? (
                <Image.PreviewGroup>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: 8,
                    }}
                  >
                    {imgs.map((u, i) => (
                      <Image key={i} src={u} width="100%" />
                    ))}
                  </div>
                </Image.PreviewGroup>
              ) : (
                <Empty description="Không có ảnh" />
              )}
            </Col>
          </Row>
        )}
      </Modal>
    </div>
  );
};

export default KYCTab;
