# jianghuge.com API 接口开发项目

这是一个完整的API接口开发项目，使用Node.js + Express框架构建，包含用户管理和产品管理的完整CRUD操作。

## 🚀 项目特性

- ✅ RESTful API设计
- ✅ 完整的CRUD操作
- ✅ 分页和筛选功能
- ✅ 错误处理机制
- ✅ 安全中间件（CORS、限流、Helmet）
- ✅ 美观的前端测试界面
- ✅ 支持你的域名 jianghuge.com

## 📁 项目结构

```
Interface/
├── server.js              # 主服务器文件
├── package.json           # 项目依赖配置
├── env.example            # 环境变量示例
├── README.md              # 项目说明文档
├── routes/                # 路由文件夹
│   ├── userRoutes.js      # 用户相关接口
│   └── productRoutes.js   # 产品相关接口
└── public/                # 静态文件
    └── index.html         # 前端测试页面
```

## 🛠️ 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `env.example` 为 `.env` 并修改配置：

```bash
cp env.example .env
```

### 3. 启动服务器

开发模式（自动重启）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

服务器将在 `http://localhost:3000` 启动

## 📚 API 接口文档

### 用户管理接口

#### 获取用户列表
- **GET** `/api/users`
- **参数**: 
  - `page` (可选): 页码，默认1
  - `limit` (可选): 每页数量，默认10
- **响应**: 用户列表和分页信息

#### 获取单个用户
- **GET** `/api/users/:id`
- **参数**: `id` - 用户ID
- **响应**: 用户详细信息

#### 创建用户
- **POST** `/api/users`
- **请求体**:
  ```json
  {
    "name": "用户名",
    "email": "邮箱",
    "age": 25
  }
  ```
- **响应**: 创建的用户信息

#### 更新用户
- **PUT** `/api/users/:id`
- **请求体**: 要更新的字段
- **响应**: 更新后的用户信息

#### 删除用户
- **DELETE** `/api/users/:id`
- **响应**: 删除确认信息

### 产品管理接口

#### 获取产品列表
- **GET** `/api/products`
- **参数**:
  - `page` (可选): 页码
  - `limit` (可选): 每页数量
  - `category` (可选): 产品分类
  - `minPrice` (可选): 最低价格
  - `maxPrice` (可选): 最高价格
  - `search` (可选): 搜索关键词

#### 获取产品分类
- **GET** `/api/products/categories`
- **响应**: 所有产品分类列表

#### 获取单个产品
- **GET** `/api/products/:id`
- **参数**: `id` - 产品ID

#### 创建产品
- **POST** `/api/products`
- **请求体**:
  ```json
  {
    "name": "产品名称",
    "price": 999.99,
    "category": "分类",
    "description": "产品描述",
    "stock": 100
  }
  ```

#### 更新产品
- **PUT** `/api/products/:id`
- **请求体**: 要更新的字段

#### 删除产品
- **DELETE** `/api/products/:id`

## 🌐 前端测试

访问 `http://localhost:3000/public/index.html` 可以使用美观的Web界面测试所有API接口。

## 🔧 部署到阿里云

### 1. 服务器准备
- 购买阿里云ECS服务器
- 安装Node.js和PM2

### 2. 域名配置
- 在阿里云DNS控制台添加域名解析
- 将 `jianghuge.com` 指向你的服务器IP

### 3. 部署步骤
```bash
# 上传代码到服务器
git clone your-repository

# 安装依赖
npm install

# 使用PM2启动服务
pm2 start server.js --name jianghuge-api

# 配置Nginx反向代理（可选）
```

### 4. 环境变量配置
生产环境需要修改 `.env` 文件：
```
NODE_ENV=production
PORT=3000
```

## 🔒 安全特性

- **CORS**: 只允许指定域名访问
- **限流**: 防止API滥用
- **Helmet**: 安全头设置
- **输入验证**: 所有输入都经过验证
- **错误处理**: 统一的错误响应格式

## 📝 响应格式

所有API都使用统一的响应格式：

```json
{
  "success": true,
  "data": {
    // 具体数据
  },
  "message": "操作成功"
}
```

错误响应：
```json
{
  "success": false,
  "error": "错误信息"
}
```

## 🚀 下一步扩展

1. **数据库集成**: 连接MySQL或MongoDB
2. **用户认证**: 添加JWT认证
3. **文件上传**: 支持图片上传功能
4. **日志系统**: 添加请求日志
5. **API文档**: 集成Swagger文档
6. **缓存**: 添加Redis缓存
7. **监控**: 添加性能监控

## 📞 联系方式

如有问题，请联系开发者或查看项目文档。

---

**注意**: 这是一个教学项目，生产环境使用前请根据实际需求进行安全加固和性能优化。 