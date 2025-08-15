module.exports = (req, res) => {
  console.log('Users function called:', req.method, req.url);
  
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      success: true,
      data: {
        users: [
          { id: 1, name: '张三', email: 'zhangsan@example.com', age: 25 },
          { id: 2, name: '李四', email: 'lisi@example.com', age: 30 },
          { id: 3, name: '王五', email: 'wangwu@example.com', age: 28 }
        ],
        total: 3,
        currentPage: 1
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}; 