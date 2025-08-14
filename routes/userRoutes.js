const express = require('express');
const router = express.Router();

// 模拟用户数据
let users = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', age: 25 },
  { id: 2, name: '李四', email: 'lisi@example.com', age: 30 },
  { id: 3, name: '王五', email: 'wangwu@example.com', age: 28 }
];

// GET /api/users - 获取所有用户
router.get('/', (req, res) => {
  try {
    // 支持分页
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const results = {};
    
    if (endIndex < users.length) {
      results.next = {
        page: page + 1,
        limit: limit
      };
    }
    
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      };
    }
    
    results.users = users.slice(startIndex, endIndex);
    results.total = users.length;
    results.currentPage = page;
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取用户列表失败'
    });
  }
});

// GET /api/users/:id - 根据ID获取用户
router.get('/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取用户信息失败'
    });
  }
});

// POST /api/users - 创建新用户
router.post('/', (req, res) => {
  try {
    const { name, email, age } = req.body;
    
    // 验证必填字段
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
    
    // 创建新用户
    const newUser = {
      id: users.length + 1,
      name,
      email,
      age: age || null,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    res.status(201).json({
      success: true,
      message: '用户创建成功',
      data: newUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '创建用户失败'
    });
  }
});

// PUT /api/users/:id - 更新用户信息
router.put('/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { name, email, age } = req.body;
    
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }
    
    // 更新用户信息
    users[userIndex] = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      email: email || users[userIndex].email,
      age: age !== undefined ? age : users[userIndex].age,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: '用户信息更新成功',
      data: users[userIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '更新用户信息失败'
    });
  }
});

// DELETE /api/users/:id - 删除用户
router.delete('/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }
    
    const deletedUser = users.splice(userIndex, 1)[0];
    
    res.json({
      success: true,
      message: '用户删除成功',
      data: deletedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '删除用户失败'
    });
  }
});

module.exports = router; 