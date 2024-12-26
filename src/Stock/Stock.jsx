import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2"; // For access denial alerts
import "../css/stockMain.css";
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

  // State to manage active content and access rights
  const [activeContent, setActiveContent] = useState("StockCategory" );
  const [accessRights, setAccessRights] = useState({
    StockIn: false,
    StockOut: false,
    GetStock: false,
    OutStock: false,
    StockByCategory: false,
    StockBySupplier: false,
    StockByBatch: false,
  });
  const [loading, setLoading] = useState(true);

  // Fetch access rights for all sections
  useEffect(() => {
    const fetchAccessRights = async () => {
      try {
        const sections = [
          "StockIn",
          "StockOut",
          "GetStock",
          "OutStock",
          "StockByCategory",
          "StockBySupplier",
          "StockByBatch",
        ];

        const accessPromises = sections.map((section) =>
          fetch(`http://localhost:5000/api/access/${UserName}/${section}`)
            .then((res) => {
              if (!res.ok) {
                throw new Error(`Failed to fetch access for ${section}`);
              }
              return res.json();
            })
            .then((data) => ({ [section]: data.access }))
            .catch((err) => {
              console.error(err);
              return { [section]: false }; // Default to no access on error
            })
        );

        const accessResults = await Promise.all(accessPromises);
        const accessObject = accessResults.reduce(
          (acc, curr) => ({ ...acc, ...curr }),
          {}
        );

        setAccessRights(accessObject); // Update access rights state
      } catch (error) {
        console.error("Error fetching access rights:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load access rights. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (UserName) {
      fetchAccessRights();
    }
  }, [UserName]);

  // Handle access check and toggle content
  const handleAccessCheck = (section, toggleFunction) => {
    if (accessRights[section]) {
      toggleFunction();
    } else {
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: "You do not have access to this section. Please request access.",
      });
    }
  };

  // Toggle functions for each stock section
  const toggleStockInModel = () => setActiveContent(activeContent === "stockin" ? null : "stockin");
  const toggleStockOutModel = () => setActiveContent(activeContent === "stockout" ? null : "stockout");
  const toggleStockTransferModel = () =>
    setActiveContent(activeContent === "stocktransfer" ? null : "stocktransfer");
  const toggleStockTransferMinus = () =>
    setActiveContent(activeContent === "StockTransferMinus" ? null : "StockTransferMinus");
  const toggleStockSupplier = () =>
    setActiveContent(activeContent === "StockSupplier" ? null : "StockSupplier");
  const toggleStockCategory = () =>
    setActiveContent(activeContent === "StockCategory" ? null : "StockCategory");
  const toggleStockBatch = () =>
    setActiveContent(activeContent === "StockBatch" ? null : "StockBatch");

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="stock-panel">
      {/* Display User Info */}
      <div className="user-info-panel" style={{ display: "none" }}>
        <p>
          <strong>User: </strong>
          {UserName}
        </p>
        <p>
          <strong>Store: </strong>
          {Store}
        </p>
      </div>

      {/* Button List */}
      <div className="button-list">
        <button onClick={() => handleAccessCheck("StockIn", toggleStockInModel)}>
          Stock In
        </button>
        <button onClick={() => handleAccessCheck("StockOut", toggleStockOutModel)}>
          Stock Out
        </button>
        <button onClick={() => handleAccessCheck("GetStock", toggleStockTransferModel)}>
          Get Stock from Other
        </button>
        <button onClick={() => handleAccessCheck("OutStock", toggleStockTransferMinus)}>
          Transfer Stock for Other
        </button>
        <button onClick={() => handleAccessCheck("StockByCategory", toggleStockCategory)}>
          Stock by Category
        </button>
        <button onClick={() => handleAccessCheck("StockBySupplier", toggleStockSupplier)}>
          Stock by Supplier
        </button>
        <button onClick={() => handleAccessCheck("StockByBatch", toggleStockBatch)}>
          Stock by Batch
        </button>
      </div>

      {/* Product Content */}
      <div className="product-content">
        {activeContent === "stockin" && <StockInModel store={Store} userName={UserName} />}
        {activeContent === "stockout" && <StockOutModel store={Store} userName={UserName} />}
        {activeContent === "stocktransfer" && <StockTransfer store={Store} userName={UserName} />}
        {activeContent === "StockTransferMinus" && (
          <StockTransferMinus store={Store} userName={UserName} />
        )}
        {activeContent === "StockSupplier" && <StockSupplier store={Store} userName={UserName} />}
        {activeContent === "StockCategory" && <StockCategory store={Store} userName={UserName} />}
        {activeContent === "StockBatch" && <StockBatch store={Store} userName={UserName} />}
      </div>
    </div>
  );
};

export default Stock;
