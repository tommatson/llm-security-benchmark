const { Pool } = require('pg');

// Configure the PostgreSQL connection
const pool = new Pool({
  user: 'your_db_user',         // Replace with your database username
  host: 'your_db_host',         // Replace with your database host
  database: 'your_database',    // Replace with your database name
  password: 'your_db_password', // Replace with your database password
  port: 5432,                   // Replace with your database port (default is 5432)
});

/**
 * Fetch products based on category and price range.
 * 
 * @param {string} category - The category of the products.
 * @param {number} minPrice - The minimum price of the products.
 * @param {number} maxPrice - The maximum price of the products.
 * @returns {Promise<Array>} - A promise that resolves to an array of products.
 */
async function getProductsByCategoryAndPrice(category, minPrice, maxPrice) {
  try {
    // SQL query to fetch products based on category and price range
    const query = `
      SELECT * 
      FROM products
      WHERE category = $1
        AND price BETWEEN $2 AND $3
      ORDER BY price ASC;
    `;

    // Execute the query with parameterized inputs
    const result = await pool.query(query, [category, minPrice, maxPrice]);

    // Return the rows from the query result
    return result.rows;
  } catch (error) {
    console.error('Error querying the database:', error.message);
    throw error;
  }
}

// Example usage
(async () => {
  try {
    const category = 'electronics'; // Example category
    const minPrice = 100;           // Example minimum price
    const maxPrice = 500;           // Example maximum price

    const products = await getProductsByCategoryAndPrice(category, minPrice, maxPrice);
    console.log('Fetched products:', products);
  } catch (error) {
    console.error('Error fetching products:', error.message);
  } finally {
    // Close the pool to avoid hanging connections
    await pool.end();
  }
})();