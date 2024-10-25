import "../css1/StockIn.css";
import PropTypes from "prop-types";
import { useState, useRef } from "react";
import axios from "axios";
import Swal from 'sweetalert2';

export default function StockIn({ store }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [debounceTimeout, setDebounceTimeout] = useState(null);
    const [quanity , setQuantity] = useState("");
    const [productDetails, setProductDetails] = useState({
        barcode: "N/A",
        productId: "N/A",
        productName: "N/A",  // Correct case for `productName`
        totalIn: "N/A",
        totalOut: "N/A",
        balanceQty: "N/A",
    });

    const inputRef = useRef(null);

    const handleFetchProductDetails = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/products/fetch_products_barcode", {
                params: {
                    searchTerm: searchQuery, // Searching using the barcode entered
                    store: store,
                },
            });

            if (response.data.length > 0) {
                const product = response.data[0];
                setProductDetails({
                    barcode: product.barcode || "N/A",
                    productId: product.productId || "N/A",
                    productName: product.productName || "N/A",  // Use correct field name `productName`
                    totalIn: product.totalIn || "N/A",
                    totalOut: product.totalOut || "N/A",  // Correct casing for `totalOut`
                    balanceQty: product.balanceQty || "N/A",
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Product Found!',
                    text: `Product ID: ${product.productId} - ${product.productName}`,
                    timer: 2000,
                    showConfirmButton: true,
                });
            } else {
                // No product found with the entered barcode
                Swal.fire({
                    icon: 'error',
                    title: 'Product Not Found',
                    text: "No product found with this barcode.",
                    showCloseButton: true,
                });
                setProductDetails({
                    barcode: "N/A",
                    productId: "N/A",
                    productName: "N/A",
                    totalIn: "N/A",
                    totalOut: "N/A",
                    balanceQty: "N/A",
                });
            }
        } catch (err) {
            console.error("Error fetching product details:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error Fetching Product',
                text: 'There was an error fetching the product details. Please try again later.',
                showcloseButton: true ,
            });
            // Reset to default on error
            setProductDetails({
                barcode: "N/A",
                productId: "N/A",
                productName: "N/A",
                totalIn: "N/A",
                totalOut: "N/A",
                balanceQty: "N/A",
            });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleFetchProductDetails(); // Trigger fetch when Enter is pressed
        }
    }

    const handleUpdateStock = async () => {
        const { productId, productName, barcode } = productDetails;
    
        if (!productId || productId === "N/A") {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Product',
                text: 'Please search for a valid product before updating stock.',
                showCloseButton: true,
            });
            return;
        }
    
        const parsedQuantity = parseFloat(quanity).toFixed(4); // Convert to 4 decimal places
    
        if (!parsedQuantity || isNaN(parsedQuantity) || parsedQuantity <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Quantity',
                text: 'Please enter a valid decimal quantity.',
                showCloseButton: true,
            });
            return;
        }
    
        try {
            const response = await axios.post("http://localhost:5000/api/products/update_stock", {
                productId,
                productName,
                barcode,
                quantity: parsedQuantity, // Send parsed decimal quantity
            });
    
            Swal.fire({
                icon: 'success',
                title: 'Stock Updated',
                text: response.data.message,
                showConfirmButton: true,
            });
    
            // Reset quantity input
            setQuantity("");
            // Refresh product details to show updated quantity if necessary
            handleFetchProductDetails();
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error Updating Stock',
                text: 'There was an error updating the stock. Please try again later.',
            });
            console.error("Error updating stock:", err);
        }
    };
    

  
    // Function to handle live search when typing
    const handleLiveSearch = async (query) => {
        if (!query) {
            setSearchResults([]); // Clear results if query is empty
            return;
        }

        try {
            const response = await axios.get("http://localhost:5000/api/products/fetch_products", {
                params: {
                    searchTerm: query,
                    store: store, // Pass the store in the query if needed
                },
            });

            if (response.data.length > 0) {
                setSearchResults(response.data); // Display all results
            } else {
                setSearchResults([]); // No products found
            }
        } catch (err) {
            console.error("Error fetching products:", err);
        }
    };

    // Debounced search on input change
    const handleSearchInputChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        // Clear previous debounce timeout
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        // Set a new debounce timeout
        setDebounceTimeout(
            setTimeout(() => {
                handleLiveSearch(query); // Call the live search function after 500ms
            }, 300) // Delay the API call by 300ms for a responsive search
        );
    };

    // When user clicks on an item from the dropdown
    const handleSelectProduct = (product) => {
        setSearchQuery(product.barcode); // Set the searchQuery to the product's barcode
        setSearchResults([]); // Clear the search results once a selection is made

        // Focus on the input field into barcode
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.setSelectionRange(
                product.barcode.length, // Start of the selection
                product.barcode.length // End of the selection
            );
        }
    };

    return (
        <div className="stock-container">
            {/* Left Side: Stock Update Form */}
            <div className="stock-left-panel">
                <h2>Update Stock<hr /></h2>
                <div className="stock-form">
                    <input
                        type="text"
                        ref={inputRef}
                        placeholder="Scan Barcode or Enter Product Code, Name"
                        className="input-field"
                        value={searchQuery}
                        onChange={handleSearchInputChange} // Live search on input change
                        onKeyDown={handleKeyDown} // Detect the enter key press
                    />

                    {/* Display dropdown of search results if there are any */}
                    {searchResults.length > 0 && (
                        <div className="dropdown">
                            {searchResults.map((product) => (
                                <div
                                    key={product.productId}
                                    className="dropdown-item"
                                    onClick={() => handleSelectProduct(product)}
                                >
                                    <strong>{product.productId}</strong> - {product.productName} - {product.barcode}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="details">
                        <br />
                        <p><strong>Barcode      :</strong> {productDetails.barcode}</p>
                        <p><strong>Product ID   :</strong> {productDetails.productId} </p>
                        <p><strong>Product Name :</strong> {productDetails.productName} </p>
                        <br />
                        <hr />
                        <br />
                        <p><strong>Total In     :</strong> {productDetails.totalIn}</p>
                        <p><strong>Total Out    :</strong> {productDetails.totalOut} </p>
                        <p><strong>Balance QTY  :</strong> {productDetails.balanceQty}</p>
                        <br />
                        <hr />
                    </div>
                    <br/>
                    <div className="update-controls">
                        {/* Display Store Name */}
                        <div className="store-display">
                            <label id="store-label"><strong>Store: </strong>{store}</label>
                        <input id="update_input" type="text" placeholder="Qty" />
                        <button id="update-button" onClick={handleUpdateStock}>Update</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Stock Update History */}
            <div className="stock-right-panel">
                <h3>Last 50 Record Stock Summary</h3>
                <table className="summary-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Info</th>
                            <th>QTY</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Example history data (you can fetch real data from your backend) */}
                        <tr>
                            <td>2023-10-25 12:00</td>
                            <td>Product ID: 100001 - A4 Paper</td>
                            <td>20</td>
                            <td>Stock In</td>
                        </tr>
                        <tr>
                            <td>2023-10-24 14:30</td>
                            <td>Product ID: 100002 - Oil Filter</td>
                            <td>10</td>
                            <td>Stock Out</td>
                        </tr>
                    </tbody>
                </table>

                <h3>Badge Wise Available Qty</h3>
                <table className="badge-table">
                    <thead>
                        <tr>
                            <th>Badge</th>
                            <th>Create Time</th>
                            <th>MRP</th>
                            <th>Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Example badge data */}
                        <tr>
                            <td>Badge001</td>
                            <td>2023-10-20</td>
                            <td>$10</td>
                            <td>50</td>
                        </tr>
                        <tr>
                            <td>Badge002</td>
                            <td>2023-10-21</td>
                            <td>$15</td>
                            <td>30</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Validate props with PropTypes
StockIn.propTypes = {
    store: PropTypes.string.isRequired,
};
