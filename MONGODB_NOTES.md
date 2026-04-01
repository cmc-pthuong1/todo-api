# 📚 Sổ Tay Kiến Thức MongoDB & Mongoose

Tài liệu này lưu trữ các khái niệm quan trọng trong quá trình làm việc với MongoDB và Mongoose để tiện ôn tập.

---

## 1. Sự thật về hàm `query.populate()`
Trong cơ sở dữ liệu phi quan hệ NoSQL (như MongoDB), dữ liệu của các bảng (collections) sống hoàn toàn độc lập với nhau. Bảng `Todo` chỉ lưu một con số vô tri là `userId: 1`, chứ không hề biết "User số 1 là ai, tên gì".
Hàm `.populate()` trong Mongoose sinh ra để mô phỏng lại lệnh **`JOIN`** của SQL truyền thống, giúp giải quyết sự rời rạc đó.

### Cơ chế hoạt động ngầm (Under the hood):
Khi gọi `const todos = await Todo.find({ userId: 1 }).populate('user')`, Mongoose sẽ làm **2 việc ngầm tương ứng với 2 vòng truy vấn**:
1. **Truy vấn 1:** Xuống bảng `Todo`, nhặt lên tất cả các công việc có `userId = 1`.
2. **Truy vấn 2 (Sức mạnh của Populate):** Mongoose âm thầm ôm con số `1` vừa nhặt được, vác sang bảng `User` để truy vấn ngầm một câu: *"Cho xin thông tin của ông User có ID bằng 1"*.
3. **Lắp ráp (Stitching):** Cuối cùng, Mongoose dùng sức mạnh của RAM Node.js để khâu dính cục dữ liệu người dùng vào thẳng bên trong lỗ hổng tên là `user` của từng công việc (`Todo`) tương ứng.

### Tại sao lại bẻ đôi câu lệnh thay vì gọi thẳng `.populate()` ngay từ đầu?
Trong kỹ thuật nâng cao, bạn thường thấy cách viết bẻ đôi như sau (Kỹ thuật Query Builder):
```javascript
let query = Todo.find({ userId: 1 }); // Bước 1: Chuẩn bị kịch bản (Chưa chạy Data)

if (req.query.userInfo === 'true') {
  query = query.populate('user', 'name email'); // Bước 2: Nối thêm lệnh phụ vào kịch bản nếu phía Client yêu cầu
}

const todos = await query; // Bước 3: Bóp cò! Lúc này Mongoose mới chính thức ôm cái kịch bản mang xuống Database để chạy thực sự.
```
> **💡 Tạm kết:** 
> `query.populate` là một lệnh "tốn kém" vì nó bắt Database phải chạy 2 vòng. Kỹ thuật tách đôi lệnh giúp chúng ta tự do tùy biến câu truy vấn. Chỉ khi nào Frontend (hoặc Postman) thực sự cần thông tin User, ta mới lắp thêm ống ngắm `.populate()` vào để đỡ lãng phí hiệu năng của toàn bệ thống!
