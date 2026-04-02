# Các Bước Triển Khai Xác Thực (Authentication) với JWT

Tài liệu này hướng dẫn chi tiết các bước để thêm tính năng xác thực bằng JSON Web Token (JWT) vào dự án Node.js / Mongoose hiện tại của chúng ta.

## Bước 1: Cài đặt các thư viện cần thiết
Đầu tiên, chúng ta cần cài đặt 2 thư viện lõi:
- **`jsonwebtoken`**: Dùng để tạo ra token (ký bằng một secret key) và xác thực mớ token đó mang lên từ Client.
- **`bcryptjs`**: Dùng để băm (mã hóa) mật khẩu trước khi lưu vào Database, giúp bảo vệ mật khẩu của người dùng.

```bash
npm install jsonwebtoken bcryptjs
```

## Bước 2: Cập nhật Cấu trúc Bảng Người Dùng (User Model)
Mở file `models/User.js` và thực hiện các thay đổi:

1. **Thêm trường `password`**: Yêu cầu bắt buộc nhập (`required: true`) và loại bỏ tự động lúc in ra (`toJSON`).
2. **Thêm Middleware `pre('save')`**: Trước khi `User` được lưu, kiểm tra xem `password` có bị sửa đổi hay không. Nếu có, dùng `bcryptjs` tạo ra một chuỗi băm ngẫu nhiên (Salt) và băm cái password mới.
3. **Thêm hàm chứng thực `matchPassword`**: Tạo một instance method để lúc đăng nhập, truyền password người dùng vừa gõ vào hàm này, so sánh đọ ngầm với cái password đã băm trong database (`bcrypt.compare`).

## Bước 3: Tạo Middleware Bảo Vệ (Protect Middleware)
Tạo file `middlewares/auth.js`. File này đóng vai trò như một "Anh bảo vệ", bắt buộc phải đưa thẻ (Token) có xác minh mới cho qua.

- Lấy token từ HTTP Header (`Authorization: Bearer <token>`).
- Nếu không có token -> Báo lỗi 401 (Không có quyền truy cập).
- Dùng `jwt.verify(token, JWT_SECRET)` để giải mã xem token còn hạn hay có bị giả mạo không.
- Giải mã thành công sẽ lấy được cái ID (Cấu hình lúc tạo token). Dùng ID tìm User từ bảng `User` rồi gắn thẳng vào bằng `req.user = ...`.
- Gọi hàm `next()` để đi tiếp vào API.

## Bước 4: Viết API Đăng Ký và Đăng Nhập
Mở file xử lý logic hệ thống API hiện tại (vd: `routes/userRoutes.js`).

### 1. API Đăng Ký (Register) - `POST /users/register`
- Nhận thông tin từ body: `name, email, password`.
- Kiểm tra xem nếu email này đã tồn tại trong DB rồi -> Báo lỗi.
- Chưa có thì tiến hành tạo tài khoản mới: `User.create(...)`.
- Tạo một JWT Token sử dụng ID của User mới phát sinh, trả token đó về cho Client tiện thể tự đăng nhập luôn.

### 2. API Đăng Nhập (Login) - `POST /users/login`
- Nhận `email, password`.
- Rà quét DB tìm xem ra cái User nào có `email` khớp không.
- Nếu thấy User -> Gọi thử `user.matchPassword(password)` (ở Bước 2) xem gõ đúng pass không.
- Nếu cả 2 đều chuẩn, tạo JWT Token chứa `_id` của user đó rồi trả ra cho Client cất.

## Bước 5: Khoá Các API Quan Trọng
Bắt đầu đục lỗ ở những file routes cần bảo vệ. (Ví dụ: `routes/todoRoutes.js`).

- Import "Anh bảo vệ" ở Bước 3 vào: `const { protect } = require('../middlewares/auth');`.
- Gắn vào các API mà bạn muốn cấm khách lạ (VD: tạo việc, sửa việc, xóa việc, xem danh sách việc...).
  ```javascript
  router.get('/', protect, catchAsync(async (req, res) => { ... }))
  ```
- **Hệ quả của bảo mật**: Thay vì tin vào user tự tay truyền lên `{"userId": 123}` lúc tạo việc, bây giờ ta sẽ ép cứng chỉ dựa trên token: `req.body.userId = req.user._id`.

---
*Ghi chú: Token tạo ra nhớ kèm Secret và quy định thời hạn hết hạn (VD: 30 ngày) để tăng cường bảo mật!*
