import  "../css1/StockTransferUp.css";
import PropTypes from "prop-types";
import { useState, useRef , useEffect} from "react";
import axios from "axios";
import Swal from 'sweetalert2';

export default function StockTransfer({ store }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [debounceTimeout, setDebounceTimeout] = useState(null);
    const [quantity, setQuantity] = useState(""); // Ensure quantity state is used here
    const [last50Records, setLast50Records] = useState([]); // Add this state
    const [inputStoreName, setInputStoreName] = useState(""); // New store name field
    const [productDetails, setProductDetails] = useState({
        barcode: "N/A",
        productId: "N/A",
        productName: "N/A",
        totalIn: "N/A",
        totalOut: "N/A",
        stockQuantity: "N/A",
    });

    const [storeOptions, setStoreOptions] = useState([]); // State for stores
    const inputRef = useRef(null);


     // Fetch the last 50 stock records on component mount
     useEffect(() => {
        const fetchLast50Records = async () => {
            try {
                const response = await axios.get("http://154.26.129.243:5000/api/stock/get_last_50_stock_records_transfer_up");
                setLast50Records(response.data);
            } catch (err) {
                console.error("Error fetching last 50 records:", err);
            }
        };

        const fetchStores = async () => {
            try {
                const response = await axios.get("http://154.26.129.243:5000/api/stores/get_stores");
                setStoreOptions(response.data);
            } catch (err) {
                console.error("Error fetching stores:", err);
            }
        };

        fetchLast50Records();
        fetchStores(); // Fetch stores when component mounts
    }, []);


    const handleFetchProductDetails = async () => {
        try {
            const response = await axios.get("http://154.26.129.243:5000/api/stock/fetch_products_barcode", {
                params: {
                    searchTerm: searchQuery,
                    store: store,
                },
            });

            if (response.data.length > 0) {
                const product = response.data[0];
                setProductDetails({
                    barcode: product.barcode || "N/A",
                    productId: product.productId || "N/A",
                    productName: product.productName || "N/A",
                    totalIn: product.totalIn || "N/A",
                    stockQuantity: product.stockQuantity || "N/A",
                });

                // Fetch related last 50 records for this product
                const relatedRecordsResponse = await axios.get("http://154.26.129.243:5000/api/stock/get_last_50_records_by_product_transfer_up", {
                    params: {
                        productId: product.productId,
                    },
                });
                setLast50Records(relatedRecordsResponse.data.records);
                setProductDetails((prevDetails) => ({
                ...prevDetails,
                totalIn: relatedRecordsResponse.data.totalIn, // Set the fetched totalIn
            }));

                Swal.fire({
                    icon: 'success',
                    title: 'Product Found!',
                    text: `Product ID: ${product.productId} - ${product.productName}`,
                    timer: 2000,
                    showConfirmButton: true,
                });
            } else {
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
                    stockQuantity: "N/A",
                });
            }
        } catch (err) {
            console.error("Error fetching product details:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error Fetching Product',
                text: 'There was an error fetching the product details. Please try again later.',
                showCloseButton: true,
            });
            setProductDetails({
                barcode: "N/A",
                productId: "N/A",
                productName: "N/A",
                totalIn: "N/A",
                totalOut: "N/A",
                stockQuantity: "N/A",
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

        if (!productId || productId === "N/A" || !inputStoreName) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Input',
                text: 'Please search for a valid product and enter a store name before updating stock.',
                showCloseButton: true,
            });
            return;
        }

        const parsedQuantity = parseFloat(parseFloat(quantity).toFixed(4));

        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Quantity',
                text: 'Please enter a valid decimal quantity.',
                showCloseButton: true,
            });
            return;
        }

        try {
            const response = await axios.post("http://154.26.129.243:5000/api/stock/update_stock_transfer", {
                productId,
                productName,
                barcode,
                quantity: parsedQuantity,
                store: inputStoreName, // Pass the store name
            });

            Swal.fire({
                icon: 'success',
                title: 'Stock Updated',
                text: response.data.message,
                showConfirmButton: true,
            });

            setQuantity("");
            setInputStoreName(""); // Clear store input
            handleFetchProductDetails(); // Refresh product details
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error Updating Stock',
                text: 'There was an error updating the stock. Please try again later.',
            });
            console.error("Error updating stock:", err);
        }
    };

    const handleLiveSearch = async (query) => {
        if (!query) {
            setSearchResults([]); // Clear results if query is empty
            return;
        }

        try {
            const response = await axios.get("http://154.26.129.243:5000/api/stock/fetch_products", {
                params: {
                    searchTerm: query,
                    store: store,
                },
            });

            if (response.data.length > 0) {
                setSearchResults(response.data);
            } else {
                setSearchResults([]);
            }
        } catch (err) {
            console.error("Error fetching products:", err);
        }
    };

    const handleSearchInputChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        setDebounceTimeout(
            setTimeout(() => {
                handleLiveSearch(query);
            }, 300)
        );
    };

    const handleSelectProduct = (product) => {
        setSearchQuery(product.barcode);
        setSearchResults([]);

        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.setSelectionRange(
                product.barcode.length,
                product.barcode.length
            );
        }
    };

    return (
        <div className="stock-container-transfer-plus">
            <div className="stock-left-panel-transfer-plus">
                <h2>Update Stock<hr /></h2>
                <div className="stock-form-transfer-plus">
                    <input
                        type="text"
                        ref={inputRef}
                        placeholder="Scan Barcode or Enter Product Code, Name"
                        className="input-field-transfer-plus"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        onKeyDown={handleKeyDown}
                        autoComplete="off"
                    />

                    {searchResults.length > 0 && (
                        <div className="dropdown-transfer-plus">
                            {searchResults.map((product) => (
                                <div
                                    key={product.productId}
                                    className="dropdown-item-transfer-plus"
                                    onClick={() => handleSelectProduct(product)}
                                >
                                    <strong>{product.productId}</strong> - {product.productName} - {product.barcode}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="details-transfer-plus">
                        <br />
                        <p><strong>Product ID   : </strong> {productDetails.productId} </p>
                        <p><strong>Product Name : </strong> {productDetails.productName} </p>
                        <p><strong>Barcode      : </strong> {productDetails.barcode}</p>
                        <br />
                        <hr />
                        <br />
                        <p><strong>Total In : </strong> {productDetails.totalIn}</p>
                        <p><strong>Balance QTY  : </strong> {productDetails.stockQuantity}</p>
                        <br />
                        <hr />
                    </div>
                    <br/>
                    <div className="update-controls-transfer-plus">
                        <div className="store-display-transfer-plus">
                            <label id="store-label-transfer-plus"><strong>Store: </strong>{store}</label>
                            {/* Additional input field for store name */}
                            <input
                                id="update_input-transfer-plus"
                                type="text"
                                placeholder="Qty"
                                autoComplete="off"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)} // Update quantity state on input change
                            />


                            {/* Store selection dropdown */}
                            <select
                                id="update_store-transfer-plus"
                                value={inputStoreName}
                                onChange={(e) => setInputStoreName(e.target.value)}
                            >
                                {!inputStoreName && <option value="">Select Store</option>}
                                {storeOptions.map((store) => (
                                    <option key={store.id} value={store.storeName}>
                                        {store.storeName}
                                    </option>
                                ))}
                            </select>


                            

                            <button id="update-button-transfer-plus" onClick={handleUpdateStock}>Update</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="stock-right-panel-transfer-plus">
                <div className="scrollable-table-container-transfer-plus">
                <table className="summary-table-transfer-plus">
                    <thead>
                        <tr>
                            <th style={{ alignItems: "center", textAlign: "center" }}>Info</th>
                            <th style={{ alignItems: "center", textAlign: "center" }}>Qty</th>
                            <th style={{ alignItems: "center", textAlign: "center" }}>Type</th>
                            <th style={{ alignItems: "center", textAlign: "center" }}>Store</th>
                            <th style={{ alignItems: "center", textAlign: "center" }}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {last50Records.map((record, index) => (
                            <tr key={index}>
                                <td>{record.productId} - {record.productName}</td>
                                <td className="quantity-cell-transfer-plus" style={{ color: "darkgreen", fontWeight: "1000", textAlign: "center" }}>{record.quantity}</td>
                                <td className="type-cell-transfer-plus" style={{ color: "darkgreen", padding: "5px", fontWeight: "1000", textAlign: "center" }}>{record.type}</td>
                                <td style={{ textAlign: "center" }}>{record.store}</td>
                                <td>{new Date(record.date).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>

                <br/>
                {/*<h3>Badge Wise Available Qty</h3>
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
                </table>*/}
            </div>
        </div>
    );
}

// Validate props with PropTypes
StockTransfer.propTypes = {
    store: PropTypes.string.isRequired,
};
