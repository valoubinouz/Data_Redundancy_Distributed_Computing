const express = require('express');
const oracledb = require('oracledb');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
const port = 3000;

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


 // POST /orders route
 app.post('/orders', async (req, res) => {
  const newOrder = req.body;

  try {
    const connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `INSERT INTO Order_ (id_order, products_order, status_order, id_client) VALUES (ORDER_SEQ.NEXTVAL, :products_order, :status_order, :id_client) RETURNING id_order INTO :order_id`,
      {
        products_order: JSON.stringify(newOrder.products_order),
        status_order: 'In preparation',
        id_client: newOrder.id_client,
        order_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      },
      { autoCommit: true }
    );

    res.status(201).send('Order created successfully');

  } catch (error) {
    console.error('Error connecting to Oracle DB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/orders/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT * FROM Order_ WHERE id_client = :userId`,
      [userId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Check if any orders were found for the user
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'No orders found for the specified user' });
    } else {
      // Map the result rows to a modified format for JSON response
      const orders = result.rows.map(order => ({
        id_order: order.ID_ORDER,
        products_order: JSON.parse(order.PRODUCTS_ORDER),
        status_order: order.STATUS_ORDER,
        id_client: order.ID_CLIENT
      }));

      res.json(orders);
    }

  } catch (error) {
    console.error('Error connecting to Oracle DB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// CART ROUTES

app.post('/cart/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  const { productId, quantity } = req.body;

  try {
    const connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT * FROM Cart WHERE id_client = :userId`,
      [userId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    let cartContents = [];

    if (result.rows.length > 0) {
      // If the user already has a cart, update the contents
      const existingCart = JSON.parse(result.rows[0].PRODUCTS_CART);

      if (Array.isArray(existingCart)) {
        const existingProduct = existingCart.find(item => item.product_id === productId);

        if (existingProduct) {
          // If the product is already in the cart, update the quantity
          existingProduct.quantity += quantity;
        } else {
          // If the product is not in the cart, add it
          existingCart.push({ product_id: productId, quantity });
        }

        cartContents = existingCart;
      } else {
        // If the existingCart is not an array, create a new array
        cartContents = [{ product_id: productId, quantity }];
      }
    } else {
      // If the user doesn't have a cart, create a new one
      cartContents = [{ product_id: productId, quantity }];
    }

    await connection.execute(
      `INSERT INTO Cart (id_cart, products_cart, id_client) VALUES (CART_SEQ.NEXTVAL, :products_cart, :userId)`,
      {
        products_cart: JSON.stringify(cartContents),
        userId
      },
      { autoCommit: true }
    );

    res.json({ cartContents });

  } catch (error) {
    console.error('Error connecting to Oracle DB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/cart/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const connection = await oracledb.getConnection(dbConfig);

    // Execute a query to retrieve the current contents of the user's cart
    const result = await connection.execute(
      `SELECT * FROM Cart WHERE id_client = :userId`,
      [userId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Check if any cart items were found for the user
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'No card found for the user' });
    } else {
      // Map the result rows to a modified format for JSON response
      const cartContents = result.rows.map(cartItem => ({
        id_cart: cartItem.ID_CART,
        products_cart: JSON.parse(cartItem.PRODUCTS_CART),
        id_client: cartItem.ID_CLIENT
      }));

      // Send the array of cart items with detailed information as JSON
      res.json({ cartContents });
    }

  } catch (error) {
    console.error('Error connecting to Oracle DB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE route to delete a product from a cart: 
app.delete('/cart/:userId/item/:productId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  const productId = parseInt(req.params.productId);

  try {
    const connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT * FROM Cart WHERE id_client = :userId`,
      [userId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User has no items in the cart' });
    } else {
      // Log the existing cart data and raw data from the database
      console.log('Existing Cart Data:', result.rows[0].PRODUCTS_CART);
      const existingCart = JSON.parse(result.rows[0].PRODUCTS_CART);

      // Ensure existingCart is always an array
      const cartArray = Array.isArray(existingCart) ? existingCart : [existingCart];

      // Remove the specified product from the cart
      const updatedCart = cartArray.filter(item => item.product_id !== productId);

      // Update the cart in the database
      await connection.execute(
        `UPDATE Cart SET products_cart = :updatedCart WHERE id_client = :userId`,
        {
          updatedCart: JSON.stringify(updatedCart),
          userId
        },
        { autoCommit: true }
      );

      res.json({ cartContents: updatedCart });
    }

  } catch (error) {
    console.error('Error connecting to Oracle DB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
    console.log('Server is listening on localhost:3000');
  });

  