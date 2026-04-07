# Todo API

## 📌 Tiêu đề & Mô Tả Dự Án

**Todo API** là một RESTful API được xây dựng bằng Node.js và Express.js, cung cấp các chức năng quản lý danh sách công việc (todo list). API này hỗ trợ xác thực người dùng, quản lý các tác vụ và lưu trữ dữ liệu an toàn sử dụng MongoDB.

Dự án được thiết kế để giúp người dùng:
- ✅ Tạo, cập nhật, xóa và lấy danh sách công việc
- 🔐 Xác thực và quản lý người dùng
- 🛡️ Bảo mật dữ liệu với JWT và mã hóa mật khẩu
- 📊 Lưu trữ dữ liệu linh hoạt với MongoDB

---

## 🚀 Cách Cài Đặt & Chạy

### 📋 Yêu Cầu
- Node.js (v14.0.0 trở lên)
- npm hoặc yarn
- MongoDB (hoặc sử dụng mongodb-memory-server cho test)

### 📥 Cài Đặt

1. **Clone repository:**
```bash
git clone https://github.com/cmc-pthuong1/todo-api.git
cd todo-api
```

2. **Cài đặt dependencies:**
```bash
npm install
```

3. **Cấu hình biến môi trường:**
Tạo file `.env` trong thư mục gốc:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/todo-db
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

4. **Chạy ứng dụng:**

**Development mode (với auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server sẽ khởi động tại `http://localhost:3000`

---

## 📚 API Documentation

### 🔐 Authentication

#### Đăng Ký
- **POST** `/auth/register`
- **Body:**
```json
{
  "username": "user@example.com",
  "password": "password123"
}
```
- **Response:** `{ token: "jwt_token_here" }`

#### Đăng Nhập
- **POST** `/auth/login`
- **Body:**
```json
{
  "username": "user@example.com",
  "password": "password123"
}
```
- **Response:** `{ token: "jwt_token_here" }`

---

### ✅ Todo Endpoints

#### Lấy Tất Cả Công Việc
- **GET** `/todos`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `[ { id, title, description, completed, createdAt } ]`

#### Tạo Công Việc Mới
- **POST** `/todos`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "title": "Học Node.js",
  "description": "Học cơ bản về Node.js"
}
```
- **Response:** `{ id, title, description, completed: false, createdAt }`

#### Cập Nhật Công Việc
- **PUT** `/todos/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "title": "Học Express.js",
  "description": "Học framework Express",
  "completed": true
}
```
- **Response:** `{ id, title, description, completed, updatedAt }`

#### Xóa Công Việc
- **DELETE** `/todos/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{ message: "Todo deleted successfully" }`

---

## 🛠️ Công Nghệ Sử Dụng

| Công Nghệ | Phiên Bản | Mô Tả |
|-----------|----------|-------|
| **Node.js** | - | Runtime JavaScript phía server |
| **Express.js** | ^5.2.1 | Framework web cho Node.js |
| **Mongoose** | ^8.23.0 | ODM (Object Data Modeling) cho MongoDB |
| **MongoDB** | - | Cơ sở dữ liệu NoSQL |
| **JWT** (jsonwebtoken) | ^9.0.3 | Xác thực và ủy quyền |
| **bcryptjs** | ^3.0.3 | Mã hóa mật khẩu an toàn |
| **CORS** | ^2.8.6 | Xử lý Cross-Origin Resource Sharing |
| **Nodemon** | ^3.1.14 | Auto-reload khi phát triển (Dev) |
| **mongodb-memory-server** | ^10.4.3 | MongoDB in-memory cho testing |

---

## 📁 Cấu Trúc Thư Mục

```
todo-api/
├── server.js              # File khởi động chính
├── package.json           # Dependencies và scripts
├── .env                   # Biến môi trường (không commit)
├── models/                # Schema Mongoose
│   ├── User.js
│   └── Todo.js
├── routes/                # API routes
│   ├── auth.js
│   └── todos.js
├── middleware/            # Custom middleware
│   └── auth.js            # JWT verification
└── controllers/           # Business logic
    ├── authController.js
    └── todoController.js
```

---

## 🧪 Testing

Chạy test:
```bash
npm test
```

---

## 📝 Giấy Phép

Dự án này được phát hành dưới giấy phép **ISC**.

---

## 👤 Tác Giả

- **cmc-pthuong1** - [GitHub Profile](https://github.com/cmc-pthuong1)

---

## 💡 Ghi Chú

- Đảm bảo MongoDB đang chạy trước khi khởi động server
- Luôn giữ file `.env` bảo mật và không commit lên repository
- Sử dụng Postman hoặc Thunder Client để test API

---

**Happy Coding! 🎉**