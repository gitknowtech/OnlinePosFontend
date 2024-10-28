import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import PropTypes from "prop-types";
import "../css1/StockSupplier.css";

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
        <div className="manage-products-stock-supplier" id="manage_stock_background">
            <div className="controls-container-stock-supplier">
                <div className="form-group-stock-supplier">
                    <label htmlFor="selectedSupplier">Enter Supplier Name</label>
                    <input
                    id="supplier_text_input-stock-supplier"
                        type="text"
                        value={selectedSupplier}
                        onChange={handleSupplierSearch}
                        placeholder="Type to search suppliers"
                        onBlur={() => setTimeout(() => setSupplierDropDownVisible(false), 200)}
                        onFocus={() => setSupplierDropDownVisible(true)}
                    />
                    {isSupplierDropDownVisible && filteredSupplierList.length > 0 && (
                        <ul className="dropdown-list-stock-supplier" style={{fontSize:"10px", fontWeight:"600"}}>
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

                <div className="quantity-range-container-stock-supplier">
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


            {/* Product table */}
            <div className="product-table" id="product_table">
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Product Name</th>
                            <th>Supplier</th>
                            <th>Category</th>
                            <th>Unit</th>
                            <th>MRP</th>
                            <th>Stock</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentProducts.map((product, index) => (
                            <tr key={product.productId}>
                                <td>{indexOfFirstProduct + index + 1}</td>
                                <td>{product.productName}</td>
                                <td>{product.selectedSupplier}</td>
                                <td>{product.selectedCategory}</td>
                                <td>{product.selectedUnit}</td>
                                <td>{product.mrpPrice}</td>
                                <td>{product.stockQuantity}</td>
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
        </div>
    );
}

// Validate props with PropTypes
StockSupplier.propTypes = {
    store: PropTypes.string.isRequired,
};
