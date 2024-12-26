import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import PropTypes from "prop-types";
import "../css1/StockSupplier.css"; // Assuming CSS file for styling

export default function StockSupplier() {
    const [products, setProducts] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState("");
    const [filteredSupplierList, setFilteredSupplierList] = useState([]);
    const [isSupplierDropDownVisible, setSupplierDropDownVisible] = useState(false);
    const [quantityRange, setQuantityRange] = useState({ min: 0, max: 0 });
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(10);

    // Fetch suppliers based on search input
    const fetchSuppliers = async (searchTerm = "") => {
        try {
            const response = await axios.get("http://localhost:5000/api/suppliers/get_suppliers_stock", {
                params: { searchTerm },
            });
            setFilteredSupplierList(response.data);
        } catch (error) {
            console.error("Error fetching suppliers:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error fetching suppliers",
            });
        }
    };

    useEffect(() => {
        fetchSuppliers(); // Initial load without a search term
    }, []);

    // Fetch products related to the selected supplier only
    const fetchProductsBySupplier = async (supplierName) => {
        try {
            const response = await axios.get("http://localhost:5000/api/products/fetch_products_by_supplier", {
                params: { supplier: supplierName },
            });
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

    // Handle supplier search on user input
    const handleSupplierSearch = (e) => {
        const searchTerm = e.target.value;
        setSelectedSupplier(searchTerm);
        fetchSuppliers(searchTerm); // Fetch suppliers based on input search term
        setSupplierDropDownVisible(true); // Show dropdown
    };

    // Handle selection of supplier to fetch and display related products
    const handleSupplierSelect = (supplierName) => {
        setSelectedSupplier(supplierName);
        setSupplierDropDownVisible(false); // Hide dropdown after selection
        fetchProductsBySupplier(supplierName); // Fetch products for selected supplier
    };

    // Filter products based on quantity range only
    const filteredProducts = products.filter((product) => {
        const isQuantityMatch =
            (quantityRange.min === 0 && quantityRange.max === 0) ||
            (product.stockQuantity >= quantityRange.min && product.stockQuantity <= quantityRange.max);
        return isQuantityMatch;
    });

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

    const handleQuantityRangeChange = (event) => {
        const { name, value } = event.target;
        setQuantityRange((prevRange) => ({
            ...prevRange,
            [name]: Number(value),
        }));
    };

    return (
        <div className="manage-products-stock-by-category" id="manage_stock_background">
            {/* Search and quantity controls */}
            <div className="controls-container-stock-by-category">
                <div className="form-group-stock-by-category">
                    <label htmlFor="selectedSupplier">Enter Supplier Name</label>
                    <input
                        id="supplier_text_input-stock-by-category"
                        type="text"
                        value={selectedSupplier}
                        onChange={handleSupplierSearch}
                        placeholder="Type to search suppliers"
                        onBlur={() => setTimeout(() => setSupplierDropDownVisible(false), 200)}
                        onFocus={() => setSupplierDropDownVisible(true)}
                        autoComplete="off"
                    />
                    {isSupplierDropDownVisible && filteredSupplierList.length > 0 && (
                        <ul className="dropdown-list-stock-by-category">
                            {filteredSupplierList.map((supplier) => (
                                <li
                                    key={supplier.Supid}
                                    onClick={() => handleSupplierSelect(supplier.Supname)}
                                >
                                    {supplier.Supname}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="quantity-range-container-stock-by-category">
                    <label>Quantity Range:</label>
                    <input
                        id="input_quantityrange_one"
                        type="number"
                        name="min"
                        placeholder="Min"
                        value={quantityRange.min}
                        onChange={handleQuantityRangeChange}
                    />
                    <input
                        id="input_quantityrange_two"
                        type="number"
                        name="max"
                        placeholder="Max"
                        value={quantityRange.max}
                        onChange={handleQuantityRangeChange}
                    />
                </div>
            </div>

            {/* Product cards */}
            <div className="product-card-container-stock-by-category">
                {currentProducts.map((product) => (
                    <div className="product-card-stock-by-category" key={product.productId}>
                        <img
                            src={product.imageLink}
                            alt={product.productName}
                            className="product-image-stock-by-category"
                        />
                        <div className="product-info-stock-by-category">
                            <h3>{product.productName}</h3>
                            <p>Supplier: {product.selectedSupplier}</p>
                            <p>Category: {product.selectedCategory}</p>
                            <p>Unit: {product.selectedUnit}</p>
                            <p>MRP: {product.mrpPrice} RS</p>
                            <p>Stock: {product.stockQuantity}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Validate props with PropTypes
StockSupplier.propTypes = {
    store: PropTypes.string.isRequired,
};
