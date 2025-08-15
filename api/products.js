module.exports = (req, res) => {
  console.log('Products function called:', req.method, req.url);
  
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // 模拟产品数据
  let products = [
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
  
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    
    // 获取产品分类
    if (req.url === '/api/products/categories') {
      const categories = [...new Set(products.map(p => p.category))];
      return res.status(200).json({
        success: true,
        data: categories
      });
    }
    
    // 获取单个产品
    if (req.url.match(/\/api\/products\/\d+$/)) {
      const productId = parseInt(req.url.split('/').pop());
      const product = products.find(p => p.id === productId);
      
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
    
    req.on('end', () => {
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
        
        const newProduct = {
          id: products.length + 1,
          name,
          price: parseFloat(price),
          category,
          description: description || '',
          stock: parseInt(stock) || 0,
          createdAt: new Date().toISOString()
        };
        
        products.push(newProduct);
        
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
    
    req.on('end', () => {
      try {
        const productId = parseInt(req.url.split('/').pop());
        const { name, price, category, description, stock } = JSON.parse(body);
        
        const productIndex = products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
          return res.status(404).json({
            success: false,
            error: '产品不存在'
          });
        }
        
        products[productIndex] = {
          ...products[productIndex],
          name: name || products[productIndex].name,
          price: price !== undefined ? parseFloat(price) : products[productIndex].price,
          category: category || products[productIndex].category,
          description: description !== undefined ? description : products[productIndex].description,
          stock: stock !== undefined ? parseInt(stock) : products[productIndex].stock,
          updatedAt: new Date().toISOString()
        };
        
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
          success: true,
          message: '产品信息更新成功',
          data: products[productIndex]
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
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        error: '产品不存在'
      });
    }
    
    const deletedProduct = products.splice(productIndex, 1)[0];
    
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      success: true,
      message: '产品删除成功',
      data: deletedProduct
    });
  }
}; 