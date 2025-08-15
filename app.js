const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// 简化的 CORS 配置
app.use(cors());

// 请求体解析
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 添加请求日志中间件
app.use((req, res, next) => {
	console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
	next();
});

// 简单的测试路由
app.get('/api/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 路由
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// 404处理
app.use('*', (req, res) => {
	console.log(`404 - ${req.method} ${req.url}`);
	res.status(404).json({ error: '接口不存在', path: req.originalUrl });
});

// 错误处理中间件
app.use((err, req, res, next) => {
	console.error('Error:', err.message);
	res.status(500).json({
		error: '服务器内部错误',
		message: err.message
	});
});

module.exports = app; 