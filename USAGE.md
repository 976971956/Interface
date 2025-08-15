# 使用指南

## 🎯 快速开始

### 1. 本地开发

```bash
# 克隆项目
git clone <your-repository>
cd Interface

# 安装依赖
npm install

# 配置环境变量
cp env.example .env

# 启动开发服务器
npm run dev
```

### 2. 访问测试界面

打开浏览器访问: `http://localhost:3000/public/index.html`

## 📋 功能说明

### 数据库管理

#### 测试数据库连接
- 点击 "测试数据库连接" 按钮
- 检查Redis连接是否正常
- 查看当前数据库统计信息

#### 初始化示例数据
- 点击 "初始化示例数据" 按钮
- 将添加3个示例用户和3个示例产品
- **注意**: 这会清空现有数据

### 用户管理

#### 获取用户列表
- 点击 "获取所有用户" 按钮
- 支持分页参数: `page` 和 `limit`
- 返回用户列表和分页信息

#### 获取单个用户
- 点击 "根据ID获取用户" 按钮
- 输入用户ID (1, 2, 3)
- 返回指定用户的详细信息

#### 创建新用户
- 填写用户信息: 姓名、邮箱、年龄
- 点击 "创建用户" 按钮
- 系统会验证必填字段和邮箱唯一性

#### 更新用户信息
- 输入用户ID
- 填写要更新的字段
- 点击 "更新用户" 按钮

#### 删除用户
- 输入用户ID
- 点击 "删除用户" 按钮
- 确认删除操作

### 产品管理

#### 获取产品列表
- 点击 "获取所有产品" 按钮
- 支持分页和筛选功能

#### 筛选产品
- **按分类**: 选择产品分类 (手机、电脑、耳机)
- **按价格**: 设置最低和最高价格
- **按关键词**: 搜索产品名称和描述

#### 获取产品分类
- 点击 "获取产品分类" 按钮
- 返回所有可用的产品分类

#### 获取单个产品
- 点击 "根据ID获取产品" 按钮
- 输入产品ID (1, 2, 3)

#### 创建新产品
- 填写产品信息: 名称、价格、分类、描述、库存
- 点击 "创建产品" 按钮
- 系统验证必填字段和价格格式

#### 更新产品信息
- 输入产品ID
- 填写要更新的字段
- 点击 "更新产品" 按钮

#### 删除产品
- 输入产品ID
- 点击 "删除产品" 按钮
- 确认删除操作

## 🔧 API 接口

### 基础URL
- 本地开发: `http://localhost:3000/api`
- Vercel部署: `https://your-project.vercel.app/api`

### 用户接口

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/users` | 获取用户列表 |
| GET | `/users/:id` | 获取单个用户 |
| POST | `/users` | 创建新用户 |
| PUT | `/users/:id` | 更新用户 |
| DELETE | `/users/:id` | 删除用户 |

### 产品接口

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/products` | 获取产品列表 |
| GET | `/products/:id` | 获取单个产品 |
| GET | `/products/categories` | 获取产品分类 |
| POST | `/products` | 创建新产品 |
| PUT | `/products/:id` | 更新产品 |
| DELETE | `/products/:id` | 删除产品 |

### 系统接口

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/health` | 健康检查 |
| GET | `/test` | 数据库连接测试 |
| POST | `/init` | 初始化示例数据 |

## 📝 请求示例

### 创建用户
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "email": "zhangsan@example.com",
    "age": 25
  }'
```

### 获取产品列表
```bash
curl "http://localhost:3000/api/products?page=1&limit=10&category=手机"
```

### 筛选产品
```bash
curl "http://localhost:3000/api/products?minPrice=1000&maxPrice=5000&search=iPhone"
```

## 📊 响应格式

### 成功响应
```json
{
  "success": true,
  "data": {
    // 具体数据
  },
  "message": "操作成功"
}
```

### 错误响应
```json
{
  "success": false,
  "error": "错误信息"
}
```

### 分页响应
```json
{
  "success": true,
  "data": {
    "users": [...],
    "total": 10,
    "currentPage": 1,
    "totalPages": 2,
    "next": { "page": 2, "limit": 10 },
    "previous": null
  }
}
```

## 🛠️ 开发调试

### 查看日志
- 本地开发: 控制台输出
- Vercel部署: 在Vercel控制台查看函数日志

### 测试数据库
```bash
# 测试连接
curl http://localhost:3000/api/test

# 初始化数据
curl -X POST http://localhost:3000/api/init
```

### 环境变量
确保以下环境变量已正确配置：
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## 🚨 注意事项

1. **数据持久化**: 数据存储在Redis数据库中，重启服务器不会丢失
2. **邮箱唯一性**: 用户邮箱必须唯一，重复邮箱会返回错误
3. **价格验证**: 产品价格必须是正数
4. **ID生成**: 系统自动生成递增的ID
5. **分页限制**: 建议每页不超过100条记录

## 🔍 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查环境变量配置
   - 确认Redis服务是否正常
   - 使用 `/api/test` 端点测试连接

2. **API返回404**
   - 检查URL是否正确
   - 确认服务器是否启动
   - 查看路由配置

3. **创建数据失败**
   - 检查必填字段
   - 验证数据格式
   - 查看错误信息

### 调试步骤
1. 检查浏览器控制台错误
2. 查看服务器日志
3. 使用API测试工具验证
4. 确认环境变量配置

---

## 📞 支持

如有问题，请：
1. 查看控制台错误信息
2. 检查API响应状态
3. 验证环境变量配置
4. 参考项目文档 