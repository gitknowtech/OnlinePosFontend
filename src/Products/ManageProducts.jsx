import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // For delete confirmation and alerts
import PropTypes from "prop-types";
import Modal from "react-modal"; // Modal component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../css/ManageProducts.css"; // Assuming a separate CSS file for table design
import { faBell, faPlusCircle } from "@fortawesome/free-solid-svg-icons"; // Icons

export default function ManageProducts({ store }) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Search state
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [productsPerPage, setProductsPerPage] = useState(10); // Number of products per page with combo box
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


  //delete products 
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

  // Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Handle pagination next and previous
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // Handle changing the number of products displayed per page
  const handleProductsPerPageChange = (event) => {
    setProductsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to page 1 when rows per page changes
  };

  // Pagination numbers logic (only show 3 middle numbers)
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


  return (
    <div className="manage-products">

<div className="controls-container">
  {/* Search box */}
  <div className="search-box">
    <input
      type="text"
      placeholder="Search products..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>

  {/* Products per page combo box */}
  <div className="rows-per-page">
    <label>Show: </label>
    <select value={productsPerPage} onChange={handleProductsPerPageChange}>
      <option value="10">10</option>
      <option value="20">20</option>
      <option value="50">50</option>
      <option value="100">100</option>
    </select>
  </div>
</div>


      {/* Product table */}
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
            {currentProducts.map((product, index) => (
              <tr>
                {/* No column to display continuous numbering */}
                <td>{indexOfFirstProduct + index + 1}</td>
                <td>{product.productId}</td>
                <td>
                  <FontAwesomeIcon
                    icon={faPlusCircle}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleViewProductNameSinhala(product.productId)}
                  />{"  "}
                  {product.productName}
                </td>
                <td>{product.selectedSupplier}</td>
                <td>{product.selectedCategory}</td>
                <td>{product.selectedUnit}</td>
                <td>
                  <FontAwesomeIcon
                    icon={faPlusCircle}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleViewProfitDetails(product.productId)}
                  />{"  "}
                  {product.costPrice}
                </td>
                <td>
                  <FontAwesomeIcon
                    icon={faPlusCircle}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleViewMRPDetails(product.productId)}
                  />{"  "}
                  {product.mrpPrice}
                </td>
                <td>
                  <FontAwesomeIcon
                    icon={faBell}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleViewStockAlert(product.productId)}
                  />{"  "}
                  {product.stockQuantity}
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
        <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
        {getPaginationNumbers().map((number) => (
          <button
            key={number}
            onClick={() => setCurrentPage(number)}
            className={currentPage === number ? "active" : ""}
          >
            {number}
          </button>
        ))}
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
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
        {/* Modal content depending on selected product and modal type */}
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
