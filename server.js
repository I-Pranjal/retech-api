const express = require('express');
const axios = require('axios');
const fs = require('fs');
const app = express();
const port = 3000;

// API URL
const apiUrl = "https://api.merabestie.com/get-product";

// Function to transform the data
const transformData = (data) => {
  if (!Array.isArray(data)) {
    console.error("Expected an array but received:", typeof data, data);
    throw new Error("Data is not an array. Check the API response format.");
  }

  return {
    data: {
      total: data.length,
      products: data.map((item) => ({
        id: parseInt(item._id) || "",
        title: item.name || "",
        body_html: `<p>Category: ${item.category || ""}, Rating: ${item.rating || ""}, Price: ${item.price || ""}</p>`,
        vendor: "",
        product_type: item.category || "",
        created_at: new Date().toISOString(),
        handle: item.name ? item.name.toLowerCase().replace(/ /g, "-") : "",
        updated_at: new Date().toISOString(),
        tags: "",
        status: item.visibility === "true" ? "active" : "inactive",
        variants: [
          {
            id: item.productId || "",
            title: "Default Variant",
            price: item.price || "",
            sku: item.productId ? `SKU-${item.productId}` : "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            taxable: true,
            grams: "",
            image: {
              src: item.img ? item.img[0] : "",
            },
            weight: "",
            weight_unit: "",
          },
        ],
        image: {
          src: item.img ? item.img[0] : "",
        },
      })),
    },
  };
};

// Function to fetch and update the transformed data file
const fetchDataAndUpdateFile = async () => {
  try {
    console.log("Fetching latest data...");
    const response = await axios.get(apiUrl);
    console.log("Raw API Response received.");

    const currentData = Array.isArray(response.data)
      ? response.data
      : response.data.products || [];

    const transformedData = transformData(currentData);

    // Overwrite the transformedData.json file
    fs.writeFileSync("transformedData.json", JSON.stringify(transformedData, null, 2), "utf-8");

    console.log("File 'transformedData.json' updated successfully!");
    return transformedData;
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return { data: null }; // Return empty data on error
  }
};

// Favicon request handler
app.get('/favicon.ico', (req, res) => res.status(204).end());

// API endpoint to return products data
app.get('/products', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const start = (page - 1) * limit;
  const end = page * limit;

  // Fetch and update data before responding
  const updatedData = await fetchDataAndUpdateFile();
  const products = updatedData.data ? updatedData.data.products : [];

  // Paginate the data
  const paginatedData = products.slice(start, end);

  // Respond with updated data
  res.json({
    data: paginatedData.length > 0
      ? { total: updatedData.data.total, products: paginatedData }
      : { data: null }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
