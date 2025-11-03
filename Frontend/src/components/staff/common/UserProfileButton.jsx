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

// BE yêu cầu dd/MM/yyyy
const YOB_OUT = "DD/MM/YYYY";
// FE hiển thị đúng theo BE
const YOB_DISPLAY = "DD/MM/YYYY";

// nếu BE trả "22/03/2000" (đúng format) hoặc "2000-03-22" (ISO) → parse được
const parseYobFromApi = (val) => {
  if (!val) return null;
  // thử dd/MM/yyyy
  let d = dayjs(val, "DD/MM/YYYY", true);
  if (d.isValid()) return d;
  // thử ISO (yyyy-MM-dd)
  d = dayjs(val, "YYYY-MM-DD", true);
  if (d.isValid()) return d;
  // fallback cuối
  d = dayjs(val);
  return d.isValid() ? d : null;
};

const fmtYobToApi = (d) => (d ? dayjs(d).format(YOB_OUT) : "");

const GENDER_OPTS = [
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
];

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
      setMe(data);
      form.setFieldsValue({
        fullname: data.fullname || "",
        phone: data.phone || "",
        gender: data.gender || undefined,
        yob: parseYobFromApi(data.yob), // dayjs
        avatar: data.avatar || "",
        address: data.address || "",
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
      // BẮT BUỘC có yob theo BE
      if (!vals.yob) {
        message.warning("Vui lòng chọn năm sinh (định dạng dd/MM/yyyy)");
        return;
      }

      const payload = {
        fullname: (vals.fullname || "").trim(),
        gender: vals.gender || "", // BE nhận string, bạn đã giữ nguyên
        yob: fmtYobToApi(vals.yob), // → "dd/MM/yyyy"
        phone: (vals.phone || "").trim(),
        address: (vals.address || "").trim(),
        avatar: (vals.avatar || "").trim(),
      };

      setSaving(true);
      await userApi.updateMe(payload); // PUT /users/update
      message.success("Cập nhật thành công");
      setMe((prev) => ({ ...(prev || {}), ...payload }));
      setOpen(false);
    } catch (e) {
      if (e?.errorFields) return; // lỗi validate form của antd
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

  // hạn chế chọn ngày < 18 tuổi theo FE cho trùng BE
  const disabledFuture = (cur) => cur && cur.endOf("day").isAfter(dayjs());
  const minAge18 = (cur) =>
    cur && cur.endOf("day").isAfter(dayjs().subtract(18, "year").endOf("day"));

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
        title="Cập Nhật Thông Tin Của Staff "
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
            gender: me?.gender,
            yob: parseYobFromApi(me?.yob),
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
                // khớp regex BE: ^(84|0[35789])[0-9]{8}\b
                pattern: /^(84|0[35789])[0-9]{8}\b/,
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
            label="Năm sinh (dd/MM/yyyy)"
            rules={[
              { required: true, message: "Vui lòng chọn năm sinh" },
              {
                validator: (_, v) => {
                  if (!v) return Promise.resolve();
                  if (!dayjs.isDayjs(v))
                    return Promise.reject(new Error("Ngày không hợp lệ"));
                  if (v.endOf("day").isAfter(dayjs()))
                    return Promise.reject(
                      new Error("Không được chọn ngày trong tương lai")
                    );
                  if (
                    v
                      .endOf("day")
                      .isAfter(dayjs().subtract(18, "year").endOf("day"))
                  )
                    return Promise.reject(new Error("Phải từ 18 tuổi trở lên"));
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format={YOB_DISPLAY}
              // chặn chọn ngày tương lai & chặn < 18 tuổi
              disabledDate={(cur) => disabledFuture(cur) || minAge18(cur)}
              allowClear={false} // vì BE bắt buộc NotNull
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
