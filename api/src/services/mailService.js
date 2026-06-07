import nodemailer from "nodemailer";

const isSmtpConfigured =
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS;

let transporter = null;
if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: parseInt(process.env.SMTP_PORT, 10) === 465, // true for 465, false for other ports (like 587)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const logMailToConsole = ({ to, subject, text }) => {
  console.log("\n==================================================");
  console.log("             [MOCK EMAIL LOG]");
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  console.log("--------------------------------------------------");
  console.log(text);
  console.log("==================================================\n");
};

const sendMail = async ({ to, subject, html, text }) => {
  const fromName = process.env.SMTP_FROM_NAME || "Luxury Office & Apartment Rental";
  const fromEmail = process.env.SMTP_FROM_EMAIL || "noreply@luxuryrental.com";

  if (isSmtpConfigured) {
    try {
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        text,
        html,
      });
    } catch (error) {
      console.error("Lỗi khi gửi email qua SMTP:", error);
      // Fallback to console log on SMTP failure
      logMailToConsole({ to, subject, text });
    }
  } else {
    logMailToConsole({ to, subject, text });
  }
};

export const sendVerificationEmail = async ({ email, fullName, verificationLink }) => {
  const subject = "Xác thực tài khoản - Luxury Office & Apartment Rental";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác thực tài khoản</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f6f9;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #eef2f5;
    }
    .email-header {
      background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
      padding: 40px 20px;
      text-align: center;
      color: #ffffff;
    }
    .email-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      letter-spacing: 1px;
      color: #d4af37; /* Gold */
    }
    .email-header p {
      margin: 10px 0 0 0;
      font-size: 14px;
      color: #b0c4de;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .email-body {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.6;
    }
    .email-body h2 {
      margin-top: 0;
      font-size: 20px;
      color: #1a2a3a;
    }
    .verification-button {
      display: inline-block;
      background: linear-gradient(135deg, #c5a880, #a88a5e);
      color: #ffffff !important;
      text-decoration: none !important;
      padding: 14px 35px;
      font-weight: bold;
      border-radius: 8px;
      margin: 30px 0;
      font-size: 16px;
      text-align: center;
      box-shadow: 0 4px 10px rgba(197, 168, 128, 0.3);
      border: none;
    }
    .email-footer {
      background-color: #fcfdfe;
      padding: 20px 30px;
      text-align: center;
      border-top: 1px solid #f0f4f8;
      font-size: 12px;
      color: #888888;
    }
    .email-footer p {
      margin: 5px 0;
    }
    .highlight {
      font-weight: bold;
      color: #a88a5e;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <p>Luxury Office & Apartment</p>
      <h1>XÁC THỰC TÀI KHOẢN</h1>
    </div>
    <div class="email-body">
      <h2>Xin chào ${fullName},</h2>
      <p>Cảm ơn bạn đã tin tưởng lựa chọn và đăng ký thành viên tại <span class="highlight">Luxury Office & Apartment Rental</span>.</p>
      <p>Để hoàn tất quá trình kích hoạt tài khoản và bắt đầu trải nghiệm dịch vụ thuê văn phòng & căn hộ cao cấp của chúng tôi, vui lòng nhấp vào nút xác nhận dưới đây:</p>
      <div style="text-align: center;">
        <a href="${verificationLink}" class="verification-button" target="_blank">KÍCH HOẠT TÀI KHOẢN</a>
      </div>
      <p>Đường liên kết này chỉ có hiệu lực trong vòng <span class="highlight">24 giờ</span>. Sau thời gian này, bạn sẽ cần đăng ký lại.</p>
      <p>Nếu gặp khó khăn, bạn có thể sao chép liên kết dưới đây và dán vào trình duyệt web:</p>
      <p style="word-break: break-all; font-size: 13px; color: #666666; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
        ${verificationLink}
      </p>
      <p>Nếu bạn không thực hiện đăng ký này, xin vui lòng bỏ qua email này.</p>
    </div>
    <div class="email-footer">
      <p><strong>Luxury Office & Apartment Rental Management System</strong></p>
      <p>Email này được gửi tự động, vui lòng không phản hồi.</p>
      <p>&copy; ${new Date().getFullYear()} Luxury Rental. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  const text = `Xin chào ${fullName},\n\nCảm ơn bạn đã đăng ký tài khoản tại Luxury Office & Apartment Rental. Vui lòng kích hoạt tài khoản của bạn bằng cách truy cập liên kết sau:\n${verificationLink}\n\nLiên kết này sẽ hết hạn trong vòng 24 giờ.\n\nNếu bạn không yêu cầu đăng ký này, vui lòng bỏ qua email này.\n\nTrân trọng,\nĐội ngũ Luxury Rental`;

  await sendMail({ to: email, subject, html, text });
};

export const sendSecurityEmail = async (email) => {
  const subject = "Cảnh báo bảo mật: Tài khoản tạm khóa - Luxury Rental";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cảnh báo bảo mật</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f6f9;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #eef2f5;
    }
    .email-header {
      background: linear-gradient(135deg, #8b0000, #b22222, #cd5c5c);
      padding: 40px 20px;
      text-align: center;
      color: #ffffff;
    }
    .email-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      letter-spacing: 1px;
      color: #ffffff;
    }
    .email-header p {
      margin: 10px 0 0 0;
      font-size: 14px;
      color: #ffcccb;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .email-body {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.6;
    }
    .email-body h2 {
      margin-top: 0;
      font-size: 20px;
      color: #8b0000;
    }
    .warning-box {
      background-color: #fff5f5;
      border-left: 4px solid #ff4d4d;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
      font-size: 14px;
    }
    .warning-box p {
      margin: 5px 0;
      color: #721c24;
    }
    .email-footer {
      background-color: #fcfdfe;
      padding: 20px 30px;
      text-align: center;
      border-top: 1px solid #f0f4f8;
      font-size: 12px;
      color: #888888;
    }
    .email-footer p {
      margin: 5px 0;
    }
    .highlight {
      font-weight: bold;
      color: #ff4d4d;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <p>Cảnh báo bảo mật</p>
      <h1>KHÓA TÀI KHOẢN TẠM THỜI</h1>
    </div>
    <div class="email-body">
      <h2>Phát hiện hành vi đăng nhập bất thường,</h2>
      <p>Hệ thống giám sát bảo mật của <span style="font-weight: bold; color: #1a2a3a;">Luxury Office & Apartment Rental</span> ghi nhận tài khoản của bạn vừa có liên tiếp 5 lần đăng nhập không thành công.</p>
      
      <div class="warning-box">
        <p><strong>Trạng thái:</strong> Tạm khóa trong 15 phút</p>
        <p><strong>Mục tiêu:</strong> Bảo vệ tài khoản tránh khỏi các cuộc tấn công dò tìm mật khẩu (brute-force).</p>
      </div>

      <p>Tài khoản liên kết với địa chỉ email này đã bị tạm khóa để bảo vệ dữ liệu cá nhân của bạn. Vui lòng thử lại sau 15 phút hoặc liên hệ với bộ phận hỗ trợ khách hàng nếu bạn cần trợ giúp khôi phục quyền truy cập.</p>
      <p>Nếu bạn không thực hiện các lần đăng nhập này, vui lòng <span class="highlight">thay đổi mật khẩu ngay lập tức</span> sau khi tài khoản được mở khóa, hoặc liên hệ khẩn cấp với ban quản lý tòa nhà.</p>
    </div>
    <div class="email-footer">
      <p><strong>Luxury Office & Apartment Rental Management System</strong></p>
      <p>Email này được gửi tự động để đảm bảo an toàn cho tài khoản của bạn.</p>
      <p>&copy; ${new Date().getFullYear()} Luxury Rental. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  const text = `Xin chào,\n\nTài khoản của bạn đã bị tạm khóa trong 15 phút do phát hiện 5 lần đăng nhập thất bại liên tiếp.\n\nNếu đây không phải là bạn, vui lòng liên hệ với ban quản lý để được hỗ trợ kịp thời.\n\nTrân trọng,\nĐội ngũ Luxury Rental`;

  await sendMail({ to: email, subject, html, text });
};
