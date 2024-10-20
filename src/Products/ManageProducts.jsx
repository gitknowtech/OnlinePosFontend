import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // For delete confirmation and alerts
import PropTypes from "prop-types";
import Modal from "react-modal"; // Modal component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../css/ManageProducts.css"; // Assuming a separate CSS file for table design
import { faEdit, faTrashAlt, faWarehouse } from "@fortawesome/free-solid-svg-icons"; // Example icons

export default function ManageProducts({ store }) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Search state
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [productsPerPage] = useState(7); // Number of products per page
  const [modalIsOpen, setModalIsOpen] = useState(false); // Modal state
  const [selectedProduct, setSelectedProduct] = useState(null); // Product details state for the modal

  // Fetch product data from the database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products/fetch_products");
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

  // Function to fetch and display product details in the modal
  const handleViewProductDetails = (productId) => {
    const product = products.find((p) => p.productId === productId);
    setSelectedProduct(product);
    setModalIsOpen(true); // Open modal
  };

  // Function to close the modal
  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedProduct(null); // Clear product details when modal is closed
  };

  const handleDelete = async (productId) => {
    Swal.fire({
      title: `Are you sure you want to delete product "${productId}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`http://localhost:5000/api/products/delete_product/${productId}`);
          if (response.status === 200) {
            setProducts(products.filter((product) => product.productId !== productId));
            Swal.fire("Deleted!", `Product "${productId}" has been deleted.`, "success");
          }
        } catch (err) {
          console.error("Error deleting product:", err);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: `Failed to delete product: ${err.response?.data?.message || err.message}`,
          });
        }
      }
    });
  };

  // Filter products based on the search term, store, or show all if store is 'all'
  const filteredProducts = products.filter((product) => {
    const isStoreMatch = store === "all" || product.store === store || product.store === "all";
    const isSearchMatch = product.productName.toLowerCase().includes(searchTerm.toLowerCase());
    return isStoreMatch && isSearchMatch;
  });

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="manage-products">

      {/* Search box */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Product table */}
      <div className="product-table">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Product ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Store</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((product, index) => (
              <tr key={product.productId}>
                {/* No column to display continuous numbering */}
                <td>{indexOfFirstProduct + index + 1}</td>
                <td>{product.productId}</td>
                <td>{product.productName}</td>
                <td>{product.selectedCategory}</td>
                <td>{product.mrpPrice}</td>
                <td>{product.stockQuantity}</td>
                <td>{product.store}</td>
                <td>
                  <button className="action-button edit-button" onClick={() => handleViewProductDetails(product.productId)}>
                    <FontAwesomeIcon icon={faEdit} /> Edit
                  </button>
                  <button className="action-button delete-button" onClick={() => handleDelete(product.productId)}>
                    <FontAwesomeIcon icon={faTrashAlt} /> Delete
                  </button>
                  <button className="action-button stock-button">
                    <FontAwesomeIcon icon={faWarehouse} /> Stock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        {[...Array(Math.ceil(filteredProducts.length / productsPerPage)).keys()].map((number) => (
          <button
            key={number + 1}
            onClick={() => paginate(number + 1)}
            className={currentPage === number + 1 ? "active" : ""}
          >
            {number + 1}
          </button>
        ))}
      </div>

      {/* Product Details Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Product Details"
        className="modal-content"
        overlayClassName="modal-overlay"
        ariaHideApp={false}
      >
        <h2>Product Details</h2>
        {selectedProduct ? (
          <div>
            <p>
              <strong>Product ID:</strong> {selectedProduct.productId}
            </p>
            <p>
              <strong>Name:</strong> {selectedProduct.productName}
            </p>
            <p>
              <strong>Category:</strong> {selectedProduct.selectedCategory}
            </p>
            <p>
              <strong>Price:</strong> {selectedProduct.mrpPrice}
            </p>
            <p>
              <strong>Stock:</strong> {selectedProduct.stockQuantity}
            </p>
          </div>
        ) : (
          <p>No product details available.</p>
        )}
        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
}

// Validate props with PropTypes
ManageProducts.propTypes = {
  store: PropTypes.string.isRequired,
};
