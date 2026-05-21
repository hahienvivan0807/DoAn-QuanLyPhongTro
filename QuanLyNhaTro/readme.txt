Cơ chế Xác thực người dùng dựa trên Cookie bảo mật (Secure Cookie-based Authentication)
CHIẾN LƯỢC 1: Phòng chống ở Tầng Ứng dụng (Application Layer - Code)
Đây là phần bạn có thể can thiệp trực tiếp bằng code C# trong dự án của mình. Trong báo cáo, hãy trình bày giải pháp kèm đoạn code minh họa.

đặt tên: Giới hạn tần suất yêu cầu (Rate Limiting) — Chống tấn công DDoS/Brute Force
1. Cơ chế Rate Limiting (Giới hạn tần suất Request)
Khái niệm đưa vào báo cáo: Rate Limiting là cơ chế giới hạn số lượng request tối đa mà một IP (hoặc một User) được phép gửi đến máy chủ trong một khoảng thời gian nhất định. 
Nếu vượt quá, hệ thống sẽ trả về lỗi HTTP 429 Too Many Requests, giúp chặn đứng các đợt càn quét tự động của botnet ở tầng ứng dụng.

HTTP Security Headers
Server Header Suppression (hoặc tiếng Việt: Ẩn thông tin Server)