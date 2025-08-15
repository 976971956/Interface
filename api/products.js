import { Redis } from '@upstash/redis';

// 检查环境变量
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

console.log('Products API - Environment check:', {
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
  console.log('Products API - Redis client created successfully');
} catch (error) {
  console.error('Products API - Failed to create Redis client:', error);
}

export default async function handler(req, res) {
  console.log('Products function called:', req.method, req.url);
  
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
    console.error('Products API - Missing Redis environment variables');
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
    console.error('Products API - Redis client not initialized');
    return res.status(500).json({
      success: false,
      error: 'Redis客户端初始化失败'
    });
  }
  
  try {
    if (req.method === 'GET') {
      res.setHeader('Content-Type', 'application/json');
      
      // 获取产品分类
      if (req.url === '/api/products/categories') {
        const productIds = await redis.smembers('products:list') || [];
        const products = [];
        
        for (const id of productIds) {
          const product = await redis.get(`product:${id}`);
          if (product) {
            products.push(product);
          }
        }
        
        const categories = [...new Set(products.map(p => p.category))];
        return res.status(200).json({
          success: true,
          data: categories
        });
      }
      
      // 获取单个产品
      if (req.url.match(/\/api\/products\/\d+$/)) {
        const productId = parseInt(req.url.split('/').pop());
        const product = await redis.get(`product:${productId}`);
        
        if (!product) {
          return res.status(404).json({
            success: false,
            error: '产品不存在'
          });
        }
        
        return res.status(200).json({
          success: true,
          data: product
        });
      }
      
      // 获取产品列表（支持筛选）
      const url = new URL(req.url, 'http://localhost');
      const page = parseInt(url.searchParams.get('page')) || 1;
      const limit = parseInt(url.searchParams.get('limit')) || 10;
      const category = url.searchParams.get('category');
      const minPrice = url.searchParams.get('minPrice');
      const maxPrice = url.searchParams.get('maxPrice');
      const search = url.searchParams.get('search');
      
      // 获取所有产品ID
      const productIds = await redis.smembers('products:list') || [];
      const products = [];
      
      // 获取产品详情
      for (const id of productIds) {
        const product = await redis.get(`product:${id}`);
        if (product) {
          products.push(product);
        }
      }
      
      // 按ID排序
      products.sort((a, b) => a.id - b.id);
      
      let filteredProducts = [...products];
      
      // 按分类筛选
      if (category) {
        filteredProducts = filteredProducts.filter(p => 
          p.category.toLowerCase().includes(category.toLowerCase())
        );
      }
      
      // 按价格范围筛选
      if (minPrice) {
        filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
      }
      if (maxPrice) {
        filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
      }
      
      // 按名称搜索
      if (search) {
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // 分页
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = pageNum * limitNum;
      
      const results = {
        products: filteredProducts.slice(startIndex, endIndex),
        total: filteredProducts.length,
        currentPage: pageNum,
        totalPages: Math.ceil(filteredProducts.length / limitNum)
      };
      
      if (endIndex < filteredProducts.length) {
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
      // 创建产品
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const { name, price, category, description, stock } = JSON.parse(body);
          
          if (!name || !price || !category) {
            return res.status(400).json({
              success: false,
              error: '产品名称、价格和分类是必填字段'
            });
          }
          
          if (isNaN(price) || price <= 0) {
            return res.status(400).json({
              success: false,
              error: '价格必须是正数'
            });
          }
          
          // 生成新产品ID
          const existingProductIds = await redis.smembers('products:list') || [];
          const newId = existingProductIds.length > 0 ? Math.max(...existingProductIds.map(id => parseInt(id))) + 1 : 1;
          
          const newProduct = {
            id: newId,
            name,
            price: parseFloat(price),
            category,
            description: description || '',
            stock: parseInt(stock) || 0,
            createdAt: new Date().toISOString()
          };
          
          // 保存产品数据
          await redis.set(`product:${newId}`, newProduct);
          await redis.sadd('products:list', newId);
          
          res.setHeader('Content-Type', 'application/json');
          res.status(201).json({
            success: true,
            message: '产品创建成功',
            data: newProduct
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
      // 更新产品
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const productId = parseInt(req.url.split('/').pop());
          const { name, price, category, description, stock } = JSON.parse(body);
          
          const existingProduct = await redis.get(`product:${productId}`);
          
          if (!existingProduct) {
            return res.status(404).json({
              success: false,
              error: '产品不存在'
            });
          }
          
          const updatedProduct = {
            ...existingProduct,
            name: name || existingProduct.name,
            price: price !== undefined ? parseFloat(price) : existingProduct.price,
            category: category || existingProduct.category,
            description: description !== undefined ? description : existingProduct.description,
            stock: stock !== undefined ? parseInt(stock) : existingProduct.stock,
            updatedAt: new Date().toISOString()
          };
          
          // 更新产品数据
          await redis.set(`product:${productId}`, updatedProduct);
          
          res.setHeader('Content-Type', 'application/json');
          res.status(200).json({
            success: true,
            message: '产品信息更新成功',
            data: updatedProduct
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
      // 删除产品
      const productId = parseInt(req.url.split('/').pop());
      
      const existingProduct = await redis.get(`product:${productId}`);
      
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          error: '产品不存在'
        });
      }
      
      // 删除产品数据
      await redis.del(`product:${productId}`);
      await redis.srem('products:list', productId);
      
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({
        success: true,
        message: '产品删除成功',
        data: existingProduct
      });
    }
    
  } catch (error) {
    console.error('Error in products API:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
} 