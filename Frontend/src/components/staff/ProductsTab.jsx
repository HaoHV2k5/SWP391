// src/components/staff/ProductsTab.jsx
import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Input,
  Space,
  Tag,
  Spin,
  Popover,
  Image,
  Row,
  Col,
} from "antd";
import { ExclamationCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { useProducts } from "../../hooks/useStaff";
import {
  formatDate,
  formatCurrency,
  getStatusColor,
  getStatusText,
  resolveImageUrl, // chuẩn hoá URL ảnh
} from "../../utils/staffUtils";
import { showErrorNotification } from "../../utils/notificationManager";
import { productsApi } from "../../services/staffApi";

/* ================= Gom đủ thông tin người bán ================= */
const collectSellerInfo = (r) => {
  const userObj =
    r.user || r.seller || r.owner || r.account || r.createdByUser || {};

  const scalar = {
    sellerName: r.sellerName || r.ownerName || r.seller || r.createdBy,
    email: r.email || r.user?.email || r.seller?.email || r.account?.email,
    phone:
      r.phone ||
      r.phoneNumber ||
      r.user?.phone ||
      r.user?.phoneNumber ||
      r.seller?.phone ||
      r.seller?.phoneNumber ||
      r.account?.phone ||
      r.account?.phoneNumber,
    id:
      r.sellerId ||
      r.userId ||
      r.ownerId ||
      r.accountId ||
      r.createdById ||
      userObj.id,
    username: r.username || userObj.username || r.account?.username,
    role: userObj.role || r.account?.role,
  };

  const fullName =
    userObj.fullName || userObj.fullname || userObj.name || scalar.sellerName;

  const email = userObj.email || scalar.email;
  const phone = userObj.phone || userObj.phoneNumber || scalar.phone;
  const id = userObj.id || scalar.id;
  const username = userObj.username || scalar.username;
  const role = userObj.role || scalar.role;

  const summary = fullName || username || email || phone || "N/A";

  const detailItems = [
    ["Họ tên", fullName],
    ["Email", email],
    ["SĐT", phone],
    ["Username", username],
    ["User ID", id],
    ["Vai trò", role],
  ].filter(([, v]) => v && String(v).trim() !== "");

  return { summary, detailItems };
};

/* ================= Chuẩn hoá danh sách ảnh sản phẩm ================= */
const collectProductImages = (p) => {
  if (!p) return [];
  const uniq = new Set();

  const pushOne = (raw) => {
    if (!raw) return;
    const url = resolveImageUrl(raw);
    if (url) uniq.add(url);
  };

  const push = (val) => {
    if (!val) return;
    if (typeof val === "string") {
      // Hỗ trợ cả chuỗi nhiều URL phân tách bởi dấu phẩy
      if (val.includes(",")) {
        val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach(pushOne);
      } else {
        pushOne(val);
      }
    } else if (val?.url) {
      pushOne(val.url);
    }
  };

  // mảng phổ biến
  const arrays = [
    p.images,
    p.imageUrls,
    p.photos,
    p.gallery,
    p.pictures,
    p.media?.images,
    p.attachments,
    p.files,
    p.resources,
  ].filter(Boolean);

  arrays.forEach((arr) => {
    if (Array.isArray(arr)) arr.forEach(push);
    // Trong vài BE, `images` có thể là string CSV
    else if (typeof arr === "string") push(arr);
  });

  // key đơn
  [
    p.mainImage,
    p.thumbnail,
    p.cover,
    p.coverImage,
    p.featuredImage,
    p.image,
  ].forEach(push);

  return Array.from(uniq);
};

const ProductsTab = () => {
  const {
    products,
    loadProducts,
    approveProduct,
    rejectProduct,
    loading,
    isInitialLoading,
  } = useProducts();

  const [reasonModal, setReasonModal] = useState({ open: false, id: null });
  const [reason, setReason] = useState("");
  const [detailProduct, setDetailProduct] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const handleApprove = async (id) => {
    Modal.confirm({
      title: "Xác nhận duyệt tin?",
      icon: <ExclamationCircleOutlined />,
      okText: "Duyệt",
      cancelText: "Hủy",
      async onOk() {
        try {
          await approveProduct(id);
          await loadProducts();
        } catch (err) {
          showErrorNotification(err?.message || "Lỗi khi duyệt");
        }
      },
    });
  };

  const openReject = (id) => {
    setReasonModal({ open: true, id });
    setReason("");
  };

  const confirmReject = async () => {
    if (!reason.trim()) {
      showErrorNotification("Vui lòng nhập lý do từ chối");
      return;
    }
    try {
      await rejectProduct(reasonModal.id, reason);
      setReasonModal({ open: false, id: null });
      setReason("");
      await loadProducts();
    } catch (err) {
      showErrorNotification(err?.message || "Lỗi khi từ chối");
    }
  };

  /* --------- MỞ MODAL CHI TIẾT: gọi API lấy ảnh đầy đủ ---------- */
  const openDetail = async (rec) => {
    setDetailLoading(true);
    setDetailProduct({ ...rec }); // hiển thị trước phần text
    try {
      const res = await productsApi.getProductDetail(rec.id);
      const detail = res?.data || res?.raw || res || {};
      const merged = { ...rec, ...detail };
      merged.__images = collectProductImages(merged);
      setDetailProduct(merged);
    } catch {
      // vẫn mở modal với dữ liệu sẵn có
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
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
          <div style={{ fontWeight: 600 }}>{t || r.name || "N/A"}</div>
          <div style={{ color: "#666", fontSize: 12 }}>
            {(r.description || "").slice(0, 100)}
          </div>
        </div>
      ),
    },
    {
      title: "Người bán",
      dataIndex: "seller",
      key: "seller",
      render: (_, r) => {
        const info = collectSellerInfo(r);
        return (
          <Popover
            title="Thông tin người bán"
            content={
              <div style={{ minWidth: 240 }}>
                {info.detailItems.length === 0 ? (
                  <div>Không có thông tin</div>
                ) : (
                  info.detailItems.map(([k, v]) => (
                    <div
                      key={k}
                      style={{ display: "flex", gap: 8, marginBottom: 4 }}
                    >
                      <b style={{ minWidth: 90 }}>{k}:</b>
                      <span>{v}</span>
                    </div>
                  ))
                )}
              </div>
            }
          >
            <span style={{ cursor: "pointer", textDecoration: "underline" }}>
              {info.summary}
            </span>
          </Popover>
        );
      },
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (p) => formatCurrency(p || 0),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s) => <Tag color={getStatusColor(s)}>{getStatusText(s)}</Tag>,
    },
    {
      title: "Ngày tạo",
      key: "createdAt",
      render: (_, r) =>
        formatDate(
          r.createdAt ||
            r.created_at ||
            r.createdDate ||
            r.created ||
            r.created_on ||
            r.createdTime ||
            r.created_time
        ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 220,
      render: (_, rec) => (
        <Space>
          <Button onClick={() => openDetail(rec)}>Xem</Button>
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
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h3>Tin đăng chờ phê duyệt</h3>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadProducts}>
            Làm mới
          </Button>
          <div style={{ color: "#666" }}>{(products || []).length} tin</div>
        </Space>
      </div>

      {/* Bảng danh sách */}
      {isInitialLoading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin spinning={isInitialLoading} tip="Đang tải tin đăng...">
            <div style={{ height: 100 }} />
          </Spin>
        </div>
      ) : (
        <Table
          dataSource={products || []}
          columns={columns}
          rowKey={(r) => r.id}
          pagination={{ pageSize: 10 }}
          loading={loading}
          locale={{
            emptyText: (
              <div style={{ padding: 24, color: "#888" }}>No data</div>
            ),
          }}
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
        <Input.TextArea
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Nhập lý do..."
        />
      </Modal>

      {/* Modal chi tiết (kèm ảnh) */}
      <Modal
        title="Chi tiết tin đăng"
        open={!!detailProduct}
        footer={null}
        onCancel={() => setDetailProduct(null)}
        width={1000}
      >
        {!detailProduct ? null : (
          <div>
            <h2 style={{ marginBottom: 8 }}>
              {detailProduct.title || detailProduct.name}
            </h2>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12} lg={8}>
                <div style={{ marginBottom: 8 }}>
                  <strong>Giá:</strong> {formatCurrency(detailProduct.price)}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Người bán:</strong>{" "}
                  {collectSellerInfo(detailProduct).summary}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Trạng thái:</strong>{" "}
                  <Tag color={getStatusColor(detailProduct.status)}>
                    {getStatusText(detailProduct.status)}
                  </Tag>
                </div>
                <div>
                  <strong>Ngày tạo:</strong>{" "}
                  {formatDate(
                    detailProduct.createdAt ||
                      detailProduct.created_at ||
                      detailProduct.createdDate ||
                      detailProduct.created ||
                      detailProduct.created_on ||
                      detailProduct.createdTime ||
                      detailProduct.created_time
                  )}
                </div>
              </Col>

              <Col xs={24} md={12} lg={16}>
                <strong>Hình ảnh:</strong>
                <div style={{ marginTop: 8, minHeight: 120 }}>
                  {detailLoading ? (
                    <Spin tip="Đang tải chi tiết..." />
                  ) : detailProduct.__images?.length ? (
                    <Image.PreviewGroup>
                      <Row gutter={[8, 8]}>
                        {detailProduct.__images.map((url, idx) => (
                          <Col key={idx} xs={8} sm={6} md={6} lg={6}>
                            <Image
                              src={url}
                              alt={`product-${idx}`}
                              style={{ borderRadius: 6, objectFit: "cover" }}
                              width="100%"
                              height={100}
                              preview={{ mask: "Xem ảnh" }}
                            />
                          </Col>
                        ))}
                      </Row>
                    </Image.PreviewGroup>
                  ) : (
                    <div style={{ color: "#888" }}>Không có hình ảnh.</div>
                  )}
                </div>
              </Col>
            </Row>

            <div style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>
              <strong>Mô tả:</strong>
              <div>
                {detailProduct.description ||
                  detailProduct.desc ||
                  "Không có mô tả"}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductsTab;
