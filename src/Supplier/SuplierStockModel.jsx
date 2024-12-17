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
        const response = await axios.get(`http://154.26.129.243:5000/api/products/get_supplier_products/${encodeURIComponent(supName)}`);
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
    className="modal-content-supplier-stock-model"
    overlayClassName="modal-overlay"
    ariaHideApp={false}
  >
    <h2 style={{fontSize:"20px"}}>Supplier Products</h2>

    {/* Quantity range filter */}
    <div id="quantity-filter-supplier-stock-model">
      <label htmlFor="minQuantity" id="minQuantity-supplier-stock-model">Min Quantity:</label>
      <input
        type="number"
        id="minQuantity-supplier-stock-model"
        value={minQuantity}
        onChange={(e) => setMinQuantity(Number(e.target.value))}
      />
      <label htmlFor="maxQuantity" id="maxQuantity-supplier-stock-model">Max Quantity:</label>
      <input
        type="number"
        id="maxQuantity-supplier-stock-model"
        value={maxQuantity}
        onChange={(e) => setMaxQuantity(Number(e.target.value))}
      />
    </div>

    {/* Product table */}
    <div id="product-table-container-supplier-stock-model">
      <table id="product-table-supplier-stock-model">
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

    <button id="close-button-supplier-stock-model" onClick={onClose}>Close</button>
  </Modal>
);

}

SupplierStockModel.propTypes = {
  supName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};
