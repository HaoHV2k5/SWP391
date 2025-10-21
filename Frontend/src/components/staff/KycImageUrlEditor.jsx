// src/components/staff/KycImageUrlEditor.jsx
import React from "react";
import { Input, Row, Col, Typography } from "antd";

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

export default function KycImageUrlEditor({
  value = { frontUrl: "", backUrl: "" }, // { frontUrl, backUrl }
  onChange, // (obj) => void
  disabled = false,
}) {
  const v = {
    frontUrl: value?.frontUrl || value?.front || "",
    backUrl: value?.backUrl || value?.back || "",
  };

  const setField = (k, raw) => {
    const norm = normalizeDriveUrl(raw.trim());
    onChange?.({ ...v, [k]: norm });
  };

  return (
    <div>
      <Row gutter={12}>
        <Col span={12}>
          <Text strong>Mặt trước CCCD</Text>
          <Input
            placeholder="Dán URL ảnh mặt trước"
            value={v.frontUrl}
            disabled={disabled}
            status={v.frontUrl && !validUrl(v.frontUrl) ? "error" : ""}
            onChange={(e) => setField("frontUrl", e.target.value)}
            style={{ marginTop: 6, marginBottom: 8 }}
          />
          {v.frontUrl ? (
            <img
              src={v.frontUrl}
              style={{
                width: "100%",
                height: 200,
                objectFit: "cover",
                borderRadius: 8,
                background: "#fafafa",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: 200,
                borderRadius: 8,
                background: "#fafafa",
              }}
            />
          )}
        </Col>
        <Col span={12}>
          <Text strong>Mặt sau CCCD</Text>
          <Input
            placeholder="Dán URL ảnh mặt sau"
            value={v.backUrl}
            disabled={disabled}
            status={v.backUrl && !validUrl(v.backUrl) ? "error" : ""}
            onChange={(e) => setField("backUrl", e.target.value)}
            style={{ marginTop: 6, marginBottom: 8 }}
          />
          {v.backUrl ? (
            <img
              src={v.backUrl}
              style={{
                width: "100%",
                height: 200,
                objectFit: "cover",
                borderRadius: 8,
                background: "#fafafa",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: 200,
                borderRadius: 8,
                background: "#fafafa",
              }}
            />
          )}
        </Col>
      </Row>
    </div>
  );
}
