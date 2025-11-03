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
  Tooltip,
  Select,
} from "antd";
import {
  ReloadOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { usePendingKyc } from "../../hooks/useStaff";
import { vnDate, statusTag, resolveImageUrl } from "../../utils/staffUtils";

/* ====== Lý do từ chối (giống ProductsTab) ====== */
const REJECT_REASONS = [
  { value: "Thông tin không hợp lệ" },
  { value: "Hình ảnh không rõ ràng" },
  { value: "Thiếu thông tin quan trọng" },
  { value: "Không đúng thông tin" },
  { value: "OTHER", label: "Khác..." },
];

/* ====== AI Scan Configuration ====== */
const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";
const MODEL = "gpt-4o-mini";
const DEFAULT_CCCD_PROMPT = "đây có phải là hình căn cước công danh kh";

/* ====== Helper lấy ảnh front/back từ nhiều key ====== */
function extractKycImages(rec = {}) {
  const tryKeys = (o, keys) => {
    for (const k of keys) {
      const v = o?.[k];
      if (v != null && String(v).trim() !== "") return v;
    }
    return null;
  };
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
  const pair = [front, back].filter(Boolean);
  return pair.length ? pair : fallback.slice(0, 2);
}

/* bỏ dấu để tìm kiếm mềm */
const norm = (s) =>
  (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

// helper hiển thị 1 cặp nhãn/giá trị
const KV = ({ label, value }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{label}</div>
    <Input readOnly value={value ?? "—"} />
  </div>
);

const KYCTab = () => {
  const { list, reload, approve, reject, loading, initial, loadUserInfo } =
    usePendingKyc();

  // tìm kiếm
  const [query, setQuery] = useState("");

  // chi tiết
  const [detail, setDetail] = useState(null);
  const [aiScanResult, setAiScanResult] = useState(null); // { match: true/false, reason: string }
  const [aiScanLoading, setAiScanLoading] = useState(false);

  // chọn lý do từ chối (giống ProductsTab)
  const [rejectDlg, setRejectDlg] = useState({
    open: false,
    id: null,
    reasonKey: null,
    customText: "",
  });

  // Gallery preview (giống ProductsTab)
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItems, setPreviewItems] = useState([]); // mảng url string
  const [previewIndex, setPreviewIndex] = useState(0);
  const openImages = (row, startIndex = 0) => {
    const urls = extractKycImages(row)
      .map(String)
      .map((u) => u.trim())
      .filter(Boolean);
    if (!urls.length) return;
    setPreviewItems(urls);
    setPreviewIndex(Math.max(0, Math.min(startIndex, urls.length - 1)));
    setPreviewOpen(true);
  };

  const dataFiltered = useMemo(() => {
    const q = norm(query);
    var dataList = (list || []).filter((r) => {
      if (!q) return true;

      const parts = [r.userId]
        .filter((x) => x !== undefined && x !== null)
        .map((x) => norm(x));
      return parts.some((p) => p.includes(q));
    });

    dataList.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return dataList;
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
        width: 120,
        render: (_, r) => {
          const imgs = extractKycImages(r);
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
      title: "Xác nhận duyệt KYC?",
      icon: <ExclamationCircleOutlined />,
      okText: "Duyệt",
      cancelText: "Hủy",
      onOk: async () => {
        await approve(id); // hook đã xử lý ẩn record ngay sau khi duyệt
        setDetail(null); // Đóng modal chi tiết sau khi duyệt
      },
    });
  };

  const openDetail = async (rec) => {
    const userResp = await loadUserInfo(rec.id);
    const user = userResp?.data ?? userResp?.user ?? userResp ?? null;
    setDetail({ ...rec, __user: user });
    setAiScanResult(null); // Reset AI scan result when opening new detail
  };

  // Convert image URL to base64
  const urlToBase64 = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error(`Failed to load image: ${error.message}`);
    }
  };

  // AI Scan function - returns combined result for all images
  const handleAIScan = async () => {
    if (!detail) return;
    const imgs = extractKycImages(detail);
    if (!imgs || imgs.length === 0) {
      setAiScanResult({ match: false, reason: "Không có ảnh để kiểm tra" });
      return;
    }
    if (!OPENAI_KEY) {
      setAiScanResult({ match: false, reason: "Lỗi: Chưa cấu hìnhKey" });
      return;
    }

    setAiScanLoading(true);
    try {
      const imagesToCheck = imgs.slice(0, 2); // Check first 2 images
      const checkPromises = imagesToCheck.map(async (url) => {
        let dataUrl;
        try {
          dataUrl = await urlToBase64(url);
        } catch (imgError) {
          // If image fails to load, skip AI API call and return FALSE
          return {
            match: false,
            reason: "Hình ảnh không tải được hoặc bị lỗi",
          };
        }

        const systemMessage =
          "You are a strict image-to-text verifier. " +
          "Given a user description and an image, return ONLY 'TRUE' if the image content clearly matches the description, " +
          "or 'FALSE' if it does not. Provide a one-sentence reason starting with 'Reason:' on the next line. " +
          "Respond in Vietnamese. Avoid hedging; pick the most reasonable answer.";

        const payload = {
          model: MODEL,
          messages: [
            {
              role: "system",
              content: systemMessage,
            },
            {
              role: "user",
              content: [
                { type: "text", text: `Description: ${DEFAULT_CCCD_PROMPT}` },
                {
                  type: "image_url",
                  image_url: { url: dataUrl, detail: "low" },
                },
              ],
            },
          ],
          temperature: 0,
        };

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const t = await res.text();
          throw new Error(`HTTP ${res.status} - ${t}`);
        }

        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content ?? "";
        const firstLine = text.split("\n")[0].trim().toUpperCase();
        const isTrue = firstLine.includes("TRUE");
        const reasonLine =
          text.split("\n").find((l) => l.toLowerCase().startsWith("reason:")) ||
          "";

        return { match: isTrue, reason: reasonLine };
      });

      const allResults = await Promise.all(checkPromises);

      // Combined result: FALSE if ANY image is FALSE, otherwise TRUE
      const finalMatch = allResults.every((r) => r.match === true);

      // Combine reasons in Vietnamese
      const combinedReasons = allResults
        .map((r, idx) => {
          const reason = r.reason.replace(/reason:\s*/i, "").trim();
          return reason ? `Ảnh ${idx + 1}: ${reason}` : null;
        })
        .filter(Boolean)
        .join(". ");

      const finalReason = finalMatch
        ? "Tất cả ảnh đều khớp với mô tả căn cước công dân Việt Nam. " +
          combinedReasons
        : "Một hoặc nhiều ảnh không khớp với mô tả căn cước công dân Việt Nam. " +
          combinedReasons;

      setAiScanResult({ match: finalMatch, reason: finalReason });
    } catch (error) {
      setAiScanResult({ match: false, reason: `Lỗi: ${error.message}` });
    } finally {
      setAiScanLoading(false);
    }
  };

  const imgs = extractKycImages(detail || {});

  return (
    <div>
      {/* Thanh công cụ: Tải lại + Tìm kiếm */}
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
          placeholder="Tìm kiếm..."
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

      {/* Gallery Preview: giống ProductsTab (ẩn thẻ <Image/>) */}
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
        title={`Chi tiết KYC #${detail?.id ?? "—"}`}
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={
          <Space>
            <Button
              onClick={handleAIScan}
              loading={aiScanLoading}
              disabled={aiScanLoading}
            >
              AI Scan
            </Button>
            <Button type="primary" onClick={() => setDetail(null)}>
              Đóng
            </Button>
          </Space>
        }
        width={1000}
      >
        {detail && (
          <Row gutter={16}>
            {/* Cột trái: gallery ảnh giống ProductsTab */}
            <Col span={10}>
              {imgs.length ? (
                <Image.PreviewGroup>
                  {imgs.slice(0, 12).map((u, i) => (
                    <Image
                      key={i}
                      src={u}
                      width="100%"
                      style={{ marginBottom: 8, objectFit: "cover" }}
                    />
                  ))}
                </Image.PreviewGroup>
              ) : (
                <Empty description="Không có ảnh" />
              )}
            </Col>

            {/* Cột phải: thông tin theo dạng KV + tag trạng thái */}
            <Col span={14}>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>
                Thông tin KYC
              </div>

              <KV label="User ID" value={detail.userId} />
              <KV
                label="Tài khoản"
                value={
                  detail.__user?.username ||
                  detail.__user?.email ||
                  detail.username ||
                  detail.email
                }
              />
              <KV
                label="Họ tên"
                value={detail.__user?.fullName || detail.__user?.fullname}
              />
              <KV label="Số điện thoại" value={detail.__user?.phone} />
              <KV label="Giới tính" value={detail.__user?.gender} />
              <KV label="Năm sinh" value={detail.__user?.yob} />
              <KV label="Địa chỉ" value={detail.__user?.address} />

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
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
                    value={vnDate(detail.createdAt || detail.created_at)}
                  />
                </div>
              </div>

              {/* AI Scan Result */}
              {aiScanResult && (
                <div
                  style={{
                    marginTop: 24,
                    padding: 16,
                    background: "#fafafa",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}
                  >
                    Kết quả AI Scan
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: 12,
                      borderRadius: 8,
                      background: aiScanResult.match ? "#d1fae5" : "#fee2e2",
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: aiScanResult.match ? "#22c55e" : "#ef4444",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {aiScanResult.match ? "✔" : "✖"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>
                        {aiScanResult.match
                          ? "TRUE (Khớp)"
                          : "FALSE (Không khớp)"}
                      </div>
                      {aiScanResult.reason && (
                        <div style={{ fontSize: 14, opacity: 0.85 }}>
                          {aiScanResult.reason}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Action buttons */}
                  <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                    <Button
                      type="primary"
                      loading={loading}
                      onClick={() => approveConfirm(detail.id)}
                    >
                      Duyệt
                    </Button>
                    <Button
                      danger
                      loading={loading}
                      onClick={() =>
                        setRejectDlg({
                          open: true,
                          id: detail.id,
                          reasonKey: null,
                          customText: "",
                        })
                      }
                    >
                      Từ chối
                    </Button>
                  </Space>
                </div>
              )}
            </Col>
          </Row>
        )}
      </Modal>

      {/* Modal chọn lý do từ chối (giống ProductsTab) */}
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
          await reject(id, finalReason); // hook sẽ loại khỏi list ngay
          setRejectDlg({
            open: false,
            id: null,
            reasonKey: null,
            customText: "",
          });
          setDetail(null); // Đóng modal chi tiết sau khi từ chối
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

export default KYCTab;
