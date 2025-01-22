const axios = require("axios");
const fs = require("fs");

// API URL
const apiUrl = "https://api.merabestie.com/get-product";

// Function to transform the data
const transformData = (data) => {
  // Ensure the data is an array
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

// Function to fetch and process data
const fetchDataAndTransform = async () => {
  try {
    // Fetch data from the API
    const response = await axios.get(apiUrl);

    // Log the response structure for debugging
    console.log("Raw API Response:", response.data);

    // Extract and transform the data
    const currentData = Array.isArray(response.data)
      ? response.data
      : response.data.products || []; // Adjust based on API response

    const transformedData = transformData(currentData);

    // Save the transformed data to a JSON file
    fs.writeFileSync("transformedData.json", JSON.stringify(transformedData, null, 2), "utf-8");

    console.log("Data fetched and transformed successfully!");
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
};

// Run the script
fetchDataAndTransform();
