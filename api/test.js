import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  console.log('Test function called:', req.method, req.url);
  
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method === 'GET') {
    try {
      res.setHeader('Content-Type', 'application/json');
      
      // 测试Redis连接
      const testKey = 'test:connection';
      const testValue = { message: 'Hello Redis!', timestamp: new Date().toISOString() };
      
      // 写入测试数据
      await redis.set(testKey, testValue);
      
      // 读取测试数据
      const retrievedValue = await redis.get(testKey);
      
      // 删除测试数据
      await redis.del(testKey);
      
      // 获取数据库统计信息
      const userIds = await redis.smembers('users:list') || [];
      const productIds = await redis.smembers('products:list') || [];
      
      res.status(200).json({
        success: true,
        message: 'Redis连接测试成功',
        data: {
          redisConnection: '✅ 正常',
          testWriteRead: retrievedValue ? '✅ 正常' : '❌ 失败',
          databaseStats: {
            users: userIds.length,
            products: productIds.length
          },
          environment: {
            hasRedisUrl: !!process.env.UPSTASH_REDIS_REST_URL,
            hasRedisToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
            nodeEnv: process.env.NODE_ENV || 'development'
          }
        }
      });
      
    } catch (error) {
      console.error('Error in test API:', error);
      res.status(500).json({
        success: false,
        error: 'Redis连接测试失败',
        details: error.message
      });
    }
  } else {
    res.status(405).json({
      success: false,
      error: '只支持GET方法'
    });
  }
} 