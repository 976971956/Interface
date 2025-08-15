import { Redis } from '@upstash/redis';

// 检查环境变量
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

console.log('Users API - Environment check:', {
  hasRedisUrl: !!redisUrl,
  hasRedisToken: !!redisToken,
  nodeEnv: process.env.NODE_ENV
});

// 创建Redis客户端
let redis;
try {
  redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });
  console.log('Users API - Redis client created successfully');
} catch (error) {
  console.error('Users API - Failed to create Redis client:', error);
}

export default async function handler(req, res) {
  console.log('Users function called:', req.method, req.url);
  
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // 检查环境变量
  if (!redisUrl || !redisToken) {
    console.error('Users API - Missing Redis environment variables');
    return res.status(500).json({
      success: false,
      error: 'Redis环境变量未配置',
      details: {
        hasRedisUrl: !!redisUrl,
        hasRedisToken: !!redisToken
      }
    });
  }
  
  // 检查Redis客户端
  if (!redis) {
    console.error('Users API - Redis client not initialized');
    return res.status(500).json({
      success: false,
      error: 'Redis客户端初始化失败'
    });
  }
  
  try {
    if (req.method === 'GET') {
      res.setHeader('Content-Type', 'application/json');
      
      // 获取单个用户
      if (req.url.match(/\/api\/users\/\d+$/)) {
        const userId = parseInt(req.url.split('/').pop());
        const user = await redis.get(`user:${userId}`);
        
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
      
      // 获取所有用户ID
      const userIds = await redis.smembers('users:list') || [];
      const users = [];
      
      // 获取用户详情
      for (const id of userIds) {
        const user = await redis.get(`user:${id}`);
        if (user) {
          users.push(user);
        }
      }
      
      // 按ID排序
      users.sort((a, b) => a.id - b.id);
      
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
      
      req.on('end', async () => {
        try {
          const { name, email, age } = JSON.parse(body);
          
          if (!name || !email) {
            return res.status(400).json({
              success: false,
              error: '姓名和邮箱是必填字段'
            });
          }
          
          // 检查邮箱是否已存在
          const existingUsers = await redis.smembers('users:list') || [];
          for (const id of existingUsers) {
            const user = await redis.get(`user:${id}`);
            if (user && user.email === email) {
              return res.status(400).json({
                success: false,
                error: '该邮箱已被注册'
              });
            }
          }
          
          // 生成新用户ID
          const newId = existingUsers.length > 0 ? Math.max(...existingUsers.map(id => parseInt(id))) + 1 : 1;
          
          const newUser = {
            id: newId,
            name,
            email,
            age: age || null,
            createdAt: new Date().toISOString()
          };
          
          // 保存用户数据
          await redis.set(`user:${newId}`, newUser);
          await redis.sadd('users:list', newId);
          
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
      
      req.on('end', async () => {
        try {
          const userId = parseInt(req.url.split('/').pop());
          const { name, email, age } = JSON.parse(body);
          
          const existingUser = await redis.get(`user:${userId}`);
          
          if (!existingUser) {
            return res.status(404).json({
              success: false,
              error: '用户不存在'
            });
          }
          
          const updatedUser = {
            ...existingUser,
            name: name || existingUser.name,
            email: email || existingUser.email,
            age: age !== undefined ? age : existingUser.age,
            updatedAt: new Date().toISOString()
          };
          
          // 更新用户数据
          await redis.set(`user:${userId}`, updatedUser);
          
          res.setHeader('Content-Type', 'application/json');
          res.status(200).json({
            success: true,
            message: '用户信息更新成功',
            data: updatedUser
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
      
      const existingUser = await redis.get(`user:${userId}`);
      
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          error: '用户不存在'
        });
      }
      
      // 删除用户数据
      await redis.del(`user:${userId}`);
      await redis.srem('users:list', userId);
      
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({
        success: true,
        message: '用户删除成功',
        data: existingUser
      });
    }
    
  } catch (error) {
    console.error('Error in users API:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
} 