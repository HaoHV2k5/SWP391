// src/components/staff/ProductsTab.jsx
import React, { useMemo, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Space,
  Tag,
  Image,
  Row,
  Col,
  Tooltip,
  Input,
  Divider,
  Typography,
  Select,
} from "antd";
import {
  ReloadOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { usePendingProducts } from "../../hooks/useStaff";
import { vnDate, statusTag, collectImages } from "../../utils/staffUtils";
import { productsApi } from "../../services/staffApi";

const REJECT_REASONS = [
  { value: "Thông tin không hợp lệ" },
  { value: "Hình ảnh không rõ ràng" },
  { value: "Giá không hợp lý" },
  { value: "Tin trùng lặp" },
  { value: "Thiếu thông tin quan trọng" },
  { value: "Sai danh mục" },
  { value: "OTHER", label: "Khác..." },
];

// bỏ dấu & chuyển thường để search “mềm”
const norm = (s) =>
  (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

const KV = ({ label, value }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{label}</div>
    <Input readOnly value={value ?? "—"} />
  </div>
);

const ProductsTab = () => {
  const { list, reload, approve, reject, loading, initial } =
    usePendingProducts();

  // tìm kiếm
  const [query, setQuery] = useState("");

  // preview gallery
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItems, setPreviewItems] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  // chi tiết
  const [detail, setDetail] = useState(null);

  // chọn lý do từ chối
  const [rejectDlg, setRejectDlg] = useState({
    open: false,
    id: null,
    reasonKey: null,
    customText: "",
  });

  const openImages = (row, startIndex = 0) => {
    const urls = collectImages(row)
      .map((u) => (u || "").trim())
      .filter(Boolean);
    if (!urls.length) return;
    setPreviewItems(urls);
    setPreviewIndex(Math.max(0, Math.min(startIndex, urls.length - 1)));
    setPreviewOpen(true);
  };

  // danh sách sau khi lọc
  const dataFiltered = useMemo(() => {
    const q = norm(query);
    if (!q) return list;
    return (list || []).filter((r) => {
      const parts = [
        r.id,
        r.title,
        r.name,
        r.productName,
        r.description,
        r.desc,
        r.status,
        r?.seller?.username,
        r?.seller?.fullName,
        r?.user?.username,
        r?.user?.fullName,
        r?.sellerName,
        r?.vehicle?.brand,
        r?.vehicle?.model,
        r?.battery?.brand,
        r?.battery?.model,
      ]
        .filter((x) => x !== undefined && x !== null)
        .map((x) => norm(x));
      return parts.some((p) => p.includes(q));
    });
  }, [list, query]);

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
              Giá:{" "}
              {(Number(r.price || r.amount || r.cost) || 0).toLocaleString(
                "vi-VN",
                {
                  style: "currency",
                  currency: "VND",
                  maximumFractionDigits: 0,
                }
              )}{" "}
              • Người bán:{" "}
              {r?.seller?.username || r?.user?.username || r?.sellerName || "—"}
            </div>
          </div>
        ),
      },
      {
        title: "Ảnh",
        key: "images",
        width: 120,
        render: (_, r) => {
          const imgs = collectImages(r);
          const hasImgs = imgs.length > 0;
          return (
            <Tooltip title={hasImgs ? "Xem tất cả ảnh" : "Không có ảnh"}>
              <Button
                icon={hasImgs ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                onClick={() => hasImgs && openImages(r)}
                disabled={!hasImgs}
              />
            </Tooltip>
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
        width: 260,
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
              onClick={() =>
                setRejectDlg({
                  open: true,
                  id: r.id,
                  reasonKey: null,
                  customText: "",
                })
              }
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

  const openDetail = async (rec) => {
    let merged = { ...rec };
    try {
      const res = await productsApi.getDetail(rec.id);
      if (res?.data) merged = { ...merged, ...res.data };
    } catch (err) {
      // Log the error for debugging instead of leaving an empty catch block
      // (keep behavior of continuing with the original record on failure)
      // eslint-disable-next-line no-console
      console.error("Failed to fetch product detail", err);
    }
    merged.__images = collectImages(merged);
    setDetail(merged);
  };

  return (
    <div>
      {/* Thanh công cụ: Tải lại + Ô tìm kiếm */}
      <Space
        style={{
          marginBottom: 12,
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <Button icon={<ReloadOutlined />} onClick={reload}>
          Tải lại
        </Button>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm Kiếm Theo Tiêu Đề..."
          style={{ width: 360 }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Space>

      <Table
        rowKey={(r) => r.id}
        loading={initial}
        columns={columns}
        dataSource={dataFiltered}
        pagination={{ pageSize: 10 }}
      />

      {/* Gallery Preview (ẩn) */}
      {previewOpen && (
        <div style={{ display: "none" }}>
          <Image.PreviewGroup
            preview={{
              visible: previewOpen,
              current: previewIndex,
              onVisibleChange: (v) => setPreviewOpen(v),
              onChange: (current) => setPreviewIndex(current),
            }}
          >
            {previewItems.map((src, i) => (
              <Image key={src + i} src={src} />
            ))}
          </Image.PreviewGroup>
        </div>
      )}

      {/* Modal chi tiết */}
      <Modal
        title={`Chi tiết tin #${detail?.id ?? "—"}`}
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={null}
        width={1000}
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
              <Typography.Title level={5} style={{ marginTop: 0 }}>
                Thông tin tin đăng
              </Typography.Title>

              <KV label="Tiêu đề" value={detail.title || detail.name} />

              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
                  Giá
                </div>
                <Input
                  readOnly
                  value={(
                    Number(detail.price || detail.amount || detail.cost) || 0
                  ).toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    maximumFractionDigits: 0,
                  })}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
                  Mô tả
                </div>
                <Input.TextArea
                  readOnly
                  rows={3}
                  value={detail.description || detail.desc}
                />
              </div>

              <KV label="Loại sản phẩm" value={detail.productType} />

              <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
                    Trạng thái
                  </div>
                  <Tag color={statusTag(detail.status).color}>
                    {statusTag(detail.status).text}
                  </Tag>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
                    Gửi lúc
                  </div>
                  <Input
                    readOnly
                    value={vnDate(
                      detail.submitted_at ||
                        detail.createdAt ||
                        detail.created_at
                    )}
                  />
                </div>
              </div>

              <KV
                label="Người bán"
                value={
                  detail?.seller?.fullName ||
                  detail?.user?.fullName ||
                  detail?.seller?.username ||
                  detail?.user?.username ||
                  detail?.sellerName
                }
              />

              {(() => {
                const v = detail.vehicle;
                const b = detail.battery;
                if (v && !b) {
                  return (
                    <>
                      <Divider />
                      <Typography.Title level={5} style={{ marginTop: 0 }}>
                        Thông số xe (Vehicle)
                      </Typography.Title>
                      <KV label="Hãng" value={v.brand} />
                      <KV label="Mẫu" value={v.model} />
                      <KV label="Năm sản xuất" value={v.yearManufactured} />
                    </>
                  );
                }
                if (b && !v) {
                  return (
                    <>
                      <Divider />
                      <Typography.Title level={5} style={{ marginTop: 0 }}>
                        Thông số pin (Battery)
                      </Typography.Title>
                      <KV label="Hãng" value={b.brand} />
                      <KV label="Model" value={b.model} />
                      <KV label="Năm Sản Xuất" value={b.yearManufactured} />
                      <KV label="Mức Pin" value={b.batteryLevel} />
                    </>
                  );
                }
                return (
                  <>
                    <Divider />
                    <Tag>Không có thông số Vehicle/Battery</Tag>
                  </>
                );
              })()}
            </Col>
          </Row>
        )}
      </Modal>

      {/* Modal chọn lý do từ chối */}
      <Modal
        title="Chọn lý do từ chối"
        open={rejectDlg.open}
        okText="Xác nhận"
        cancelText="Hủy"
        onCancel={() =>
          setRejectDlg({
            open: false,
            id: null,
            reasonKey: null,
            customText: "",
          })
        }
        onOk={async () => {
          const { reasonKey, customText, id } = rejectDlg;
          const finalReason =
            reasonKey === "OTHER"
              ? (customText || "").trim()
              : (
                  REJECT_REASONS.find((r) => r.value === reasonKey)?.label ||
                  reasonKey ||
                  ""
                ).trim();

          if (!finalReason || finalReason.length < 3) return;
          await reject(id, finalReason);
          setRejectDlg({
            open: false,
            id: null,
            reasonKey: null,
            customText: "",
          });
        }}
      >
        <div style={{ marginBottom: 8 }}>Vui lòng chọn một lý do:</div>
        <Select
          style={{ width: "100%" }}
          placeholder="— Chọn lý do —"
          value={rejectDlg.reasonKey || undefined}
          onChange={(v) => setRejectDlg((s) => ({ ...s, reasonKey: v }))}
          options={REJECT_REASONS.map((r) => ({
            label: r.label || r.value,
            value: r.value,
          }))}
        />
        {rejectDlg.reasonKey === "OTHER" && (
          <Input.TextArea
            rows={4}
            style={{ marginTop: 10 }}
            placeholder="Nhập lý do chi tiết (tối thiểu 3 ký tự)"
            value={rejectDlg.customText}
            onChange={(e) =>
              setRejectDlg((s) => ({ ...s, customText: e.target.value }))
            }
          />
        )}
      </Modal>
    </div>
  );
};

export default ProductsTab;
