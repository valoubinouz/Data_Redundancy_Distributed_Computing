const express = require('express');
const oracledb = require('oracledb');
const CircularJSON = require('circular-json');

const app = express();
app.use(express.json());
const port = 3000;

// Oracle database connection parameters
const dbConfig = {
  user: 'SYSTEM',
  password: 'root',
  connectString: 'localhost:1521/xe', 
  serviceName: 'database_workshop3'
};

// Sample route - Fetch products from Oracle DB
app.get('/products', async (req, res) => {
    try {
      const connection = await oracledb.getConnection(dbConfig);
  
      // Execute a query to retrieve all products from the Product table
      const result = await connection.execute(
        `SELECT * FROM Product`
      );
  
      res.json(result.rows);
  
    } catch (error) {
      console.error('Error connecting to Oracle DB:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/products/:id', async (req, res) => {
    const productId = parseInt(req.params.id);
  
    try {
      const connection = await oracledb.getConnection(dbConfig);
  
      // Execute a query to retrieve a specific product by ID from the Product table
      const result = await connection.execute(
        `SELECT * FROM Product WHERE id_product = :id`,
        [productId]
      );
  
      // Check if the product exists
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Product not found' });
      } else {
        res.json(result.rows[0]);
      }
  
    } catch (error) {
      console.error('Error connecting to Oracle DB:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Sample route - Add a new product to Oracle DB
app.post('/products', async (req, res) => {
    const newProduct = req.body;
  
    try {
      const connection = await oracledb.getConnection(dbConfig);
  
      const result = await connection.execute(
        `INSERT INTO Product (id_product, name_product, category, sell_price, inventory_product, purchase_price, description) VALUES (:id, :name, :category, :sell_price, :inventory_product, :purchase_price, :description)`,
        newProduct
      );
      await connection.execute(`COMMIT`);
      console.log('data insert is okay')
      // Send the created product details as JSON
      res.status(201).json(newProduct);
  
    } catch (error) {
      console.error('Error connecting to Oracle DB:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

app.put('/products/:id', async (req, res) => {
    const productId = parseInt(req.params.id);
    const updatedProduct = req.body;
  
    try {
      const connection = await oracledb.getConnection(dbConfig);
  
      const result = await connection.execute(
        `UPDATE Product SET name_product = :name, category = :category, sell_price = :sell_price, inventory_product = :inventory_product, purchase_price = :purchase_price, description = :description WHERE id_product = :id`,
        { ...updatedProduct, id: productId }
      );
      await connection.execute(`COMMIT`);
      // Check if the product was updated successfully
      if (result.rowsAffected === 0) {
        res.status(404).json({ error: 'Product not found' });
      } else {
        res.json(updatedProduct);
      }
  
    } catch (error) {
      console.error('Error connecting to Oracle DB:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Sample route - Delete a product by ID from Oracle DB
app.delete('/products/:id', async (req, res) => {
    const productId = parseInt(req.params.id);
  
    try {
      const connection = await oracledb.getConnection(dbConfig);
  
      const result = await connection.execute(
        `DELETE FROM Product WHERE id_product = :id`,
        [productId]
      );
      await connection.execute(`COMMIT`);

      // Check if the product was deleted successfully
      if (result.rowsAffected === 0) {
        res.status(404).json({ error: 'Product not found' });
      } else {
        res.json({ message: 'Product deleted successfully' });
      }
  
    } catch (error) {
      console.error('Error connecting to Oracle DB:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });



  app.post('/orders', async (req, res) => {
    const newOrder = req.body;

    try {
        // Establish a connection to Oracle DB
        const connection = await oracledb.getConnection(dbConfig);

        // Since your products_order doesn't have circular references, use JSON.stringify directly
        const productsOrderJSON = JSON.stringify(newOrder.products_order);

        const result = await connection.execute(
            `INSERT INTO Order_ (id_order, products_order, status_order, id_client) VALUES (ORDER_SEQ.NEXTVAL, :products_order, :status_order, :id_client) RETURNING id_order INTO :id_order`,
            {
                products_order: productsOrderJSON,
                status_order: 'In preparation',
                id_client: newOrder.id_client,
                id_order: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            }, 
            { autoCommit: true }
        );

        // Retrieve the generated order ID
        const orderId = result.outBinds.id_order[0];

        // Fetch the details of the created order
        const orderDetails = await connection.execute(
            `SELECT * FROM Order_ WHERE id_order = :id_order`,
            { id_order: orderId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // Send the created order details as JSON
        res.status(201).json(orderDetails.rows[0]);
    } catch (error) {
        console.error('Error connecting to Oracle DB:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (connection) {
            try {
                await connection.close(); // Ensure the connection is closed in the finally block
            } catch (err) {
                console.error(err);
            }
        }
    }
});

app.listen(3000, () => {
    console.log('Server is listening on localhost:3000');
  });