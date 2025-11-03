// src/components/staff/ProductsTab.jsx
import React, { useMemo, useState } from "react";
import {
  List,
  Card,
  Button,
  Modal,
  Space,
  Tag,
  Image,
  Row,
  Col,
  Tooltip,
  Input,
  Typography,
  Select,
  Avatar,
  Affix,
  Skeleton,
  Badge,
  Popconfirm,
  Descriptions,
  Divider,
} from "antd";
import {
  ReloadOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SearchOutlined,
  GiftOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  PictureOutlined,
} from "@ant-design/icons";
import { usePendingProducts } from "../../hooks/useStaff";
import { vnDate, statusTag, collectImages } from "../../utils/staffUtils";
import { productsApi } from "../../services/staffApi";

const { Title, Text } = Typography;

const REJECT_REASONS = [
  { value: "Thông tin không hợp lệ" },
  { value: "Hình ảnh không rõ ràng" },
  { value: "Giá không hợp lý" },
  { value: "Tin trùng lặp" },
  { value: "Thiếu thông tin quan trọng" },
  { value: "Sai danh mục" },
  { value: "OTHER", label: "Khác..." },
];

const PACKAGE_FILTER_OPTIONS = [
  {
    label: "Gói Cơ Bản (Kèm kiểm duyệt)",
    value: "Gói Cơ Bản (Kèm kiểm duyệt)",
  },
  {
    label: "Gói Nâng Cao (Kèm kiểm duyệt)",
    value: "Gói Nâng Cao (Kèm kiểm duyệt)",
  },
  {
    label: "Gói Premium (Kèm kiểm duyệt)",
    value: "Gói Premium (Kèm kiểm duyệt)",
  },
  { label: "Tất cả", value: null },
];

// bỏ dấu & chuyển thường để search “mềm”
const norm = (s) =>
  (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

const cardStyle = {
  borderRadius: 16,
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)",
};

const headerWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const toolbarCardStyle = {
  position: "sticky",
  top: 64,
  zIndex: 9,
  backdropFilter: "saturate(180%) blur(8px)",
  background: "rgba(255,255,255,0.75)",
  borderRadius: 12,
  marginBottom: 12,
};

const priceChipStyle = {
  fontSize: 18,
  padding: "2px 8px",
  borderRadius: 8,
  background: "#fff1f0",
  border: "1px solid #ffd6d6",
  lineHeight: 1.4,
};

const coverPlaceholder = (
  <div
    style={{
      width: "100%",
      height: 260,
      background: "linear-gradient(135deg,#fafafa,#f0f0f0)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#aaa",
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    }}
  >
    <PictureOutlined style={{ fontSize: 36 }} />
    <span style={{ marginLeft: 8 }}>(Không có ảnh)</span>
  </div>
);

/** Lấy key nhóm seller (ưu tiên id, fallback username/name) */
function getSellerKey(r) {
  return (
    r?.sellerId ??
    r?.seller?.id ??
    r?.user?.id ??
    r?.seller?.username ??
    r?.user?.username ??
    r?.sellerName ??
    "unknown"
  );
}

/** Chuẩn hóa text hiển thị cho ô Seller */
function getSellerDisplay(r) {
  const id =
    r?.sellerId ?? r?.seller?.id ?? r?.user?.id ?? r?.sellerName ?? "—";
  const name =
    r?.seller?.fullName ||
    r?.user?.fullName ||
    r?.seller?.username ||
    r?.user?.username ||
    r?.sellerName ||
    "";
  return { idText: String(id), nameText: String(name || "") };
}

/** Gom nhóm theo seller để render feed đẹp hơn */
function groupBySeller(items = []) {
  const groups = new Map(); // key -> { header, rows: [] }
  for (const it of items) {
    const key = getSellerKey(it);
    if (!groups.has(key)) {
      const { idText, nameText } = getSellerDisplay(it);
      const upp = it?.postingPackage; // user_posting_package
      const pkgName = it?.packageName || "—";
      const dateFrom = it?.startTime ? vnDate(upp.startTime) : "—";
      const dateTo = it?.endTime ? vnDate(upp.endTime) : "—";
      const remaining = it?.postPossible ?? null;
      const isActive = it?.active === true;

      groups.set(key, {
        header: {
          sellerId: idText,
          sellerName: nameText,
          pkgName,
          dateFrom,
          dateTo,
          remaining,
          isActive,
        },
        rows: [],
      });
    }
    groups.get(key).rows.push(it);
  }
  return Array.from(groups.values());
}

const ProductsTab = () => {
  const { list, reload, approve, reject, loading, initial } =
    usePendingProducts();

  const [query, setQuery] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItems, setPreviewItems] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [pkgUI, setPkgUI] = useState(null);
  const [detail, setDetail] = useState(null);
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
    let base = list || [];
    if (q) {
      base = base.filter((r) => {
        const parts = [
          r.productName,
          r?.seller?.fullName,
          r?.user?.username,
          r?.user?.fullName,
          r?.sellerName,
          r?.price,
        ]
          .filter((x) => x !== undefined && x !== null)
          .map((x) => norm(x));
        return parts.some((p) => p.includes(q));
      });
    }
    // filter By Package (áp dụng thật)
    base = base.filter((x) => {
      if (pkgUI == null) return true;
      return x?.packageName == pkgUI;
    });

    var baseA = base.filter((x) => {
      return x?.packageName == "Gói Cơ Bản (Kèm kiểm duyệt)";
    });

    var baseB = base.filter((x) => {
      return x?.packageName == "Gói Nâng Cao (Kèm kiểm duyệt)";
    });

    var baseC = base.filter((x) => {
      return x?.packageName == "Gói Premium (Kèm kiểm duyệt)";
    });

    base = baseC.concat(baseB).concat(baseA);
    return base;
  }, [list, query, pkgUI]);

  // Gom nhóm theo seller để hiện feed “section”
  const sections = useMemo(() => groupBySeller(dataFiltered), [dataFiltered]);

  const approveConfirm = async (id) => {
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
      // eslint-disable-next-line no-console
      console.error("Failed to fetch product detail", err);
    }
    merged.__images = collectImages(merged);
    setDetail(merged);
  };

  const renderPostCard = (r) => {
    const imgs = collectImages(r);
    const hasImgs = imgs.length > 0;

    const priceStr = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(Number(r.price || r.amount || r.cost) || 0);

    const status = statusTag(r.status);
    const title = r.title || r.name || r.productName || "(Không tiêu đề)";
    const timeStr = vnDate(r.submitted_at || r.createdAt || r.created_at);
    const pkgName = r?.packageName || "—";

    const cover = hasImgs ? (
      <div
        style={{
          position: "relative",
          height: 260,
          background: "#fafafa",
          overflow: "hidden",
          display: "flex",
          alignItems: "center", // vertical center
          justifyContent: "center", // horizontal center
        }}
        onClick={() => openImages(r, 0)}
      >
        <Image
          src={imgs[0]}
          alt="cover"
          preview={false}
          imgStyle={{
            maxWidth: "100%",
            maxHeight: "100%",
            display: "block",
            objectFit: "contain",
            objectPosition: "center center",
          }}
        />
      </div>
    ) : (
      coverPlaceholder
    );

    return (
      <Badge.Ribbon text={""} color="cyan">
        <Card
          key={r.id}
          style={{
            ...cardStyle,
            height: "100%", // stretch card to cell
            display: "flex",
            flexDirection: "column",
          }}
          cover={cover}
          bodyStyle={{
            padding: 16,
            display: "flex",
            flexDirection: "column",
            flex: 1, // body fills remaining height
          }}
          actions={[
            <Tooltip title="Xem chi tiết" key="detail">
              <Button size="small" onClick={() => openDetail(r)}>
                Chi tiết
              </Button>
            </Tooltip>,

            <Tooltip title="Duyệt bài" key="approve">
              <Popconfirm
                title="Duyệt tin này?"
                onConfirm={() => approve(r.id)}
              >
                <Button
                  type="primary"
                  size="small"
                  loading={loading}
                  icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
                >
                  Duyệt
                </Button>
              </Popconfirm>
            </Tooltip>,

            <Tooltip title="Từ chối" key="reject">
              <Popconfirm
                title="Từ chối tin này?"
                description="Bạn sẽ chọn lý do ở bước tiếp theo."
                onConfirm={() =>
                  setRejectDlg({
                    open: true,
                    id: r.id,
                    reasonKey: null,
                    customText: "",
                  })
                }
              >
                <Button
                  danger
                  size="small"
                  loading={loading}
                  icon={<CloseCircleTwoTone twoToneColor="#ff4d4f" />}
                >
                  Từ chối
                </Button>
              </Popconfirm>
            </Tooltip>,

            <Tooltip
              title={hasImgs ? "Xem tất cả ảnh" : "Không có ảnh"}
              key="images"
            >
              <Button
                size="small"
                icon={hasImgs ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                onClick={() => hasImgs && openImages(r)}
                disabled={!hasImgs}
              />
            </Tooltip>,
          ]}
        >
          {/* Body content */}
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "space-between",
            }}
          >
            <div style={{ maxWidth: "72%" }}>
              <Title level={5} style={{ margin: 0 }}>
                <span
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: 1.3, // line height for each row
                    height: "calc(1.3em * 2)", // exactly 2 lines tall
                    minHeight: "calc(1.3em * 2)",
                    overflowWrap: "anywhere", // break long words/URLs
                    wordBreak: "break-word",
                  }}
                >
                  {title}
                </span>
              </Title>

              <div style={{ marginTop: 6 }}>
                <Tag color={status.color} style={{ marginRight: 8 }}>
                  {status.text}
                </Tag>
                <Tag>{timeStr}</Tag>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <Text
                strong
                style={{
                  ...priceChipStyle,
                  whiteSpace: "nowrap",
                  wordBreak: "keep-all",
                }}
              >
                {priceStr}
              </Text>
            </div>
          </div>
        </Card>
      </Badge.Ribbon>
    );
  };

  return (
    <div>
      {/* (tùy chọn) nhỏ CSS hover cho cover */}
      <style>{`.post-cover:hover { transform: scale(1.02); }`}</style>

      {/* Thanh công cụ: Sticky */}
      <Affix>
        <Card
          bordered={false}
          bodyStyle={{ padding: 12 }}
          style={toolbarCardStyle}
        >
          <Space
            style={{ width: "100%", justifyContent: "space-between" }}
            wrap
          >
            <Button icon={<ReloadOutlined />} onClick={reload}>
              Tải lại
            </Button>

            <Select
              allowClear
              value={pkgUI ?? undefined}
              onChange={(v) => setPkgUI(v)}
              placeholder="Lọc theo gói"
              style={{ minWidth: 220 }}
              options={PACKAGE_FILTER_OPTIONS}
            />

            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Tìm Kiếm Theo Tiêu Đề..."
              style={{ width: 360 }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Space>
        </Card>
      </Affix>

      {/* FEED THEO SELLER */}
      {initial ? (
        <List grid={{ gutter: 16, xs: 1, md: 2, lg: 3 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <List.Item key={i} style={{ display: "flex" }}>
              <div style={{ width: "100%", display: "flex" }}>
                <Card style={{ ...cardStyle, height: "100%", flex: 1 }}>
                  <Skeleton active paragraph={{ rows: 3 }} />
                </Card>
              </div>
            </List.Item>
          ))}
        </List>
      ) : sections.length === 0 ? (
        <div style={{ padding: 12 }}>Không có bài đăng nào.</div>
      ) : (
        sections.map((sec, idx) => {
          const h = sec.header;
          console.log(h);
          const avatarText =
            (
              h?.sellerName?.trim?.()[0] ||
              h?.sellerId?.trim?.()[0] ||
              "?"
            ).toUpperCase?.() || "?";

          const tip = (
            <div style={{ minWidth: 240 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                {h.pkgName}
              </div>
              <div style={{ fontSize: 12, color: "#555" }}>
                Thời hạn: <b>{h.dateFrom}</b> → <b>{h.dateTo}</b>
              </div>
              <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
                Bài còn lại: <b>{h.remaining ?? "—"}</b>
              </div>
              <div style={{ marginTop: 8 }}>
                <Tag color={h.isActive ? "green" : "default"}>
                  {h.isActive ? "Đang hiệu lực" : "Hết hạn / Không hoạt động"}
                </Tag>
              </div>
            </div>
          );

          return (
            <div key={idx} style={{ marginBottom: 24 }}>
              {/* Seller Header */}
              <div style={{ ...headerWrapStyle, marginBottom: 12 }}>
                <Avatar size={44} style={{ background: "#1677ff" }}>
                  {avatarText}
                </Avatar>
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {h.sellerName || "—"}
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      (ID: {h.sellerId})
                    </Text>
                  </div>
                  <Tag
                    icon={<GiftOutlined />}
                    color="processing"
                    style={{ cursor: "help", marginTop: 6 }}
                  >
                    {h?.pkgName}
                  </Tag>
                </div>
              </div>

              {/* Seller's posts */}
              <List
                grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 4, xxl: 4 }}
                dataSource={sec.rows}
                renderItem={(item) => (
                  <List.Item style={{ display: "flex" }}>
                    <div style={{ width: "100%", display: "flex" }}>
                      {renderPostCard(item)}
                    </div>
                  </List.Item>
                )}
              />
            </div>
          );
        })
      )}

      {/* Gallery Preview */}
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
        footer={
          <Space>
            <Button type="primary" onClick={() => setDetail(null)}>
              Đóng
            </Button>
          </Space>
        }
        width={1000}
      >
        <style>{`
          .desc-auto .ant-descriptions-view { table-layout: auto !important; }
          .nowrap { white-space: nowrap; }
          .desc-box { background:#fafafa; border:1px solid #f0f0f0; border-radius:6px; padding:8px; }
        `}</style>

        {detail && (
          <Row gutter={16}>
            {/* LEFT: Gallery */}
            <Col span={8}>
              {detail.__images?.length ? (
                <Image.PreviewGroup>
                  {detail.__images.slice(0, 12).map((u, i) => (
                    <Image
                      key={i}
                      src={u}
                      width="100%"
                      style={{
                        marginBottom: 8,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                  ))}
                </Image.PreviewGroup>
              ) : (
                <div
                  style={{
                    height: 360,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px dashed #e5e5e5",
                    borderRadius: 12,
                    color: "#999",
                    background: "#fafafa",
                  }}
                >
                  Không có ảnh
                </div>
              )}
            </Col>

            {/* RIGHT: Info */}
            <Col span={16}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <Title level={5} style={{ margin: 0 }}>
                  Thông tin tin đăng
                </Title>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Tag
                    color={statusTag(detail.status).color}
                    style={{ margin: 0 }}
                  >
                    {statusTag(detail.status).text}
                  </Tag>
                  <div
                    className="nowrap"
                    style={{
                      fontWeight: 700,
                      ...priceChipStyle,
                    }}
                  >
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                      maximumFractionDigits: 0,
                    }).format(
                      Number(detail.price || detail.amount || detail.cost) || 0
                    )}
                  </div>
                </div>
              </div>

              <Descriptions
                className="desc-auto"
                bordered
                size="middle"
                column={{ xs: 1, sm: 1, md: 2, lg: 2 }}
                labelStyle={{ width: 160 }}
              >
                <Descriptions.Item label="Tiêu đề" span={2}>
                  <span className="nowrap">
                    {detail.title || detail.name || "—"}
                  </span>
                </Descriptions.Item>

                <Descriptions.Item label="Gửi lúc">
                  <span className="nowrap">
                    {vnDate(
                      detail.submitted_at ||
                        detail.createdAt ||
                        detail.created_at
                    )}
                  </span>
                </Descriptions.Item>

                <Descriptions.Item label="Người bán" span={2}>
                  {detail?.seller?.fullName ||
                    detail?.user?.fullName ||
                    detail?.seller?.username ||
                    detail?.user?.username ||
                    detail?.sellerName ||
                    "—"}
                </Descriptions.Item>

                <Descriptions.Item label="Loại sản phẩm" span={2}>
                  {detail.productType || "—"}
                </Descriptions.Item>

                <Descriptions.Item label="Mô tả" span={2}>
                  <div
                    className="desc-box"
                    style={{
                      maxHeight: 160,
                      overflow: "auto",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {detail.description || detail.desc || "—"}
                  </div>
                </Descriptions.Item>
              </Descriptions>

              {(() => {
                const v = detail.vehicle;
                const b = detail.battery;

                if (v && !b) {
                  return (
                    <>
                      <Divider />
                      <Title level={5} style={{ marginTop: 0 }}>
                        Thông số xe (Vehicle)
                      </Title>
                      <Descriptions
                        className="desc-auto"
                        bordered
                        size="middle"
                        column={{ xs: 1, md: 2 }}
                      >
                        <Descriptions.Item label="Hãng">
                          {v.brand || "—"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Mẫu">
                          {v.model || "—"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Năm sản xuất">
                          {v.yearManufactured || "—"}
                        </Descriptions.Item>
                      </Descriptions>
                    </>
                  );
                }

                if (b && !v) {
                  return (
                    <>
                      <Divider />
                      <Title level={5} style={{ marginTop: 0 }}>
                        Thông số pin (Battery)
                      </Title>
                      <Descriptions
                        className="desc-auto"
                        bordered
                        size="middle"
                        column={{ xs: 1, md: 2 }}
                      >
                        <Descriptions.Item label="Hãng">
                          {b.brand || "—"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Model">
                          {b.model || "—"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Năm Sản Xuất">
                          {b.yearManufactured || "—"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Mức Pin">
                          {b.batteryLevel || "—"}
                        </Descriptions.Item>
                      </Descriptions>
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
