// src/components/staff/ProductsTab.jsx
import React, { useMemo, useState } from "react";
import { Table, Button, Modal, Space, Tag, Image, Row, Col } from "antd";
import { ReloadOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { usePendingProducts } from "../../hooks/useStaff";
import {
  vnDate,
  statusTag,
  money,
  collectImages,
} from "../../utils/staffUtils";
import { productsApi } from "../../services/staffApi";

const ProductsTab = () => {
  const { list, reload, approve, reject, loading, initial } =
    usePendingProducts();
  const [detail, setDetail] = useState(null);

  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: 80,
        render: (v) => `#${v}`,
      },
      {
        title: "Tiêu đề",
        dataIndex: "title",
        key: "title",
        render: (t, r) => (
          <div>
            <div style={{ fontWeight: 600 }}>
              {t || r.name || r.productName || "(Không tiêu đề)"}
            </div>
            <div style={{ color: "#888", fontSize: 12 }}>
              Giá: {money(r.price || r.amount || r.cost)} • Người bán:{" "}
              {r?.seller?.username || r?.user?.username || r?.sellerName || "—"}
            </div>
          </div>
        ),
      },
      {
        title: "Ảnh",
        key: "images",
        width: 150,
        render: (_, r) => {
          const imgs = collectImages(r);
          if (!imgs.length) return "—";
          return (
            <Space wrap>
              {imgs.slice(0, 2).map((u, i) => (
                <Image
                  key={i}
                  src={u}
                  width={60}
                  height={45}
                  style={{ objectFit: "cover", borderRadius: 6 }}
                  preview={{ mask: "Xem" }}
                />
              ))}
            </Space>
          );
        },
      },
      {
        title: "Gửi lúc",
        key: "submitted_at",
        render: (_, r) => vnDate(r.submitted_at || r.createdAt || r.created_at),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (s) => {
          const { color, text } = statusTag(s);
          return <Tag color={color}>{text}</Tag>;
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
              onClick={() => rejectConfirm(r.id)}
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
      title: "Xác nhận duyệt tin đăng?",
      icon: <ExclamationCircleOutlined />,
      okText: "Duyệt",
      cancelText: "Hủy",
      onOk: async () => {
        await approve(id);
      },
    });
  };

  const rejectConfirm = (id) => {
    let reason = "";
    Modal.confirm({
      title: "Nhập lý do từ chối",
      content: (
        <textarea
          autoFocus
          onChange={(e) => (reason = e.target.value)}
          placeholder="Lý do (tối thiểu 3 ký tự)"
          style={{ width: "100%", minHeight: 100 }}
        />
      ),
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        if (!reason || reason.trim().length < 3) return Promise.reject();
        await reject(id, reason.trim());
      },
    });
  };

  const openDetail = async (rec) => {
    let merged = { ...rec };
    try {
      const res = await productsApi.getDetail(rec.id);
      if (res?.data) merged = { ...merged, ...res.data };
    } catch {
      /* bỏ qua nếu BE chưa có chi tiết */
    }
    merged.__images = collectImages(merged);
    setDetail(merged);
  };

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

      {/* Modal chi tiết: chỉ HIỂN THỊ ảnh từ link DB */}
      <Modal
        title={`Chi tiết tin #${detail?.id ?? "—"}`}
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={null}
        width={920}
      >
        {detail && (
          <Row gutter={16}>
            <Col span={10}>
              {detail.__images?.length ? (
                <Image.PreviewGroup>
                  {detail.__images.slice(0, 12).map((u, i) => (
                    <Image
                      key={i}
                      src={u}
                      width="100%"
                      style={{ marginBottom: 8, objectFit: "cover" }}
                    />
                  ))}
                </Image.PreviewGroup>
              ) : (
                <div>Không có ảnh</div>
              )}
            </Col>
            <Col span={14}>
              <div style={{ marginBottom: 8 }}>
                <b>Tiêu đề:</b> {detail.title || detail.name || "—"}
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Giá:</b>{" "}
                {money(detail.price || detail.amount || detail.cost)}
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Mô tả:</b> {detail.description || detail.desc || "—"}
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Người bán:</b>{" "}
                {detail?.seller?.username ||
                  detail?.user?.username ||
                  detail?.sellerName ||
                  "—"}
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Trạng thái:</b> {statusTag(detail.status).text}
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Gửi lúc:</b>{" "}
                {vnDate(
                  detail.submitted_at || detail.createdAt || detail.created_at
                )}
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
                {JSON.stringify(detail, null, 2)}
              </pre>
            </Col>
          </Row>
        )}
      </Modal>
    </div>
  );
};

export default ProductsTab;
