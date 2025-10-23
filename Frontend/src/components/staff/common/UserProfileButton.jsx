// src/components/staff/common/UserProfileButton.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Drawer,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  message,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { userApi } from "../../../services/userApi";

dayjs.extend(customParseFormat);

/** Hỗ trợ đọc nhiều format từ DB/API */
const YOB_FORMATS_IN = ["DD-MM-YYYY", "YYYY-MM-DD", "DD/MM/YYYY", "YYYY/MM/DD"];
/** UI hiển thị */
const YOB_FORMAT_UI = "DD-MM-YYYY";
/** API gửi đi (tránh lỗi định dạng ở BE) */
const YOB_FORMAT_API = "dd-MM-yyyy";

const GENDER_OPTS = [
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
];

const parseYob = (val) => {
  if (!val) return null;
  for (const f of YOB_FORMATS_IN) {
    const d = dayjs(val, f, true);
    if (d.isValid()) return d;
  }
  // cuối cùng thử parse tự do
  const free = dayjs(val);
  return free.isValid() ? free : null;
};

const normalizeGenderIn = (g) => {
  if (!g) return undefined;
  const s = String(g).toUpperCase();
  if (["NAM", "MALE", "M"].includes(s)) return "MALE";
  if (["NỮ", "NU", "FEMALE", "F"].includes(s)) return "FEMALE";
  return "OTHER";
};

const UserProfileButton = ({ displayName = "Staff" }) => {
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const name = useMemo(() => me?.fullname || displayName, [me, displayName]);

  const loadMe = async () => {
    setLoadingMe(true);
    try {
      const data = await userApi.getMe(); // GET /users/me
      const norm = {
        ...data,
        gender: normalizeGenderIn(data?.gender),
      };
      setMe(norm);
      form.setFieldsValue({
        fullname: norm.fullname || "",
        phone: norm.phone || "",
        gender: norm.gender || undefined,
        yob: parseYob(norm.yob),
        avatar: norm.avatar || "",
        address: norm.address || "",
      });
    } catch {
      message.error("Không thể tải thông tin người dùng");
    } finally {
      setLoadingMe(false);
    }
  };

  useEffect(() => {
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    try {
      const vals = await form.validateFields();
      const payload = {
        fullname: (vals.fullname || "").trim(),
        phone: (vals.phone || "").trim(),
        gender: vals.gender || "",
        // 👇 gửi ISO cho BE
        yob: vals.yob ? dayjs(vals.yob).format(YOB_FORMAT_API) : "",
        avatar: (vals.avatar || "").trim(),
        address: (vals.address || "").trim(),
      };
      setSaving(true);
      await userApi.updateMe(payload); // PUT /users/update
      message.success("Cập nhật thành công");
      setMe((prev) => ({ ...(prev || {}), ...payload }));
      setOpen(false);
    } catch (e) {
      if (e?.errorFields) return;
      const m =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Cập nhật thất bại";
      message.error(m);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        type="text"
        onClick={() => setOpen(true)}
        style={{ display: "flex", alignItems: "center", gap: 8 }}
      >
        <Avatar size="small" src={me?.avatar} icon={<UserOutlined />} />
        <span
          style={{
            maxWidth: 180,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </span>
      </Button>

      <Drawer
        title="Cập nhật thông tin người dùng"
        open={open}
        onClose={() => setOpen(false)}
        width={480}
        destroyOnClose={false}
      >
        <Form
          layout="vertical"
          form={form}
          key={loadingMe ? "loading" : JSON.stringify(me || {})}
          initialValues={{
            fullname: me?.fullname,
            phone: me?.phone,
            gender: normalizeGenderIn(me?.gender),
            yob: parseYob(me?.yob),
            avatar: me?.avatar,
            address: me?.address,
          }}
        >
          <Form.Item
            name="fullname"
            label="Họ tên"
            rules={[{ required: true, message: "Nhập họ tên" }]}
          >
            <Input placeholder="Họ tên" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Nhập số điện thoại" },
              {
                pattern: /^[0-9+\-\s]{8,20}$/,
                message: "Số điện thoại không hợp lệ",
              },
            ]}
          >
            <Input placeholder="SĐT" />
          </Form.Item>

          <Form.Item name="gender" label="Giới tính">
            <Select
              allowClear
              placeholder="Chọn giới tính"
              options={GENDER_OPTS}
            />
          </Form.Item>

          <Form.Item
            name="yob"
            label={`Năm sinh (${YOB_FORMAT_UI})`}
            rules={[
              {
                validator: (_, v) => {
                  if (!v) return Promise.resolve();
                  if (!dayjs.isDayjs(v))
                    return Promise.reject(new Error("Ngày không hợp lệ"));
                  if (v.endOf("day").isAfter(dayjs()))
                    return Promise.reject(
                      new Error("Không được chọn ngày trong tương lai")
                    );
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format={YOB_FORMAT_UI}
              disabledDate={(cur) => cur && cur.endOf("day").isAfter(dayjs())}
              allowClear
            />
          </Form.Item>

          <Form.Item name="avatar" label="Ảnh đại diện (URL)">
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item shouldUpdate noStyle>
            {() => {
              const url = form.getFieldValue("avatar");
              return url ? (
                <div style={{ marginBottom: 12, textAlign: "center" }}>
                  <img
                    src={url}
                    alt="avatar-preview"
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
              ) : null;
            }}
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea rows={3} placeholder="Địa chỉ" />
          </Form.Item>

          <Space>
            <Button onClick={loadMe} loading={loadingMe}>
              Tải lại
            </Button>
            <Button type="primary" onClick={submit} loading={saving}>
              Lưu thay đổi
            </Button>
          </Space>
        </Form>
      </Drawer>
    </>
  );
};

export default UserProfileButton;
