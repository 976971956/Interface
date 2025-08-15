export default async function handler(req, res) {
  console.log('Debug function called:', req.method, req.url);
  
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
      
      // 收集环境信息
      const envInfo = {
        NODE_ENV: process.env.NODE_ENV,
        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? '已配置' : '未配置',
        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? '已配置' : '未配置',
        KV_URL: process.env.KV_URL ? '已配置' : '未配置',
        KV_REST_API_URL: process.env.KV_REST_API_URL ? '已配置' : '未配置',
        KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? '已配置' : '未配置',
        REDIS_URL: process.env.REDIS_URL ? '已配置' : '未配置'
      };
      
      // 测试Redis连接
      let redisTest = { status: '未测试' };
      
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        try {
          const { Redis } = await import('@upstash/redis');
          const redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
          });
          
          // 测试连接
          const testKey = 'debug:test';
          const testValue = { timestamp: new Date().toISOString() };
          
          await redis.set(testKey, testValue);
          const retrieved = await redis.get(testKey);
          await redis.del(testKey);
          
          redisTest = {
            status: '成功',
            writeRead: retrieved ? '正常' : '失败',
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          redisTest = {
            status: '失败',
            error: error.message,
            timestamp: new Date().toISOString()
          };
        }
      } else {
        redisTest = {
          status: '跳过',
          reason: '环境变量未配置',
          timestamp: new Date().toISOString()
        };
      }
      
      res.status(200).json({
        success: true,
        message: '调试信息',
        data: {
          environment: envInfo,
          redis: redisTest,
          timestamp: new Date().toISOString(),
          request: {
            method: req.method,
            url: req.url,
            headers: Object.keys(req.headers)
          }
        }
      });
      
    } catch (error) {
      console.error('Error in debug API:', error);
      res.status(500).json({
        success: false,
        error: '调试API执行失败',
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