const express = require('express');
const app = express();
const port = 3000;

// Sample data - Replace with your transformed data
const data = require('./transformedData.json'); // Assuming data.json contains the transformed product data

// Favicon request handler
app.get('/favicon.ico', (req, res) => res.status(204).end());

// API endpoint to return products data
app.get('/products', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const start = (page - 1) * limit;
  const end = page * limit;

  // Accessing products from the 'data' object
  const products = data.data ? data.data.products : [];

  // Paginate the data
  const paginatedData = products.slice(start, end);

  // Check if there's more data to return
  if (paginatedData.length > 0) {
    res.json({
      data: {
        total: data.data.total,
        products: paginatedData
      }
    });
  } else {
    res.json({
      data: null
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
