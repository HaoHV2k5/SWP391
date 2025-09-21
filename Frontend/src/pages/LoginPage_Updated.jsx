// Thay thế phần đăng ký trong LoginPage.jsx từ dòng 238-286
// Đăng ký - gọi API backend
try {
  const response = await fetch("http://localhost:3979/users/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      fullname: formData.fullName,
      phone: formData.phone,
      yob: formData.dateOfBirth,
      gender: "Nam", // Giá trị mặc định
      address: "Địa chỉ mặc định", // Giá trị mặc định
    }),
  });

  const data = await response.json();
  console.log("🔍 Register response:", data);

  if (data.message && data.message.includes("Check your email")) {
    toast.success(
      "Đăng ký thành công! Vui lòng kiểm tra email để xác thực OTP."
    );
    // Redirect đến trang OTP verification
    navigate("/verify-otp", {
      state: { email: formData.email },
    });
  } else {
    toast.error(data.message || "Đăng ký thất bại!");
  }
} catch (error) {
  console.error("❌ Register error:", error);
  toast.error("Lỗi kết nối server");
}
