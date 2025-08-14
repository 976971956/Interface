const express = require('express');
const router = express.Router();

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

// GET /api/products - 获取所有产品
router.get('/', (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      minPrice, 
      maxPrice,
      search 
    } = req.query;
    
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
      results.next = {
        page: pageNum + 1,
        limit: limitNum
      };
    }
    
    if (startIndex > 0) {
      results.previous = {
        page: pageNum - 1,
        limit: limitNum
      };
    }
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取产品列表失败'
    });
  }
});

// GET /api/products/:id - 根据ID获取产品
router.get('/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: '产品不存在'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取产品信息失败'
    });
  }
});

// POST /api/products - 创建新产品
router.post('/', (req, res) => {
  try {
    const { name, price, category, description, stock } = req.body;
    
    // 验证必填字段
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        error: '产品名称、价格和分类是必填字段'
      });
    }
    
    // 验证价格
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({
        success: false,
        error: '价格必须是正数'
      });
    }
    
    // 创建新产品
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
    
    res.status(201).json({
      success: true,
      message: '产品创建成功',
      data: newProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '创建产品失败'
    });
  }
});

// PUT /api/products/:id - 更新产品信息
router.put('/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { name, price, category, description, stock } = req.body;
    
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        error: '产品不存在'
      });
    }
    
    // 更新产品信息
    products[productIndex] = {
      ...products[productIndex],
      name: name || products[productIndex].name,
      price: price !== undefined ? parseFloat(price) : products[productIndex].price,
      category: category || products[productIndex].category,
      description: description !== undefined ? description : products[productIndex].description,
      stock: stock !== undefined ? parseInt(stock) : products[productIndex].stock,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: '产品信息更新成功',
      data: products[productIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '更新产品信息失败'
    });
  }
});

// DELETE /api/products/:id - 删除产品
router.delete('/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        error: '产品不存在'
      });
    }
    
    const deletedProduct = products.splice(productIndex, 1)[0];
    
    res.json({
      success: true,
      message: '产品删除成功',
      data: deletedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '删除产品失败'
    });
  }
});

// GET /api/products/categories - 获取所有产品分类
router.get('/categories', (req, res) => {
  try {
    const categories = [...new Set(products.map(p => p.category))];
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取产品分类失败'
    });
  }
});

module.exports = router; 