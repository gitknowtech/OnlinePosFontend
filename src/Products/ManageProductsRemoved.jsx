import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // For delete confirmation and alerts
import PropTypes from "prop-types";
import "../css/ManageProducts.css"; // Assuming a separate CSS file for table design

export default function ManageProductsRemoved({ store }) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Search state
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [productsPerPage, setProductsPerPage] = useState(10); // Number of products per page with combo box

  // Fetch product data from the database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://154.26.129.243:5000/api/products/fetch_removed_products"); // Adjust endpoint as needed
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching removed products: ", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error fetching removed products",
        });
      }
    };
    fetchProducts();
  }, []);

  // Function to handle product deletion
  const handleDelete = async (productId) => {
    Swal.fire({
      title: `Are you sure you want to permanently delete product "${productId}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`http://154.26.129.243:5000/api/products/delete_removed_product/${productId}`);
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

  return (
    <div className="manage-products">
      {/* Search box */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Search removed products..."
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

      {/* Product table */}
      <div className="product-table-product">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Product Id</th>
              <th>Product Name</th>
              <th>Supplier</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Cost</th>
              <th>MRP</th>
              <th>Stock</th>
              <th>Status</th>
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
                <td>{product.selectedSupplier}</td>
                <td>{product.selectedCategory}</td>
                <td>{product.selectedUnit}</td>
                <td>{product.costPrice}</td>
                <td>{product.mrpPrice}</td>
                <td>{product.stockQuantity}</td>
                <td>
                  <span className={product.status === "active" ? "status-active" : "status-inactive"}>
                    {product.status === "active" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="action-button">
                  <button className="delete-button" onClick={() => handleDelete(product.productId)}>
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
        <button onClick={handlePrevPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}

// Validate props with PropTypes
ManageProductsRemoved.propTypes = {
  store: PropTypes.string.isRequired,
};
