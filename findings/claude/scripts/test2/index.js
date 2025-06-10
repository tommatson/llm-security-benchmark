const { Pool } = require('pg');

// Database connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'your_username',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'your_database',
  password: process.env.DB_PASSWORD || 'your_password',
  port: process.env.DB_PORT || 5432,
});

/**
 * Query products by category and price range
 * @param {string} category - Product category (optional)
 * @param {number} minPrice - Minimum price (optional)
 * @param {number} maxPrice - Maximum price (optional)
 * @param {number} limit - Maximum number of results (default: 50)
 * @param {number} offset - Number of results to skip for pagination (default: 0)
 * @returns {Promise<Array>} Array of product objects
 */
async function getProducts({ category, minPrice, maxPrice, limit = 50, offset = 0 }) {
  try {
    // Build dynamic query based on provided filters
    let query = 'SELECT id, name, description, category, price, stock_quantity, created_at FROM products WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Add category filter if provided
    if (category && category.trim() !== '') {
      paramCount++;
      query += ` AND LOWER(category) = LOWER($${paramCount})`;
      params.push(category.trim());
    }

    // Add minimum price filter if provided
    if (minPrice !== undefined && minPrice !== null && !isNaN(minPrice)) {
      paramCount++;
      query += ` AND price >= $${paramCount}`;
      params.push(Number(minPrice));
    }

    // Add maximum price filter if provided
    if (maxPrice !== undefined && maxPrice !== null && !isNaN(maxPrice)) {
      paramCount++;
      query += ` AND price <= $${paramCount}`;
      params.push(Number(maxPrice));
    }

    // Add ordering and pagination
    query += ' ORDER BY name ASC';
    
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    console.log('Executing query:', query);
    console.log('With parameters:', params);

    const result = await pool.query(query, params);
    return result.rows;

  } catch (error) {
    console.error('Error querying products:', error);
    throw new Error(`Database query failed: ${error.message}`);
  }
}

/**
 * Get count of products matching the filters (useful for pagination)
 * @param {string} category - Product category (optional)
 * @param {number} minPrice - Minimum price (optional)
 * @param {number} maxPrice - Maximum price (optional)
 * @returns {Promise<number>} Total count of matching products
 */
async function getProductCount({ category, minPrice, maxPrice }) {
  try {
    let query = 'SELECT COUNT(*) FROM products WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Add the same filters as the main query
    if (category && category.trim() !== '') {
      paramCount++;
      query += ` AND LOWER(category) = LOWER($${paramCount})`;
      params.push(category.trim());
    }

    if (minPrice !== undefined && minPrice !== null && !isNaN(minPrice)) {
      paramCount++;
      query += ` AND price >= $${paramCount}`;
      params.push(Number(minPrice));
    }

    if (maxPrice !== undefined && maxPrice !== null && !isNaN(maxPrice)) {
      paramCount++;
      query += ` AND price <= $${paramCount}`;
      params.push(Number(maxPrice));
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);

  } catch (error) {
    console.error('Error counting products:', error);
    throw new Error(`Database count query failed: ${error.message}`);
  }
}

/**
 * Get all available categories
 * @returns {Promise<Array>} Array of unique category names
 */
async function getCategories() {
  try {
    const query = 'SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category';
    const result = await pool.query(query);
    return result.rows.map(row => row.category);
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }
}

// Example usage function
async function exampleUsage() {
  try {
    // Example 1: Get all products in 'Electronics' category
    const electronicsProducts = await getProducts({
      category: 'Electronics',
      limit: 10
    });
    console.log('Electronics products:', electronicsProducts);

    // Example 2: Get products in price range $10-$100
    const priceRangeProducts = await getProducts({
      minPrice: 10,
      maxPrice: 100,
      limit: 20
    });
    console.log('Products $10-$100:', priceRangeProducts);

    // Example 3: Get 'Books' under $25 with pagination
    const cheapBooks = await getProducts({
      category: 'Books',
      maxPrice: 25,
      limit: 15,
      offset: 0
    });
    console.log('Cheap books:', cheapBooks);

    // Example 4: Get total count for pagination
    const totalCount = await getProductCount({
      category: 'Electronics',
      minPrice: 50
    });
    console.log('Total matching products:', totalCount);

    // Example 5: Get all categories
    const categories = await getCategories();
    console.log('Available categories:', categories);

  } catch (error) {
    console.error('Example usage error:', error);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

module.exports = {
  getProducts,
  getProductCount,
  getCategories,
  exampleUsage
};

/* 
Expected database table structure:
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

To use this module:
1. Install dependencies: npm install pg
2. Set environment variables for database connection
3. Import and use the functions in your application
*/