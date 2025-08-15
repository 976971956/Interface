# 故障排除指南

## 🔍 常见问题及解决方案

### 1. "检查数据状态失败" 错误

**问题描述**: 访问 `/api/init` 时返回错误

**可能原因**:
- 环境变量未正确配置
- Redis连接失败
- Vercel部署配置问题

**解决步骤**:

1. **检查环境变量**
   ```bash
   # 访问调试端点
   https://your-project.vercel.app/api/debug
   ```

2. **确认环境变量配置**
   在Vercel项目设置中确保以下变量已配置：
   ```
   UPSTASH_REDIS_REST_URL=https://workable-toad-43948.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AausAAIncDE1ZjA1NzFmZmNiMTQ0ZmExOGJmY2Y4M2I4MzIzN2NkN3AxNDM5NDg
   ```

3. **重新部署**
   - 在Vercel控制台点击 "Redeploy"
   - 等待部署完成

### 2. Redis连接失败

**问题描述**: 数据库连接测试失败

**解决步骤**:

1. **检查Upstash Redis状态**
   - 登录Vercel控制台
   - 进入 "Storage" 部分
   - 确认Redis数据库状态正常

2. **验证连接信息**
   - 确认URL和Token正确
   - 检查网络连接

3. **测试连接**
   ```bash
   curl https://your-project.vercel.app/api/test
   ```

### 3. API返回500错误

**问题描述**: 所有API都返回500内部服务器错误

**解决步骤**:

1. **查看函数日志**
   - 在Vercel控制台查看 "Functions" 日志
   - 查找具体错误信息

2. **检查依赖包**
   - 确认 `@upstash/redis` 已安装
   - 检查 `package.json` 配置

3. **验证代码**
   - 确认API文件语法正确
   - 检查导入语句

### 4. 环境变量未生效

**问题描述**: 环境变量显示"未配置"

**解决步骤**:

1. **重新配置环境变量**
   - 删除现有环境变量
   - 重新添加所有变量
   - 确保变量名和值正确

2. **重新部署**
   - 环境变量修改后需要重新部署
   - 等待部署完成

3. **验证配置**
   ```bash
   curl https://your-project.vercel.app/api/debug
   ```

## 🛠️ 调试工具

### 1. 调试API端点

访问以下端点获取调试信息：

- **系统调试**: `/api/debug`
- **数据库测试**: `/api/test`
- **数据状态**: `/api/init` (GET方法)

### 2. 前端调试

在浏览器中：
1. 打开开发者工具 (F12)
2. 查看控制台日志
3. 检查网络请求

### 3. Vercel日志

在Vercel控制台：
1. 进入项目设置
2. 查看 "Functions" 标签页
3. 检查函数执行日志

## 📋 检查清单

### 部署前检查
- [ ] 代码已推送到GitHub
- [ ] 环境变量已配置
- [ ] 依赖包已安装
- [ ] API文件语法正确

### 部署后检查
- [ ] 访问 `/api/debug` 查看环境状态
- [ ] 访问 `/api/test` 测试数据库连接
- [ ] 访问 `/api/init` 检查数据状态
- [ ] 测试前端界面功能

### 环境变量清单
确保以下变量已配置：
```
UPSTASH_REDIS_REST_URL=https://workable-toad-43948.upstash.io
UPSTASH_REDIS_REST_TOKEN=AausAAIncDE1ZjA1NzFmZmNiMTQ0ZmExOGJmY2Y4M2I4MzIzN2NkN3AxNDM5NDg
NODE_ENV=production
```

## 🔧 手动修复步骤

### 1. 重新创建项目
如果问题无法解决，可以重新创建：

1. **备份代码**
2. **删除Vercel项目**
3. **重新导入GitHub仓库**
4. **重新配置环境变量**
5. **重新部署**

### 2. 本地测试
在本地环境中测试：

```bash
# 克隆项目
git clone <repository>
cd Interface

# 安装依赖
npm install

# 配置环境变量
cp env.example .env
# 编辑 .env 文件，添加Redis配置

# 启动服务器
npm run dev

# 测试API
curl http://localhost:3000/api/debug
```

## 📞 获取帮助

如果问题仍然存在：

1. **查看Vercel文档**: https://vercel.com/docs
2. **检查Upstash文档**: https://docs.upstash.com/
3. **查看项目日志**: 在Vercel控制台查看详细错误信息
4. **提交Issue**: 在GitHub仓库提交问题报告

## 🎯 快速诊断命令

```bash
# 1. 检查系统状态
curl https://your-project.vercel.app/api/debug

# 2. 测试数据库连接
curl https://your-project.vercel.app/api/test

# 3. 检查数据状态
curl https://your-project.vercel.app/api/init

# 4. 健康检查
curl https://your-project.vercel.app/api/health
```

---

**注意**: 大多数问题都与环境变量配置有关。确保在Vercel中正确配置了所有必需的环境变量。 