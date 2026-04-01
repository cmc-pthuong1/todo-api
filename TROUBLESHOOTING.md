# Sổ Tay Khắc Phục Lỗi (Troubleshooting Guide)
Tài liệu này tổng hợp lại toàn bộ các "kiếp nạn" bạn đã gặp phải trong quá trình xây dựng Todo-API và cách giải quyết triệt để từng vấn đề. Cực kỳ hữu ích để ôn tập lại kiến thức Node.js/Express!

---

### 1. Lỗi bị chặn kết nối tới MongoDB Atlas (`ECONNREFUSED ::1:27017` / `IP not whitelisted`)
* **Nguyên nhân:** Do bạn chạy code ở mạng Công ty. Mạng nội bộ thường thiết lập tường lửa (Firewall) chặn các cổng lạ (như 27017 của Database) đi ra Internet. Hoặc do địa chỉ IP của bạn chưa được cấp phép (Whitelist) trên trang chủ MongoDB Atlas.
* **Giải pháp đã dùng:** Chuyển sang dùng thư viện `mongodb-memory-server`. Thư viện này tự động khởi tạo một cỗ máy MongoDB "ảo" vĩnh viễn nằm ngay trên RAM máy tính của bạn khi chạy `node server.js`. Vừa miễn nhiễm với Internet, vừa không cần cài đặt rườm rà.

---

### 2. Lỗi `Operation todos.find() buffering timed out after 10000ms`
* **Nguyên nhân:** Ở lần chạy đầu tiên, Database ảo ngầm cần khoảng 10-30 giây để tải xuống Core của MongoDB. Trong lúc đó, cục Express API của bạn lại khởi chạy cái rụp và mở luôn cổng 3001. Khi bạn chọt API lúc DB chưa nối mạng xong, Mongoose sẽ phải "nén" (buffer) request của bạn vào một hàng chờ. Sau 10 giây chờ vô vọng, nó nhả ra lỗi Timeout.
* **Giải pháp đã dùng:** Ép Node.js đánh đu theo tuần tự. Gói cục `app.listen(3001)` vào bên trong khối lệnh chạy thành công `.then()` của hàm khởi động DB.
  ```javascript
  connectDB().then(() => {
    app.listen(3001, () => console.log('Chỉ mở cổng 3001 khi DB ok!'));
  });
  ```

---

### 3. Server Node.js bị Crash (Sập hoàn toàn) mỗi khi một API gặp lỗi lạ
* **Nguyên nhân:** Các hàm `async/await` ở Route khi tương tác với DB nếu gặp lỗi (sai ID, sai kiểu dữ liệu...) sẽ sinh ra lỗi. Express 4.x mặc định không có khả năng tự bắt các lỗi bất đồng bộ này. Một cái lỗi rơi lơ lửng sượt ra ngoài luồng sẽ "đấm chết" tức khắc tiến trình Node.exe.
* **Giải pháp đã dùng:** Tạo ra hàm Wrapper tên là `catchAsync`. Hàm này móc vào toàn bộ API, chủ động bắt lại toàn bộ rác/lỗi và quăng đè nó về chốt chặn cuối cùng `Global Error Handler` (như Interceptor của Frontend). Từ đó chốt chặn này lẳng lặng trả về Status Code 500 cho Frontend chứ không làm sập Server.

---

### 4. Báo lỗi HTTP 404 (Cannot GET /todos/69ca2f...) khi thử lấy Todo By ID
* **Nguyên nhân:** 
  - (1) Ban đầu do bạn chỉ định nghĩa đường dẫn tổng `app.get('/todos')` mà quên mất không code thêm đường dẫn chi tiết `app.get('/todos/:id')`.
  - (2) Sau này là do MongoDB Ảo trên RAM có cơ chế siêu thú vị: Mỗi lần bạn tắt/bật lại Terminal, Ram bị xả, toàn bộ Data sẽ bốc hơi đi mất. Bạn cầm cái ID cũ để tìm dữ liệu trong một Database vừa được tẩy trắng!
* **Giải pháp đã dùng:** Bổ sung Route `/:id` và tạo thêm thói quen "Bắn POST tạo Item trước -> Cầm ID mới toanh -> Bắn GET ID thử nghiệm" sau mỗi lần Restart máy chủ.

---

### 5. Server sập nguồn sau 2 giây với lỗi `connect ECONNREFUSED 127.0.0.1:xxxxx`
* **Nguyên nhân:** Do cơ chế Dọn rác bộ nhớ (Garbage Collector - GC) cực kỳ "tàn nhẫn" của V8 Engine. Bạn đã vô tình khai báo biến `mongoServer` nằm cục bộ bên trong hàm `connectDB()`. Nên sau khi hàm chạy xong, biến đó dính án tử "không còn ai cần đến". Ngay lúc rảnh rỗi (hoặc sau 1-2 request), GC lôi cổ biến đó đi thủ tiêu, đốn ngã luôn cả Database ảo đang chạy.
* **Giải pháp đã dùng:** Nhổ cọc biến `mongoServer` ra ngoài Scope toàn cục như một ông vua!
  ```javascript
  let mongoServer; // <<== Chốt chặn sinh tử
  async function connectDB() {
    mongoServer = await MongoMemoryServer.create(); // Trói chặt DB vào biến toàn cục này
  }
  ```

---

### 6. Hội chứng "Zombie Process" kẹt Cổng 3001 (Port in use / Gọi API nhận lỗi cũ)
* **Nguyên nhân:** Tắt Terminal thủ công bằng dấu X thay vì bấm `Ctrl + C`, hoặc gọi lệnh Run đè lên nhau. Những ứng dụng cũ không chết đi mà trở thành "Học sinh tàng hình" chui lủi dưới hệ thống Windows, chiếm giữ khư khư cái Cổng mạng 3001. Những bóng ma này vẫn cố vươn tay kết nối về cái Database sập nguồn trước đó của chúng, báo hại bạn bấm Postman vào cổng 3001 liên tục vấp chỉ toàn lỗi `ECONNREFUSED` từ đâu rớt xuống.
* **Giải pháp đã dùng:** 
  1. Hóa kiếp chúng bằng khẩu súng M4A1 của Windows: Dùng lệnh `taskkill //F //IM node.exe` để bắn bay toàn bộ các Node tàng hình.
  2. Bứt phá công nghệ 4.0: Cài luôn `nodemon` (Lệnh `npm run dev`) để tự động hóa việc tái sinh máy chủ một cách sạch sẽ sành sanh mỗi khi bạn nhấn bấm `Ctrl + S` lưu Code.

---
*Hy vọng cuốn Sổ Tay này sẽ là hành trang đi cùng bạn rất dài trong sự nghiệp lập trình Backend NodeJS! 🚀*
