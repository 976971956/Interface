# 部署指南

## 🚀 Vercel 部署

### 1. 准备工作

1. **GitHub仓库**: 确保项目已推送到GitHub
2. **Vercel账户**: 注册 [Vercel](https://vercel.com) 账户
3. **Upstash Redis**: 已在Vercel中创建Redis数据库

### 2. 部署步骤

#### 步骤1: 连接GitHub仓库
1. 登录Vercel控制台
2. 点击 "New Project"
3. 选择你的GitHub仓库
4. 点击 "Import"

#### 步骤2: 配置项目
1. **Framework Preset**: 选择 "Node.js"
2. **Root Directory**: 保持默认 (./)
3. **Build Command**: 保持默认 (npm run build 或留空)
4. **Output Directory**: 保持默认
5. **Install Command**: `npm install`

#### 步骤3: 配置环境变量
在 "Environment Variables" 部分添加以下变量：

```
KV_URL=rediss://default:AausAAIncDE1ZjA1NzFmZmNiMTQ0ZmExOGJmY2Y4M2I4MzIzN2NkN3AxNDM5NDg@workable-toad-43948.upstash.io:6379
KV_REST_API_URL=https://workable-toad-43948.upstash.io
KV_REST_API_TOKEN=AausAAIncDE1ZjA1NzFmZmNiMTQ0ZmExOGJmY2Y4M2I4MzIzN2NkN3AxNDM5NDg
KV_REST_API_READ_ONLY_TOKEN=AqusAAIgcDEpiASxiG3EbbLlS5ElUzdV6WLIWdY11UUEbUpjMZ1N_A
REDIS_URL=rediss://default:AausAAIncDE1ZjA1NzFmZmNiMTQ0ZmExOGJmY2Y4M2I4MzIzN2NkN3AxNDM5NDg@workable-toad-43948.upstash.io:6379
UPSTASH_REDIS_REST_URL=https://workable-toad-43948.upstash.io
UPSTASH_REDIS_REST_TOKEN=AausAAIncDE1ZjA1NzFmZmNiMTQ0ZmExOGJmY2Y4M2I4MzIzN2NkN3AxNDM5NDg
NODE_ENV=production
```

#### 步骤4: 部署
1. 点击 "Deploy"
2. 等待部署完成
3. 获得部署URL (例如: https://your-project.vercel.app)

### 3. 验证部署

#### 测试API端点
访问以下URL测试API是否正常工作：

1. **健康检查**: `https://your-project.vercel.app/api/health`
2. **数据库测试**: `https://your-project.vercel.app/api/test`
3. **前端界面**: `https://your-project.vercel.app/`

#### 初始化数据库
1. 访问前端界面
2. 点击 "测试数据库连接" 按钮
3. 如果连接正常，点击 "初始化示例数据" 按钮
4. 开始测试用户和产品管理功能

### 4. 自定义域名 (可选)

#### 配置自定义域名
1. 在Vercel项目设置中找到 "Domains"
2. 添加你的域名 (例如: api.jianghuge.com)
3. 按照提示配置DNS记录

#### DNS配置
添加以下DNS记录：
- **类型**: CNAME
- **名称**: api (或其他子域名)
- **值**: cname.vercel-dns.com

### 5. 监控和维护

#### 查看日志
- 在Vercel控制台的 "Functions" 标签页查看函数日志
- 在 "Analytics" 标签页查看访问统计

#### 环境变量管理
- 在项目设置中可以随时修改环境变量
- 修改后需要重新部署

#### 数据库管理
- 在Vercel控制台的 "Storage" 部分管理Redis数据库
- 可以查看数据库使用情况和性能指标

### 6. 故障排除

#### 常见问题

1. **部署失败**
   - 检查环境变量是否正确配置
   - 查看构建日志中的错误信息

2. **API返回500错误**
   - 检查Redis连接配置
   - 查看函数日志

3. **数据库连接失败**
   - 验证环境变量中的Redis URL和Token
   - 确认Upstash Redis服务是否正常

#### 调试步骤
1. 访问 `/api/test` 端点检查数据库连接
2. 查看Vercel函数日志
3. 检查环境变量配置
4. 确认依赖包是否正确安装

### 7. 性能优化

#### 建议配置
- 启用Vercel的缓存功能
- 配置CDN加速
- 监控函数执行时间

#### 成本控制
- 免费计划每月有使用限制
- 监控API调用次数
- 优化数据库查询

---

## 📞 支持

如果遇到部署问题，请：
1. 查看Vercel官方文档
2. 检查项目README.md
3. 查看函数日志和错误信息 