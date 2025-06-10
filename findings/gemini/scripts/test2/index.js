const { Pool } = require('pg');

// It's recommended to use environment variables for database credentials
const pool = new Pool({
  user: process.env.DB_USER || 'your_username',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'your_database',
  password: process.env.DB_PASSWORD || 'your_password',
  port: process.env.DB_PORT || 5432,
});

/**
 * Queries for products based on category and price range.
 *
 * @param {string} category - The product category.
 * @param {number} minPrice - The minimum price.
 * @param {number} maxPrice - The maximum price.
 * @returns {Promise<Array>} A promise that resolves to an array of products.
 */
async function getProducts(category, minPrice, maxPrice) {
  let queryString = 'SELECT * FROM products WHERE 1=1';
  const queryParams = [];
  let paramIndex = 1;

  if (category) {
    queryString += ` AND category = $${paramIndex}`;
    queryParams.push(category);
    paramIndex++;
  }

  if (minPrice) {
    queryString += ` AND price >= $${paramIndex}`;
    queryParams.push(minPrice);
    paramIndex++;
  }

  if (maxPrice) {
    queryString += ` AND price <= $${paramIndex}`;
    queryParams.push(maxPrice);
    paramIndex++;
  }

  try {
    const { rows } = await pool.query(queryString, queryParams);
    return rows;
  } catch (error) {
    console.error('Error executing query', error.stack);
    throw error;
  }
}

// --- Example Usage ---
async function main() {
  try {
    console.log('--- Fetching Electronics between $50 and $100 ---');
    const electronics = await getProducts('Electronics', 50, 100);
    console.log(electronics);

    console.log('\n--- Fetching all Home Goods ---');
    const homeGoods = await getProducts('Home Goods', null, null);
    console.log(homeGoods);

    console.log('\n--- Fetching all products under $200 ---');
    const allUnder200 = await getProducts(null, null, 200);
    console.log(allUnder200);

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    // End the pool when the application is shutting down
    await pool.end();
  }
}

main();