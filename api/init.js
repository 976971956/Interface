import { kv } from '@vercel/kv';

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
  
  if (req.method === 'GET') {
    try {
      // 检查当前数据状态
      const userIds = await kv.smembers('users:list') || [];
      const productIds = await kv.smembers('products:list') || [];
      
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({
        success: true,
        message: '数据状态检查',
        data: {
          users: userIds.length,
          products: productIds.length,
          hasData: userIds.length > 0 || productIds.length > 0
        }
      });
    } catch (error) {
      console.error('Error checking data status:', error);
      res.status(500).json({
        success: false,
        error: '检查数据状态失败'
      });
    }
  }
  
  if (req.method === 'POST') {
    try {
      // 初始化默认用户数据
      const defaultUsers = [
        { id: 1, name: '张三', email: 'zhangsan@example.com', age: 25 },
        { id: 2, name: '李四', email: 'lisi@example.com', age: 30 },
        { id: 3, name: '王五', email: 'wangwu@example.com', age: 28 }
      ];
      
      // 保存用户数据
      for (const user of defaultUsers) {
        await kv.set(`user:${user.id}`, user);
        await kv.sadd('users:list', user.id);
      }
      
      // 初始化默认产品数据
      const defaultProducts = [
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
      
      // 保存产品数据
      for (const product of defaultProducts) {
        await kv.set(`product:${product.id}`, product);
        await kv.sadd('products:list', product.id);
      }
      
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({
        success: true,
        message: '数据初始化成功',
        data: {
          users: defaultUsers.length,
          products: defaultProducts.length
        }
      });
      
    } catch (error) {
      console.error('Error in init API:', error);
      res.status(500).json({
        success: false,
        error: '初始化失败'
      });
    }
  }
} 