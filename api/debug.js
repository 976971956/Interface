const express = require('express');

console.log('Debug function loading...');

const app = express();

// 添加日志中间件
app.use((req, res, next) => {
  console.log('Debug app - Request:', req.method, req.url);
  next();
});

// 测试路由
app.get('/api/debug', (req, res) => {
  console.log('Debug route hit');
  res.json({ 
    success: true, 
    message: 'Debug route works!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/users', (req, res) => {
  console.log('Users route hit');
  res.json({
    success: true,
    data: {
      users: [
        { id: 1, name: '测试用户', email: 'test@example.com' }
      ]
    }
  });
});

// 404 处理
app.use('*', (req, res) => {
  console.log('Debug app - 404:', req.method, req.url);
  res.status(404).json({ error: 'Not found in debug app' });
});

console.log('Debug app created successfully');

module.exports = app; 