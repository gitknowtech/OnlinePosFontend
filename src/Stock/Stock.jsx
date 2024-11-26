import { useState } from "react";
import "../css/stockMain.css";
import { useLocation } from "react-router-dom";
import StockInModel from "../Stock/StockIn";
import StockOutModel from "../Stock/StockOut";
import StockTransfer from "../Stock/StockTransfer";
import StockTransferMinus from "../Stock/StockTransferMinus";
import StockSupplier from "../Stock/StockSupplier";
import StockCategory from "../Stock/StockCategory";
import StockBatch from "../Stock/StockBatch";

const Stock = () => {
  const location = useLocation();

  // Ensure location.state exists and destructure UserName and Store
  const { UserName = "Default User", Store = "Default Store" } = location.state || {};

  // Set default active content to "stockin" to load Stock In by default
  const [activeContent, setActiveContent] = useState("stockin");

  // Define toggle functions for each stock section
  const toggleStockInmodel = () => setActiveContent("stockin");
  const toggleStockOutmodel = () => setActiveContent("stockout");
  const toggleStocktransferModel = () => setActiveContent("stocktransfer");
  const toggleStockTransferminus = () => setActiveContent("StockTransferMinus");
  const toggleStockSupplier = () => setActiveContent("StockSupplier");
  const toggleStockCategory = () => setActiveContent("StockCategory");
  const toggleStockBatch = () => setActiveContent("StockBatch");

  return (
    <div className="stock-panel">
      {/* Display User Info */}
      <div className="user-info-panel" style={{ display: "none" }}>
        <p><strong>User: </strong>{UserName}</p>
        <p><strong>Store: </strong>{Store}</p>
      </div>

      {/* Button List */}
      <div className="button-list">
        <button
          onClick={toggleStockInmodel}
          className={activeContent === "stockin" ? "active-button" : ""}
        >
          Stock In
        </button>
        <button
          onClick={toggleStockOutmodel}
          className={activeContent === "stockout" ? "active-button" : ""}
        >
          Stock Out
        </button>
        <button
          onClick={toggleStocktransferModel}
          className={activeContent === "stocktransfer" ? "active-button" : ""}
        >
          Get Stock from Other
        </button>
        <button
          onClick={toggleStockTransferminus}
          className={activeContent === "StockTransferMinus" ? "active-button" : ""}
        >
          Transfer Stock for Other
        </button>
        <button
          onClick={toggleStockCategory}
          className={activeContent === "StockCategory" ? "active-button" : ""}
        >
          Stock by Category
        </button>
        <button
          onClick={toggleStockSupplier}
          className={activeContent === "StockSupplier" ? "active-button" : ""}
        >
          Stock by Supplier
        </button>
        <button
          onClick={toggleStockBatch}
          className={activeContent === "StockBatch" ? "active-button" : ""}
        >
          Stock by Batch
        </button>
      </div>

      {/* Product Content */}
      <div className="product-content">
        {activeContent === "stockin" && <StockInModel store={Store} userName={UserName} />}
        {activeContent === "stockout" && <StockOutModel store={Store} userName={UserName} />}
        {activeContent === "stocktransfer" && <StockTransfer store={Store} userName={UserName} />}
        {activeContent === "StockTransferMinus" && <StockTransferMinus store={Store} userName={UserName} />}
        {activeContent === "StockSupplier" && <StockSupplier store={Store} userName={UserName} />}
        {activeContent === "StockCategory" && <StockCategory store={Store} userName={UserName} />}
        {activeContent === "StockBatch" && <StockBatch store={Store} userName={UserName} />}
      </div>
    </div>
  );
};

export default Stock;
