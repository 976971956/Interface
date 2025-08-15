const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// 安全中间件 - 允许内联脚本和API连接（禁用升级不安全请求）
app.use(helmet({
	contentSecurityPolicy: {
		useDefaults: true,
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'", "'unsafe-inline'"],
			styleSrc: ["'self'", "'unsafe-inline'"],
			imgSrc: ["'self'", "data:", "https:"],
			connectSrc: ["'self'", "http://localhost:3000", "http://localhost:*"],
			fontSrc: ["'self'", "https:", "data:"],
			objectSrc: ["'none'"],
			mediaSrc: ["'self'"],
			frameSrc: ["'none'"],
			upgradeInsecureRequests: null
		},
	},
}));

// CORS配置 - 允许你的域名访问（本地、Vercel、正式域名）
const allowedOrigins = [
	/http(s?):\/\/.*\.vercel\.app$/,
	'https://jianghuge.com',
	'http://jianghuge.com',
	'http://localhost:3000'
];
app.use(cors({
	origin: allowedOrigins,
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 请求体解析
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 限流配置
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	message: '请求过于频繁，请稍后再试'
});
app.use('/api/', limiter);

// 路由
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// 404处理
app.use('*', (req, res) => {
	res.status(404).json({ error: '接口不存在', path: req.originalUrl });
});

// 错误处理中间件
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({
		error: '服务器内部错误',
		message: process.env.NODE_ENV === 'development' ? err.message : '请联系管理员'
	});
});

module.exports = app; 