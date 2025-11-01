import React, { useState, useEffect } from "react";

// Load OpenAI key from environment variables (secure)
const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";

// Model rẻ + có vision (có thể dùng gpt-4o-mini)
const MODEL = "gpt-4o-mini";

// Prompt mặc định để kiểm tra CCCD Việt Nam
const DEFAULT_CCCD_PROMPT =
  "đây có phải là hình căn cước công danh hoặc là chứng minh nhân dân đều được kh, câu prompt này chỉ để check các hình ảnh nó quá khác biệt đói với ảnh căn cước công dân/ chứng minh nhân dân bình thường  thôi, chứ không check quá kĩ về thông tin";

export default function ImageMatchCheck({ imageUrls = [] }) {
  const [loading, setLoading] = useState(false);
  const [match, setMatch] = useState(null); // true | false | null
  const [reason, setReason] = useState("");
  const [err, setErr] = useState("");

  // Convert image URL to base64
  async function urlToBase64(imageUrl) {
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
  }

  // Auto check 2 first images when component mounts
  useEffect(() => {
    // Function to check a single image
    const checkSingleImage = async (imageUrl, imageIndex) => {
      const dataUrl = await urlToBase64(imageUrl);

      const systemMessage =
        "You are a strict image-to-text verifier. " +
        "Given a user description and an image, return ONLY 'TRUE' if the image content clearly matches the description, " +
        "or 'FALSE' if it does not. Provide a one-sentence reason starting with 'Reason:' on the next line. " +
        "Avoid hedging; pick the most reasonable answer.";

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
    };

    const autoCheck = async () => {
      if (!imageUrls || imageUrls.length === 0) {
        setErr("Không có ảnh để kiểm tra.");
        return;
      }
      if (!OPENAI_KEY) {
        setErr("Lỗi: Chưa cấu hình key");
        return;
      }

      setLoading(true);
      setErr("");
      setResults([]);

      try {
        const imagesToCheck = imageUrls.slice(0, 2); // Check first 2 images
        const checkPromises = imagesToCheck.map((url, idx) =>
          checkSingleImage(url, idx)
        );

        const allResults = await Promise.all(checkPromises);
        setResults(
          allResults.map((result, idx) => ({
            imageIndex: idx,
            ...result,
          }))
        );
      } catch (e) {
        setErr(e.message || String(e));
      } finally {
        setLoading(false);
      }
    };

    autoCheck();
  }, [imageUrls]);

  return (
    <div
      style={{ maxWidth: 720, margin: "24px auto", fontFamily: "system-ui" }}
    >
      <h2>AI Image Verification - CCCD Việt Nam</h2>

      {imageUrls && imageUrls.length > 0 ? (
        <>
          {/* Display images and results */}
          <div style={{ marginTop: 20 }}>
            {imageUrls.slice(0, 2).map((url, idx) => {
              const result = results.find((r) => r.imageIndex === idx);
              return (
                <div
                  key={idx}
                  style={{
                    marginBottom: 24,
                    padding: 16,
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    background: "#fafafa",
                  }}
                >
                  <div style={{ marginBottom: 12, fontWeight: 600 }}>
                    Ảnh {idx + 1} / {Math.min(imageUrls.length, 2)}
                  </div>
                  <img
                    src={url}
                    alt={`Image ${idx + 1}`}
                    style={{
                      width: "100%",
                      maxHeight: 300,
                      objectFit: "contain",
                      borderRadius: 8,
                      background: "#fff",
                      marginBottom: 12,
                    }}
                  />
                  {loading ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: 12,
                        color: "#666",
                      }}
                    >
                      Đang kiểm tra...
                    </div>
                  ) : result ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: 12,
                        borderRadius: 8,
                        background: result.match ? "#d1fae5" : "#fee2e2",
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: result.match ? "#22c55e" : "#ef4444",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                        title={result.match ? "Match" : "No match"}
                      >
                        {result.match ? "✔" : "✖"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                          {result.match ? "TRUE (Khớp)" : "FALSE (Không khớp)"}
                        </div>
                        {result.reason && (
                          <div style={{ fontSize: 14, opacity: 0.85 }}>
                            {result.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Show info about remaining images */}
          {imageUrls.length > 2 && (
            <div
              style={{
                padding: 12,
                background: "#fef3c7",
                border: "1px solid #fcd34d",
                borderRadius: 8,
                textAlign: "center",
                color: "#78350f",
                fontSize: 14,
              }}
            >
              ℹ️ Chỉ kiểm tra 2 ảnh đầu tiên. Còn {imageUrls.length - 2} ảnh
              khác.
            </div>
          )}
        </>
      ) : (
        <div
          style={{
            padding: 16,
            background: "#fff7e6",
            border: "1px solid #ffd591",
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          ⚠️ Không có ảnh để kiểm tra
        </div>
      )}

      {err && (
        <div style={{ color: "red", marginTop: 12 }}>
          <b>Lỗi:</b> {err}
        </div>
      )}
    </div>
  );
}
