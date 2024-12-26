import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // For delete confirmation and alerts
import PropTypes from "prop-types";
import Modal from "react-modal"; // Modal component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faPlusCircle, faEye } from "@fortawesome/free-solid-svg-icons"; // Icons
import "../css/ManageProducts.css"; // CSS for styling
import ProductUpdate from "./ProductUpdate";

export default function ManageProducts({ store }) {
  // State Variables
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Search state
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [productsPerPage, setProductsPerPage] = useState(10); // Number of products per page
  const [modalIsOpen, setModalIsOpen] = useState(false); // Modal state
  const [selectedProduct, setSelectedProduct] = useState(null); // Selected product for modal
  const [modalType, setModalType] = useState(""); // Modal type state for different modals
  const [largeImage, setLargeImage] = useState(null); // State for large image

  // Fetch Products on Component Mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products/fetch_products', {
          params: {
            store, // Pass the store prop here
            status: null, // Optional: Add other filters if needed
            searchTerm, // Pass the searchTerm state
          },
        });
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error fetching products',
        });
      }
    };
  
    fetchProducts();
  }, [store, searchTerm]); // Add `store` and `searchTerm` as dependencies
  

  // Open Edit Modal and Set Selected Product
  const handleEdit = (product) => {
    setSelectedProduct(product);
    setModalType("editProduct");
    setModalIsOpen(true);
  };

  // Handle Product Update
  const handleUpdate = async (updatedProduct) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/products/update_product/${updatedProduct.productId}`,
        updatedProduct
      );
      if (response.status === 200) {
        Swal.fire("Success", "Product updated successfully!", "success");
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.productId === updatedProduct.productId
              ? updatedProduct
              : product
          )
        );
        setModalIsOpen(false); // Close modal after update
      }
    } catch (error) {
      console.error("Error updating product:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to update product: ${
          error.response?.data?.message || error.message
        }`,
      });
    }
  };

  // Function to Handle Status Toggle on Double-Click
  const handleStatusToggle = async (productId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const response = await axios.put(
        `http://localhost:5000/api/products/update_status/${productId}`,
        {
          status: newStatus,
        }
      );
      if (response.status === 200) {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.productId === productId
              ? { ...product, status: newStatus }
              : product
          )
        );
        Swal.fire(
          "Status Updated",
          `Product status changed to ${newStatus}`,
          "success"
        );
      }
    } catch (error) {
      console.error("Error updating product status:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to update product status: ${
          error.response?.data?.message || error.message
        }`,
      });
    }
  };

  // Function to Display Product Name (Sinhala) in Modal
  const handleViewProductNameSinhala = (productId) => {
    const product = products.find((p) => p.productId === productId);
    if (product) {
      setSelectedProduct(product);
      setModalType("productNameSinhala");
      setModalIsOpen(true);
    } else {
      console.error("Product not found");
    }
  };

  // Function to Display MRP Details in Modal
  const handleViewMRPDetails = (productId) => {
    const product = products.find((p) => p.productId === productId);
    if (product) {
      setSelectedProduct(product);
      setModalType("mrpDetails");
      setModalIsOpen(true);
    } else {
      console.error("Product not found");
    }
  };

  // Function to Display Stock Alert in Modal
  const handleViewStockAlert = (productId) => {
    const product = products.find((p) => p.productId === productId);
    if (product) {
      setSelectedProduct(product);
      setModalType("stockAlert");
      setModalIsOpen(true);
    } else {
      console.error("Product not found");
    }
  };

  // Function to Display Profit Percentage Details in Modal
  const handleViewProfitDetails = (productId) => {
    const product = products.find((p) => p.productId === productId);
    if (product) {
      setSelectedProduct(product);
      setModalType("profitView");
      setModalIsOpen(true);
    } else {
      console.error("Product not found");
    }
  };

  // Function to Display Large Image in Modal
  const handleViewLargeImage = (imageLink) => {
    setLargeImage(imageLink);
    setModalType("largeImage");
    setModalIsOpen(true);
  };

  // Function to Close Modal
  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedProduct(null);
    setLargeImage(null);
    setModalType("");
  };

  // Function to Delete Products
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
          const response = await axios.delete(
            `http://localhost:5000/api/products/delete_product/${productId}`
          );
          if (response.status === 200) {
            setProducts(
              products.filter((product) => product.productId !== productId)
            );
            Swal.fire(
              "Deleted!",
              `Product "${productId}" has been deleted.`,
              "success"
            );
          }
        } catch (err) {
          console.error("Error deleting product:", err);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: `Failed to delete product: ${
              err.response?.data?.message || err.message
            }`,
          });
        }
      }
    });
  };

  // Enhanced Filter Products Function for Global Search
  const filteredProducts = products.filter((product) => {
    const isStoreMatch =
      store === "all" || product.store === store || product.store === "all";

    const searchTermLower = searchTerm.toLowerCase();

    // Check if the search term matches any of the relevant product fields
    const isSearchMatch =
      product.productName.toLowerCase().includes(searchTermLower) ||
      product.productId.toLowerCase().includes(searchTermLower) ||
      product.selectedSupplier.toLowerCase().includes(searchTermLower) ||
      product.selectedCategory.toLowerCase().includes(searchTermLower) ||
      product.selectedUnit.toLowerCase().includes(searchTermLower) ||
      product.status.toLowerCase().includes(searchTermLower);

    return isStoreMatch && isSearchMatch;
  });

  // Calculate Totals Directly from Products
  const totalCostPrice = products.reduce(
    (acc, product) => acc + parseFloat(product.costPrice || 0),
    0
  );
  const totalMrpPrice = products.reduce(
    (acc, product) => acc + parseFloat(product.mrpPrice || 0),
    0
  );

  // Pagination Logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Calculate Total Pages
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Handle Pagination Next and Previous
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // Handle Changing the Number of Products Displayed per Page
  const handleProductsPerPageChange = (event) => {
    setProductsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to page 1 when rows per page changes
  };

  // Pagination Numbers Logic (Only Show 3 Middle Numbers)
  const getPaginationNumbers = () => {
    const pages = [];
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage === 1) {
        pages.push(1, 2, 3);
      } else if (currentPage === totalPages) {
        pages.push(totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(currentPage - 1, currentPage, currentPage + 1);
      }
    }
    return pages;
  };

  // Function to Open Totals Modal
  const handleViewTotals = () => {
    setModalType("viewTotals");
    setModalIsOpen(true);
  };

  return (
    <div className="manage-products">
      {/* Controls Container */}
      <div className="controls-container">
        {/* Search Box */}
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Products Per Page Combo Box */}
        <div className="rows-per-page">
          <label>Show: </label>
          <select
            value={productsPerPage}
            onChange={handleProductsPerPageChange}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="product-table-product">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Product ID</th>
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
            {currentProducts.length > 0 ? (
              currentProducts.map((product, index) => (
                <tr key={product.productId}>
                  {/* Continuous Numbering */}
                  <td>{indexOfFirstProduct + index + 1}</td>
                  <td>{product.productId}</td>
                  <td>
                    <FontAwesomeIcon
                      icon={faPlusCircle}
                      style={{ cursor: "pointer", marginRight: "5px" }}
                      onClick={() =>
                        handleViewProductNameSinhala(product.productId)
                      }
                      title="View Sinhala Name"
                    />
                    {product.productName}
                  </td>
                  <td>{product.selectedSupplier}</td>
                  <td>{product.selectedCategory}</td>
                  <td>{product.selectedUnit}</td>
                  <td>
                    <FontAwesomeIcon
                      icon={faPlusCircle}
                      style={{ cursor: "pointer", marginRight: "5px" }}
                      onClick={() => handleViewProfitDetails(product.productId)}
                      title="View Profit Details"
                    />
                    {product.costPrice}
                  </td>
                  <td>
                    <FontAwesomeIcon
                      icon={faPlusCircle}
                      style={{ cursor: "pointer", marginRight: "5px" }}
                      onClick={() => handleViewMRPDetails(product.productId)}
                      title="View MRP Details"
                    />
                    {product.mrpPrice}
                  </td>
                  <td>
                    <FontAwesomeIcon
                      icon={faBell}
                      style={{ cursor: "pointer", marginRight: "5px" }}
                      onClick={() => handleViewStockAlert(product.productId)}
                      title="View Stock Alert"
                    />
                    {product.stockQuantity}
                  </td>
                  <td
                    onDoubleClick={() => handleViewLargeImage(product.imageLink)}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={product.imageLink}
                      className="product-image"
                      alt="Product"
                    />
                  </td>
                  <td
                    onDoubleClick={() =>
                      handleStatusToggle(product.productId, product.status)
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <span
                      className={
                        product.status === "active"
                          ? "status-active"
                          : "status-inactive"
                      }
                    >
                      {product.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="action-button">
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(product)}
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
              ))
            ) : (
              <tr>
                <td colSpan="12" style={{ textAlign: "center" }}>
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals Section with Eye Icon */}
      <div className="totals-section">
        <button className="view-totals-button" onClick={handleViewTotals}>
          <FontAwesomeIcon icon={faEye} /> View Totals
        </button>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>
          Previous
        </button>
        {getPaginationNumbers().map((number) => (
          <button
            key={number}
            onClick={() => setCurrentPage(number)}
            className={currentPage === number ? "active" : ""}
          >
            {number}
          </button>
        ))}
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

      {/* Product Update Modal */}
      {selectedProduct && modalType === "editProduct" && (
        <ProductUpdate
          product={selectedProduct}
          onClose={closeModal}
          onUpdate={handleUpdate}
        />
      )}

      {/* Totals Modal */}
      <Modal
        isOpen={modalIsOpen && modalType === "viewTotals"}
        onRequestClose={closeModal}
        contentLabel="Totals"
        className="modal-content"
        overlayClassName="modal-overlay"
        ariaHideApp={false}
      >
        <div className="totals-modal-content">
          <h2>Totals</h2>
          <p>
            <strong>Total MRP Price:</strong>{" "}
            <span className="totals-value">{totalMrpPrice.toFixed(2)}</span>
          </p>
          <p>
            <strong>Total Cost Price:</strong>{" "}
            <span className="totals-value">{totalCostPrice.toFixed(2)}</span>
          </p>
          <button onClick={closeModal} className="close-modal-button">
            Close
          </button>
        </div>
      </Modal>

      {/* Other Modals for Displaying Details */}
      <Modal
        isOpen={modalIsOpen && modalType !== "editProduct" && modalType !== "viewTotals"}
        onRequestClose={closeModal}
        contentLabel="Product Details"
        className="modal-content"
        overlayClassName="modal-overlay"
        ariaHideApp={false}
      >
        {selectedProduct && modalType === "productNameSinhala" ? (
          <div>
            <h2>Product Name (Sinhala)</h2>
            <p>{selectedProduct.productNameSinhala || "N/A"}</p>
          </div>
        ) : selectedProduct && modalType === "mrpDetails" ? (
          <div>
            <h2>MRP Details</h2>
            <p>
              <strong>MRP Price:</strong> {selectedProduct.mrpPrice}
            </p>
            <p>
              <strong>Discount Price:</strong> {selectedProduct.discountPrice}
            </p>
            <p>
              <strong>Discount Percentage:</strong>{" "}
              {selectedProduct.discountPercentage}%
            </p>
            <p>
              <strong>Wholesale Price:</strong> {selectedProduct.wholesalePrice}
            </p>
            <p>
              <strong>Wholesale Percentage:</strong>{" "}
              {selectedProduct.wholesalePercentage}%
            </p>
            <p>
              <strong>Locked Price:</strong> {selectedProduct.lockedPrice}
            </p>
          </div>
        ) : selectedProduct && modalType === "profitView" ? (
          <div>
            <h2>Profit Details</h2>
            <p>
              <strong>Profit Price:</strong> {selectedProduct.profitAmount}
            </p>
            <p>
              <strong>Profit Percentage:</strong>{" "}
              {selectedProduct.profitPercentage}%
            </p>
          </div>
        ) : selectedProduct && modalType === "stockAlert" ? (
          <div>
            <h2>Stock Alert</h2>
            <p>{selectedProduct.stockAlert}</p>
          </div>
        ) : modalType === "largeImage" && largeImage ? (
          <div>
            <h2>Product Image</h2>
            <img
              src={largeImage}
              alt="Product"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        ) : (
          <p>No product details available.</p>
        )}
        <button onClick={closeModal} className="close-modal-button">
          Close
        </button>
      </Modal>
    </div>
  );
}

// Validate props with PropTypes
ManageProducts.propTypes = {
  store: PropTypes.string.isRequired,
};
