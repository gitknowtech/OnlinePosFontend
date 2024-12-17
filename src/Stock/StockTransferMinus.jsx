import "../css1/StockTransferDown.css"
import PropTypes from "prop-types";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Swal from 'sweetalert2';

export default function StockTransferMinus({ store }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [debounceTimeout, setDebounceTimeout] = useState(null);
    const [quantity, setQuantity] = useState("");
    const [last50Records, setLast50Records] = useState([]);
    const [inputStoreName, setInputStoreName] = useState("");
    const [productDetails, setProductDetails] = useState({
        barcode: "N/A",
        productId: "N/A",
        productName: "N/A",
        totalOut: "N/A",
        stockQuantity: "N/A",
    });
    const [storeOptions, setStoreOptions] = useState([]); // State for stores

    const inputRef = useRef(null);

    // Fetch the last 50 stock out records on component mount
    useEffect(() => {
        const fetchLast50Records = async () => {
            try {
                const response = await axios.get("http://154.26.129.243:5000/api/stock/get_last_50_stock_records_transfer_down");
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
                    totalOut: product.totalOut || "N/A",
                    stockQuantity: product.stockQuantity || "N/A",
                });

                // Fetch related last 50 records for this product
                const relatedRecordsResponse = await axios.get("http://154.26.129.243:5000/api/stock/get_last_50_records_by_product_transfer_down", {
                    params: {
                        productId: product.productId,
                    },
                });
                setLast50Records(relatedRecordsResponse.data.records);
                setProductDetails((prevDetails) => ({
                    ...prevDetails,
                    totalOut: relatedRecordsResponse.data.totalOut,
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
                totalOut: "N/A",
                stockQuantity: "N/A",
            });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleFetchProductDetails(); // Trigger fetch when Enter is pressed
        }
    };

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
            const response = await axios.post("http://154.26.129.243:5000/api/stock/update_stock_transfer_out", {
                productId,
                productName,
                barcode,
                quantity: parsedQuantity,
                store: inputStoreName,
            });

            Swal.fire({
                icon: 'success',
                title: 'Stock Deducted',
                text: response.data.message,
                showConfirmButton: true,
            });

            setQuantity("");
            setInputStoreName("");
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
        <div className="stock-container-transfer-minus">
            <div className="stock-left-panel-transfer-minus">
                <h2>Deduct Stock<hr /></h2>
                <div className="stock-form-transfer-minus">
                    <input
                        type="text"
                        ref={inputRef}
                        placeholder="Scan Barcode or Enter Product Code, Name"
                        className="input-field-transfer-minus"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        onKeyDown={handleKeyDown}
                    />

                    {searchResults.length > 0 && (
                        <div className="dropdown-transfer-minus">
                            {searchResults.map((product) => (
                                <div
                                    key={product.productId}
                                    className="dropdown-item-transfer-minus"
                                    onClick={() => handleSelectProduct(product)}
                                >
                                    <strong>{product.productId}</strong> - {product.productName} - {product.barcode}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="details-transfer-minus">
                        <br />
                        <p><strong>Product ID   : </strong> {productDetails.productId} </p>
                        <p><strong>Product Name : </strong> {productDetails.productName} </p>
                        <p><strong>Barcode      : </strong> {productDetails.barcode}</p>
                        <br />
                        <hr />
                        <br />
                        <p><strong>Total Out : </strong> {productDetails.totalOut}</p>
                        <p><strong>Balance QTY  : </strong> {productDetails.stockQuantity}</p>
                        <br />
                        <hr />
                    </div>
                    <br/>
                    <div className="update-controls-transfer-minus">
                        <div className="store-display-transfer-minus">
                            <label id="store-label-transfer-minus"><strong>Store: </strong>{store}</label>
                            <input
                                id="update_input-transfer-minus"
                                type="text"
                                autoComplete="off"
                                placeholder="Qty"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />

                            {/* Store selection dropdown */}
                            <select
                                id="update_store-transfer-minus"
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


                            <button id="update-button-transfer-minus" onClick={handleUpdateStock}>Update</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="stock-right-panel-transfer-minus">
                <div className="scrollable-table-container-transfer-minus">
                    <table className="summary-table-transfer-minus">
                        <thead>
                            <tr>
                                <th style={{ textAlign: "center" }}>Info</th>
                                <th style={{ textAlign: "center" }}>Qty</th>
                                <th style={{ textAlign: "center" }}>Type</th>
                                <th style={{ textAlign: "center" }}>Store</th>
                                <th style={{ textAlign: "center" }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {last50Records.map((record, index) => (
                                <tr key={index}>
                                    <td>{record.productId} - {record.productName}</td>
                                    <td className="quantity-cell-transfer-minus" style={{ color: "darkred", fontWeight: "1000", textAlign: "center" }}>{record.quantity}</td>
                                    <td className="type-cell-transfer-minus" style={{ color: "darkred", padding: "5px", fontWeight: "1000", textAlign: "center" }}>{record.type}</td>
                                    <td style={{ textAlign: "center" }}>{record.store}</td>
                                    <td>{new Date(record.date).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

StockTransferMinus.propTypes = {
    store: PropTypes.string.isRequired,
};
