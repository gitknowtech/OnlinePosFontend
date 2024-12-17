// src/components/StockCategory.jsx

import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import PropTypes from "prop-types";
import "../css/ManageProductCard.css"; // Ensure this path is correct

export default function StockCategory() {
    const [products, setProducts] = useState([]);
    const [filteredCategoryList, setFilteredCategoryList] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isCategoryDropDownVisible, setCategoryDropDownVisible] = useState(false);
    const [quantityRange, setQuantityRange] = useState({ min: 0, max: Infinity });
    const [searchTerm, setSearchTerm] = useState(""); // Define searchTerm state
    const [isLoading, setIsLoading] = useState(false); // Loading state

    const apiBaseUrl = "http://154.26.129.243:5000"; // Define API base URL

    useEffect(() => {
        fetchCategories(); // Load categories for dropdown on mount
    }, []);

    // Helper function to check if a URL is external
    const isExternalURL = (url) => {
        return /^https?:\/\//i.test(url);
    };

    // Fetch categories based on search input
    const fetchCategories = async (searchTerm = "") => {
        try {
            const response = await axios.get(`${apiBaseUrl}/api/stock/get_categories_stock`, {
                params: { searchTerm },
            });
            console.log("Categories Fetched:", response.data);
            setFilteredCategoryList(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error fetching categories",
            });
        }
    };

    // Fetch products related to the selected category
    const fetchProductsByCategory = async (categoryName) => {
        setIsLoading(true); // Start loading
        try {
            const response = await axios.get(`${apiBaseUrl}/api/stock/fetch_products_by_category`, {
                params: { category: categoryName },
            });
            console.log(`Products for Category (${categoryName}):`, response.data);
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products by category:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error fetching products by category",
            });
        } finally {
            setIsLoading(false); // End loading
        }
    };

    // Handle category search input
    const handleCategorySearch = (e) => {
        const searchInput = e.target.value;
        setSelectedCategory(searchInput);
        setSearchTerm(searchInput); // Update searchTerm state if intended
        fetchCategories(searchInput);
        setCategoryDropDownVisible(true);
    };

    // Handle category selection from dropdown
    const handleCategorySelect = (categoryName) => {
        setSelectedCategory(categoryName);
        setSearchTerm(""); // Clear searchTerm if selecting a category
        setCategoryDropDownVisible(false);
        fetchProductsByCategory(categoryName);
    };

    // Handle quantity range change
    const handleQuantityRangeChange = (e) => {
        const { name, value } = e.target;
        setQuantityRange((prevRange) => ({
            ...prevRange,
            [name]: value === "" ? (name === "min" ? 0 : Infinity) : parseFloat(value), // Use parseFloat for decimals
        }));
    };

    // Handle additional product search input (if needed)
    const handleSearchTermChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filter products based on quantity range and search term
    const filteredProducts = products.filter((product) => {
        const matchesQuantity =
            product.stockQuantity >= (quantityRange.min || 0) &&
            product.stockQuantity <= (quantityRange.max || Infinity);
        const matchesSearchTerm =
            searchTerm === "" ||
            product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.productId.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesQuantity && matchesSearchTerm;
    });

    return (
        <div className="manage-products-container-stock-by-category">
            {/* Controls */}
            <div className="controls-container-stock-by-category">
                {/* Category Search */}
                <div className="form-group-stock-by-category">
                    <label htmlFor="categorySearch">Enter Stock Category</label>
                    <input
                        id="categorySearch"
                        type="text"
                        value={selectedCategory}
                        onChange={handleCategorySearch}
                        placeholder="Type to search categories"
                        onBlur={() => setTimeout(() => setCategoryDropDownVisible(false), 200)}
                        onFocus={() => setCategoryDropDownVisible(true)}
                        autoComplete="off"
                    />
                    {isCategoryDropDownVisible && filteredCategoryList.length > 0 && (
                        <ul className="dropdown-list-stock-by-category">
                            {filteredCategoryList.map((category) => (
                                <li key={category.category_id} onClick={() => handleCategorySelect(category.name)}>
                                    {category.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Quantity Range Filter */}
                <div className="quantity-range-container-stock-by-category">
                    <label>Quantity Range</label>
                    <input
                        type="number"
                        name="min"
                        placeholder="Min"
                        value={quantityRange.min === 0 ? "" : quantityRange.min}
                        onChange={handleQuantityRangeChange}
                        min="0"
                        step="0.0001" // Allow decimals
                    />
                    <input
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
                ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <div className="product-card-stock-by-category" key={product.productId}>
                            <img
                                src={
                                    product.imageLink
                                        ? (isExternalURL(product.imageLink) ? product.imageLink : `${apiBaseUrl}/${product.imageLink}`)
                                        : "/images/placeholder.jpg" // Adjust path if necessary
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
                                <p>Unit: {product.selectedUnit}</p>
                                <p>MRP: {product.mrpPrice} RS</p>
                                <p>Stock: {product.stockQuantity}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No products found for the selected category.</p>
                )}
            </div>
        </div>
    );
}

// Remove the unused 'store' prop validation
// If you plan to use 'store', implement its functionality accordingly
StockCategory.propTypes = {
    // store: PropTypes.string.isRequired, // Commented out or remove
};
