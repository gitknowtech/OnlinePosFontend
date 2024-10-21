import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // For delete confirmation and alerts
import PropTypes from "prop-types";
import Modal from "react-modal"; // Modal component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../css/ManageProducts.css"; // Assuming a separate CSS file for table design
import { faEdit, faTrashAlt, faWarehouse, faEye, faEyeSlash, faBell } from "@fortawesome/free-solid-svg-icons"; // Icons

export default function ManageProducts({ store }) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Search state
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [productsPerPage] = useState(7); // Number of products per page
  const [modalIsOpen, setModalIsOpen] = useState(false); // Modal state
  const [selectedProduct, setSelectedProduct] = useState(null); // Product details state for the modal
  const [modalType, setModalType] = useState(""); // Modal type state for different modals
  const [largeImage, setLargeImage] = useState(null); // State for the large image

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

  // Function to handle status toggle on double-click
  const handleStatusToggle = async (productId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const response = await axios.put(`http://localhost:5000/api/products/update_status/${productId}`, {
        status: newStatus,
      });
      if (response.status === 200) {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.productId === productId ? { ...product, status: newStatus } : product
          )
        );
        Swal.fire("Status Updated", `Product status changed to ${newStatus}`, "success");
      }
    } catch (error) {
      console.error("Error updating product status:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to update product status: ${error.response?.data?.message || error.message}`,
      });
    }
  };

  // Function to display Product Name (Sinhala) in the modal
  const handleViewProductNameSinhala = (productId) => {
    const product = products.find((p) => p.productId === productId);
    setSelectedProduct(product);
    setModalType("productNameSinhala");
    setModalIsOpen(true); // Open modal
  };

  // Function to display MRP details in the modal
  const handleViewMRPDetails = (productId) => {
    const product = products.find((p) => p.productId === productId);
    setSelectedProduct(product);
    setModalType("mrpDetails");
    setModalIsOpen(true); // Open modal
  };

  // Function to display Stock Alert in the modal
  const handleViewStockAlert = (productId) => {
    const product = products.find((p) => p.productId === productId);
    setSelectedProduct(product);
    setModalType("stockAlert");
    setModalIsOpen(true); // Open modal
  };

  // Function to display profit percentage details
  const handleViewProfitDetails = (productId) => {
    const product = products.find((p) => p.productId === productId); // Find product by productId
    if (product) {
      setSelectedProduct(product); // Set the selected product in state
      setModalType("profitView"); // Set the modal type to profit view
      setModalIsOpen(true); // Open the modal
    } else {
      console.error("Product not found");
    }
  };

  // Function to display large image in the modal
  const handleViewLargeImage = (imageLink) => {
    setLargeImage(imageLink);
    setModalType("largeImage");
    setModalIsOpen(true); // Open modal
  };

  // Function to close the modal
  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedProduct(null); // Clear product details when modal is closed
    setLargeImage(null); // Clear large image
    setModalType(""); // Reset modal type
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
              <th>Product Name</th>
              <th>Supplier</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Cost</th>
              <th>MRP</th>
              <th>Stock</th>
              <th>Image</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((product, index) => (
              <tr key={product.productId}>
                {/* No column to display continuous numbering */}
                <td>{indexOfFirstProduct + index + 1}</td>
                <td>
                  {product.productName}{" "}
                  <FontAwesomeIcon
                    icon={faEyeSlash}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleViewProductNameSinhala(product.productId)}
                  />
                </td>
                <td>{product.selectedSupplier}</td>
                <td>{product.selectedCategory}</td>
                <td>{product.selectedUnit}</td>
                <td>
                  {product.costPrice}{" "}
                  <FontAwesomeIcon
                    icon={faEye}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleViewProfitDetails(product.productId)}
                  />
                </td>
                <td>
                  {product.mrpPrice}{" "}
                  <FontAwesomeIcon
                    icon={faEye}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleViewMRPDetails(product.productId)}
                  />
                </td>
                <td>
                  {product.stockQuantity}{" "}
                  <FontAwesomeIcon
                    icon={faBell}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleViewStockAlert(product.productId)}
                  />
                </td>
                <td
                  onDoubleClick={() => handleViewLargeImage(product.imageLink)} // Double-click to view large image
                  style={{ cursor: "pointer" }}
                >
                  <img src={product.imageLink} className="product-image" />
                </td>
                <td
                  onDoubleClick={() => handleStatusToggle(product.productId, product.status)} // Double-click event for status toggle
                  style={{ cursor: "pointer" }}
                >
                  <span className={product.status === "active" ? "status-active" : "status-inactive"}>
                    {product.status === "active" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="action-button">
                  <button
                    className="edit-button"
                    onClick={() => handleViewProductDetails(product.productId)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(product.productId)}
                  >
                    Delete
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

      {/* Modals */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Product Details"
        className="modal-content"
        overlayClassName="modal-overlay"
        ariaHideApp={false}
      >
        {selectedProduct && modalType === "productNameSinhala" ? (
          <div>
            <p>
              <strong>Product Name (Sinhala):</strong> {selectedProduct.productNameSinhala}
            </p>
          </div>
        ) : selectedProduct && modalType === "mrpDetails" ? (
          <div>
            <p>
              <strong>MRP Price:</strong> {selectedProduct.mrpPrice}
            </p>
            <p>
              <strong>Discount Price:</strong> {selectedProduct.discountPrice}
            </p>
            <p>
              <strong>Discount Percentage:</strong> {selectedProduct.discountPercentage}%
            </p>
            <p>
              <strong>Wholesale Price:</strong> {selectedProduct.wholesalePrice}
            </p>
            <p>
              <strong>Wholesale Percentage:</strong> {selectedProduct.wholesalePercentage}%
            </p>
            <p>
              <strong>Locked Price:</strong> {selectedProduct.lockedPrice}
            </p>
          </div>
        ) : selectedProduct && modalType === "profitView" ? (
          <div>
            <p>
              <strong>Profit Price: </strong> {selectedProduct.profitAmount}
            </p>
            <p>
              <strong>Profit Percentage: </strong> {selectedProduct.profitPercentage}%
            </p>
          </div>
        ) : selectedProduct && modalType === "stockAlert" ? (
          <div>
            <p>
              <strong>Stock Alert:</strong> {selectedProduct.stockAlert}
            </p>
          </div>
        ) : modalType === "largeImage" && largeImage ? (
          <div>
            <img src={largeImage} alt="Product" style={{ width: "100%", height: "auto" }} />
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
