// src/components/StockBatch.jsx

import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import PropTypes from "prop-types";
import "../css1/StockSupplier.css"; // Ensure this path is correct

export default function StockBatch() {
    const [products, setProducts] = useState([]);
    const [filteredBatchList, setFilteredBatchList] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState("");
    const [isBatchDropDownVisible, setBatchDropDownVisible] = useState(false);
    const [quantityRange, setQuantityRange] = useState({ min: 0, max: Infinity });
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(false); // Loading state

    const apiBaseUrl = "http://154.26.129.243:5000"; // Define API base URL

    useEffect(() => {
        fetchBatches(); // Initial load without a search term
    }, []);

    // Helper function to check if a URL is external
    const isExternalURL = (url) => {
        return /^https?:\/\//i.test(url);
    };

    // Fetch batches based on search input
    const fetchBatches = async (searchTerm = "") => {
        try {
            const response = await axios.get(`${apiBaseUrl}/api/stock/get_batches_stock`, {
                params: { searchTerm },
            });
            console.log("Batches Fetched:", response.data);
            setFilteredBatchList(response.data);
        } catch (error) {
            console.error("Error fetching batches:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error fetching batches",
            });
        }
    };

    // Fetch products related to the selected batch
    const fetchProductsByBatch = async (batchName) => {
        setIsLoading(true); // Start loading
        try {
            const response = await axios.get(`${apiBaseUrl}/api/stock/fetch_products_by_batch`, {
                params: { batch: batchName },
            });
            console.log(`Products for Batch (${batchName}):`, response.data);
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error fetching products",
            });
        } finally {
            setIsLoading(false); // End loading
        }
    };

    // Handle batch search on user input
    const handleBatchSearch = (e) => {
        const searchTerm = e.target.value;
        setSelectedBatch(searchTerm);
        fetchBatches(searchTerm); // Fetch batches based on input search term
        setBatchDropDownVisible(true); // Show dropdown
    };

    // Handle selection of batch to fetch and display related products
    const handleBatchSelect = (batchName) => {
        setSelectedBatch(batchName);
        setBatchDropDownVisible(false); // Hide dropdown after selection
        fetchProductsByBatch(batchName); // Fetch products for selected batch
        setCurrentPage(1); // Reset to first page on new selection
    };

    // Handle quantity range change
    const handleQuantityRangeChange = (event) => {
        const { name, value } = event.target;
        setQuantityRange((prevRange) => ({
            ...prevRange,
            [name]: value === "" ? (name === "min" ? 0 : Infinity) : parseFloat(value), // Use parseFloat for decimals
        }));
    };

    // Filter products based on quantity range
    const filteredProducts = products.filter((product) => {
        const isQuantityMatch =
            (quantityRange.min === 0 && quantityRange.max === Infinity) ||
            (product.stockQuantity >= quantityRange.min && product.stockQuantity <= quantityRange.max);
        return isQuantityMatch;
    });

    // Pagination logic
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

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
        <div className="manage-products-stock-by-category" id="manage_stock_background">
            {/* Controls */}
            <div className="controls-container-stock-by-category">
                {/* Batch Search */}
                <div className="form-group-stock-by-category">
                    <label htmlFor="selectedBatch">Enter Batch Number</label>
                    <input
                        id="batch_text_input-stock-by-category"
                        type="text"
                        value={selectedBatch}
                        onChange={handleBatchSearch}
                        placeholder="Type to search batches"
                        onBlur={() => setTimeout(() => setBatchDropDownVisible(false), 200)}
                        onFocus={() => setBatchDropDownVisible(true)}
                        autoComplete="off"
                    />
                    {isBatchDropDownVisible && filteredBatchList.length > 0 && (
                        <ul className="dropdown-list-stock-by-category">
                            {filteredBatchList.map((batch) => (
                                <li
                                    key={batch.id} // Ensure 'id' exists in the backend response
                                    onClick={() => handleBatchSelect(batch.batchName)}
                                >
                                    {batch.batchName}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Quantity Range Filter */}
                <div className="quantity-range-container-stock-by-category">
                    <label>Quantity Range:</label>
                    <input
                        id="input_quantityrange_min"
                        type="number"
                        name="min"
                        placeholder="Min"
                        value={quantityRange.min === 0 ? "" : quantityRange.min}
                        onChange={handleQuantityRangeChange}
                        min="0"
                        step="0.0001" // Allow decimals
                    />
                    <input
                        id="input_quantityrange_max"
                        type="number"
                        name="max"
                        placeholder="Max"
                        value={quantityRange.max === Infinity ? "" : quantityRange.max}
                        onChange={handleQuantityRangeChange}
                        min="0"
                        step="0.0001" // Allow decimals
                    />
                </div>
            </div>

            {/* Product Cards */}
            <div className="product-card-container-stock-by-category">
                {isLoading ? (
                    <p>Loading products...</p>
                ) : currentProducts.length > 0 ? (
                    currentProducts.map((product) => (
                        <div className="product-card-stock-by-category" key={product.productId}>
                            <img
                                src={
                                    product.imageLink
                                        ? (isExternalURL(product.imageLink) ? product.imageLink : `${apiBaseUrl}/${product.imageLink}`)
                                        : "/images/placeholder.jpg" // Default placeholder
                                }
                                alt={product.productName ? `${product.productName} Image` : "Product Image"}
                                className="product-image-stock-by-category"
                                onError={(e) => {
                                    // Prevent infinite loop by checking a data attribute
                                    if (!e.target.dataset.hasFallback) {
                                        e.target.dataset.hasFallback = "true";
                                        if (isExternalURL(e.target.src)) {
                                            e.target.src = "/images/image-not-found.jpg"; // Fallback for external images
                                        } else {
                                            e.target.src = "/images/placeholder.jpg"; // Existing fallback for internal images
                                        }
                                    }
                                }}
                                loading="lazy" // Improves performance
                            />
                            <div className="product-info-stock-by-category">
                                <h3>{product.productName}</h3>
                                <p>Batch: {product.batchNumber}</p>
                                <p>Unit: {product.selectedUnit}</p>
                                <p>MRP: {product.mrpPrice} RS</p>
                                <p>Stock: {product.stockQuantity}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No products found for the selected batch.</p>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
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
            )}
        </div>
    ); // <-- Add this closing parenthesis and semicolon to close the return statement and the function

} // <-- Add this closing brace to close the function

// Remove the unused 'store' prop validation
// If you plan to use 'store', implement its functionality accordingly
StockBatch.propTypes = {
    // store: PropTypes.string.isRequired, // Commented out or remove
};
