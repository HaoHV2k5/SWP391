import React, { useMemo, useState } from "react";
import { Button, Input, Space, Typography } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const normalizeDriveUrl = (url) => {
  if (!url) return "";
  const m = String(url).match(
    /https?:\/\/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([\w-]+)/
  );
  if (m?.[1]) return `https://drive.google.com/uc?export=view&id=${m[1]}`;
  return url;
};

const validUrl = (s) => {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const dedup = (arr) =>
  Array.from(new Set(arr.map((s) => s.trim()))).filter(Boolean);

export default function ImageUrlUpload({
  value = [], // ✅ MẢNG URL ảnh — đúng theo Swagger: images: string[]
  onChange, // (urls: string[]) => void
  max = 12,
  disabled = false,
  placeholder = "Dán URL ảnh (có thể nhiều URL, cách nhau bằng dấu phẩy hoặc xuống dòng)",
}) {
  const [buffer, setBuffer] = useState("");

  const images = useMemo(
    () => dedup(Array.isArray(value) ? value : []).slice(0, max),
    [value, max]
  );

  const pushMany = () => {
    const parts = String(buffer)
      .split(/[\n,]+/g)
      .map((s) => normalizeDriveUrl(s.trim()))
      .filter(validUrl);
    const next = dedup([...images, ...parts]).slice(0, max);
    onChange?.(next);
    setBuffer("");
  };

  const addOne = () => {
    const s = normalizeDriveUrl(buffer.trim());
    if (!s || !validUrl(s)) return;
    const next = dedup([...images, s]).slice(0, max);
    onChange?.(next);
    setBuffer("");
  };

  const removeAt = (idx) => onChange?.(images.filter((_, i) => i !== idx));

  const move = (idx, dir) => {
    const arr = images.slice();
    const j = idx + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    onChange?.(arr);
  };

  return (
    <div>
      <Space.Compact style={{ width: "100%", marginBottom: 8 }}>
        <Input.TextArea
          rows={2}
          value={buffer}
          disabled={disabled}
          onChange={(e) => setBuffer(e.target.value)}
          placeholder={placeholder}
        />
        <Button
          type="primary"
          onClick={pushMany}
          disabled={disabled || !buffer.trim()}
        >
          Thêm nhiều
        </Button>
        <Button onClick={addOne} disabled={disabled || !buffer.trim()}>
          <PlusOutlined /> Thêm
        </Button>
      </Space.Compact>

      <Text type="secondary">
        Đã chọn: {images.length}
        {max ? ` / ${max}` : ""}
      </Text>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: 12,
          marginTop: 12,
        }}
      >
        {images.map((url, idx) => (
          <div
            key={`${url}-${idx}`}
            style={{
              border: "1px solid #eee",
              borderRadius: 8,
              padding: 8,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <img
              src={url}
              alt=""
              style={{
                width: "100%",
                height: 90,
                objectFit: "cover",
                borderRadius: 6,
                background: "#fafafa",
              }}
            />
            <Text ellipsis style={{ fontSize: 12 }}>
              {url}
            </Text>
            <Space>
              <Button
                size="small"
                onClick={() => move(idx, -1)}
                disabled={idx === 0 || disabled}
                icon={<ArrowUpOutlined />}
              />
              <Button
                size="small"
                onClick={() => move(idx, 1)}
                disabled={idx === images.length - 1 || disabled}
                icon={<ArrowDownOutlined />}
              />
              <Button
                size="small"
                danger
                onClick={() => removeAt(idx)}
                disabled={disabled}
                icon={<DeleteOutlined />}
              />
            </Space>
          </div>
        ))}
      </div>
    </div>
  );
}
