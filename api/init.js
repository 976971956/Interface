import { Redis } from '@upstash/redis';

// 检查环境变量
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

console.log('Environment check:', {
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
  console.log('Redis client created successfully');
} catch (error) {
  console.error('Failed to create Redis client:', error);
}

export default async function handler(req, res) {
  console.log('Init function called:', req.method, req.url);
  
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // 检查环境变量
  if (!redisUrl || !redisToken) {
    console.error('Missing Redis environment variables');
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
    console.error('Redis client not initialized');
    return res.status(500).json({
      success: false,
      error: 'Redis客户端初始化失败'
    });
  }
  
  if (req.method === 'GET') {
    try {
      console.log('GET request - checking data status');
      
      // 检查当前数据状态
      const userIds = await redis.smembers('users:list') || [];
      const productIds = await redis.smembers('products:list') || [];
      
      console.log('Data status check completed:', {
        users: userIds.length,
        products: productIds.length
      });
      
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({
        success: true,
        message: '数据状态检查',
        data: {
          users: userIds.length,
          products: productIds.length,
          hasData: userIds.length > 0 || productIds.length > 0,
          environment: {
            hasRedisUrl: !!redisUrl,
            hasRedisToken: !!redisToken,
            nodeEnv: process.env.NODE_ENV
          }
        }
      });
    } catch (error) {
      console.error('Error checking data status:', error);
      res.status(500).json({
        success: false,
        error: '检查数据状态失败',
        details: error.message
      });
    }
  }
  
  if (req.method === 'POST') {
    try {
      console.log('POST request - initializing database');
      
      res.setHeader('Content-Type', 'application/json');
      
      // 示例用户数据
      const sampleUsers = [
        { id: 1, name: '张三', email: 'zhangsan@example.com', age: 25, createdAt: '2024-01-01T00:00:00.000Z' },
        { id: 2, name: '李四', email: 'lisi@example.com', age: 30, createdAt: '2024-01-02T00:00:00.000Z' },
        { id: 3, name: '王五', email: 'wangwu@example.com', age: 28, createdAt: '2024-01-03T00:00:00.000Z' }
      ];
      
      // 示例产品数据
      const sampleProducts = [
        { 
          id: 1, 
          name: 'iPhone 15', 
          price: 5999, 
          category: '手机',
          description: '最新款iPhone',
          stock: 100,
          createdAt: '2024-01-01T00:00:00.000Z'
        },
        { 
          id: 2, 
          name: 'MacBook Pro', 
          price: 12999, 
          category: '电脑',
          description: '专业级笔记本电脑',
          stock: 50,
          createdAt: '2024-01-02T00:00:00.000Z'
        },
        { 
          id: 3, 
          name: 'AirPods Pro', 
          price: 1999, 
          category: '耳机',
          description: '无线降噪耳机',
          stock: 200,
          createdAt: '2024-01-03T00:00:00.000Z'
        }
      ];
      
      console.log('Clearing existing data...');
      // 清空现有数据
      await redis.del('users:list');
      await redis.del('products:list');
      
      console.log('Adding user data...');
      // 添加用户数据
      for (const user of sampleUsers) {
        await redis.set(`user:${user.id}`, user);
        await redis.sadd('users:list', user.id);
      }
      
      console.log('Adding product data...');
      // 添加产品数据
      for (const product of sampleProducts) {
        await redis.set(`product:${product.id}`, product);
        await redis.sadd('products:list', product.id);
      }
      
      console.log('Database initialization completed successfully');
      
      res.status(200).json({
        success: true,
        message: '数据库初始化成功',
        data: {
          users: sampleUsers.length,
          products: sampleProducts.length
        }
      });
      
    } catch (error) {
      console.error('Error in init API:', error);
      res.status(500).json({
        success: false,
        error: '数据库初始化失败',
        details: error.message
      });
    }
  } else if (req.method !== 'GET') {
    res.status(405).json({
      success: false,
      error: '只支持GET和POST方法'
    });
  }
} 