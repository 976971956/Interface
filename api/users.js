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
  
  // 模拟用户数据
  let users = [
    { id: 1, name: '张三', email: 'zhangsan@example.com', age: 25 },
    { id: 2, name: '李四', email: 'lisi@example.com', age: 30 },
    { id: 3, name: '王五', email: 'wangwu@example.com', age: 28 }
  ];
  
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    
    // 获取单个用户
    if (req.url.match(/\/api\/users\/\d+$/)) {
      const userId = parseInt(req.url.split('/').pop());
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: '用户不存在'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: user
      });
    }
    
    // 获取用户列表（支持分页）
    const url = new URL(req.url, 'http://localhost');
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 10;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    
    const results = {
      users: users.slice(startIndex, endIndex),
      total: users.length,
      currentPage: pageNum,
      totalPages: Math.ceil(users.length / limitNum)
    };
    
    if (endIndex < users.length) {
      results.next = { page: pageNum + 1, limit: limitNum };
    }
    if (startIndex > 0) {
      results.previous = { page: pageNum - 1, limit: limitNum };
    }
    
    res.status(200).json({
      success: true,
      data: results
    });
  }
  
  if (req.method === 'POST') {
    // 创建用户
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { name, email, age } = JSON.parse(body);
        
        if (!name || !email) {
          return res.status(400).json({
            success: false,
            error: '姓名和邮箱是必填字段'
          });
        }
        
        // 检查邮箱是否已存在
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
          return res.status(400).json({
            success: false,
            error: '该邮箱已被注册'
          });
        }
        
        const newUser = {
          id: users.length + 1,
          name,
          email,
          age: age || null,
          createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        
        res.setHeader('Content-Type', 'application/json');
        res.status(201).json({
          success: true,
          message: '用户创建成功',
          data: newUser
        });
      } catch (error) {
        res.status(400).json({
          success: false,
          error: '请求体格式错误'
        });
      }
    });
    return;
  }
  
  if (req.method === 'PUT') {
    // 更新用户
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const userId = parseInt(req.url.split('/').pop());
        const { name, email, age } = JSON.parse(body);
        
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
          return res.status(404).json({
            success: false,
            error: '用户不存在'
          });
        }
        
        users[userIndex] = {
          ...users[userIndex],
          name: name || users[userIndex].name,
          email: email || users[userIndex].email,
          age: age !== undefined ? age : users[userIndex].age,
          updatedAt: new Date().toISOString()
        };
        
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
          success: true,
          message: '用户信息更新成功',
          data: users[userIndex]
        });
      } catch (error) {
        res.status(400).json({
          success: false,
          error: '请求体格式错误'
        });
      }
    });
    return;
  }
  
  if (req.method === 'DELETE') {
    // 删除用户
    const userId = parseInt(req.url.split('/').pop());
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }
    
    const deletedUser = users.splice(userIndex, 1)[0];
    
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      success: true,
      message: '用户删除成功',
      data: deletedUser
    });
  }
}; 