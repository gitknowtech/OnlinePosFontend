import { useState } from "react";
import "../css/stockMain.css";
import { useLocation } from "react-router-dom";
import StockInModel from "../Stock/StockIn";
import StockOutModel from "../Stock/StockOut";
import StockTransfer from "../Stock/StockTransfer";
import StockTransferMinus from "../Stock/StockTransferMinus";
import StockSupplier from "../Stock/StockSupplier";



const Stock = () => {
    const location = useLocation();
    // Ensure location.state exists and destructure UserName and Store
    const { UserName = "Default User", Store = "Default Store" } = location.state || {};
    const [activeContent, setActiveContent] = useState(null);

    const toggleStockInmodel = () => {
        setActiveContent(activeContent === "stockin" ? null : "stockin");
    };

    const toggleStockOutmodel = () => {
        setActiveContent(activeContent === "stockout" ? null : "stockout");
    };

    const toggleStocktransferModel = () => {
        setActiveContent(activeContent === "stocktransfer" ? null : "stocktransfer");
    };

    const toggleStockTransferminus = () => {
        setActiveContent(activeContent === "StockTransferMinus" ? null : "StockTransferMinus");
    };

    const toggleStockSupplier = () => {
        setActiveContent(activeContent === "StockSupplier" ? null : "StockSupplier");
    };

    return (
        <div className="stock-panel">
            {/* Display User Info */}
            <div className="user-info-panel">
                <p><strong>User: </strong>{UserName}</p>
                <p><strong>Store: </strong>{Store}</p>
            </div>

            <div className="button-list">
                <button onClick={toggleStockInmodel}>Stock In</button>
                <button onClick={toggleStockOutmodel}>Stock Out</button>
                <button onClick={toggleStocktransferModel}>Get Stock from Other</button>
                <button onClick={toggleStockTransferminus}>Transfer Stock for Other</button>
                <button>Stock by Category</button>
                <button onClick={toggleStockSupplier}>Stock by Supplier</button>
            </div>

            <div className="product-content">
                {activeContent === "stockin" && <StockInModel store={Store} userName={UserName} />}
                {activeContent === "stockout" && <StockOutModel store={Store} userName={UserName} />}
                {activeContent === "stocktransfer" && <StockTransfer store={Store} userName={UserName} />}
                {activeContent === "StockTransferMinus" && <StockTransferMinus store={Store} userName={UserName} />}
                {activeContent === "StockSupplier" && <StockSupplier store={Store} userName={UserName} />}
            </div>
        </div>
    );
};

export default Stock;
