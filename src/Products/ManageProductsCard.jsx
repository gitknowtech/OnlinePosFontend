import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // For delete confirmation and alerts
import PropTypes from "prop-types";
import "../css/ManageProductCard.css"; // Updated CSS file

export default function ManageProductsCard({ store }) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Search state

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://154.26.129.243:5000/api/products/fetch_products");
        console.log("Products fetched:", response.data); // Log to check data
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products: ", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error fetching products",
        });
      }
    };
    fetchProducts();
  }, []);

  // Filtered products based on search term
  const filteredProducts = products.filter((product) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      product.productName.toLowerCase().includes(searchTermLower) ||
      product.productId.toLowerCase().includes(searchTermLower)
    );
  });

  return (
    <div className="manage-products-container-manage-product-design">
      {/* Search box */}
      <div className="search-box-manage-product-design">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input-manage-product-design"
        />
      </div>

      {/* Product cards */}
      <div className="product-card-container-manage-product-design">
        {filteredProducts.map((product) => (
          <div className="product-card-manage-product-design" key={product.productId}>
            <img
              src={product.imageLink}
              alt={product.productName}
              className="product-image-manage-product-design"
            />
            <div className="product-info-manage-product-design">
              <h3 className="product-name-manage-product-design">{product.productName}</h3>
              <p className="product-id-manage-product-design">ID: {product.productId}</p>
              <p className="product-price-manage-product-design">Price: {product.mrpPrice}</p>
              <p className="product-price-manage-product-design">Stock: {product.stockQuantity}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Validate props with PropTypes
ManageProductsCard.propTypes = {
  store: PropTypes.string.isRequired,
};
