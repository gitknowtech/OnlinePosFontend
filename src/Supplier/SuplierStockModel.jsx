import { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import Modal from "react-modal";
import Swal from "sweetalert2";
import "../css/SupplierStockModel.css";

export default function SupplierStockModel({ supName, onClose }) {
  const [products, setProducts] = useState([]);
  const [minQuantity, setMinQuantity] = useState(0);
  const [maxQuantity, setMaxQuantity] = useState(Infinity);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const fetchSupplierProducts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/get_supplier_products/${encodeURIComponent(supName)}`);
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error("Error fetching supplier products:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error fetching supplier products",
        });
      }
    };
    fetchSupplierProducts();
  }, [supName]);

  // Filter products based on quantity range dynamically
  useEffect(() => {
    const filtered = products.filter(
      (product) => product.stockQuantity >= minQuantity && product.stockQuantity <= maxQuantity
    );
    setFilteredProducts(filtered);
  }, [minQuantity, maxQuantity, products]);

  return (
  <Modal
    isOpen={true}
    onRequestClose={onClose}
    contentLabel="Supplier Stock Details"
    className="modal-content-stock-update-container"
    overlayClassName="modal-overlay"
    ariaHideApp={false}
  >
    <h2 style={{fontSize:"20px"}}>Supplier Products</h2>

    {/* Quantity range filter */}
    <div id="quantity-filter">
      <label htmlFor="minQuantity">Min Quantity:</label>
      <input
        type="number"
        id="minQuantity"
        value={minQuantity}
        onChange={(e) => setMinQuantity(Number(e.target.value))}
      />
      <label htmlFor="maxQuantity">Max Quantity:</label>
      <input
        type="number"
        id="maxQuantity"
        value={maxQuantity}
        onChange={(e) => setMaxQuantity(Number(e.target.value))}
      />
    </div>

    {/* Product table */}
    <div id="product-table-container">
      <table id="product-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Unit</th>
            <th>Cost</th>
            <th>MRP</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product.productId} >
              <td>{product.productId}</td>
              <td>{product.productName}</td>
              <td>{product.selectedCategory}</td>
              <td>{product.selectedUnit}</td>
              <td>{product.costPrice}</td>
              <td>{product.mrpPrice}</td>
              <td>{product.stockQuantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <button id="close-button" onClick={onClose}>Close</button>
  </Modal>
);

}

SupplierStockModel.propTypes = {
  supName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};
