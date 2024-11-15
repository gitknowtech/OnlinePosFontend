import { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation } from "react-router-dom";
import { faList, faFileInvoice } from "@fortawesome/free-solid-svg-icons";
import "../css/SupplierMain.css";
import InvoiceTable from "./invoiceTable";
import SalesTable from "./salesTable";


const Sales = () => {
  const location = useLocation(); // Get location object
  const { UserName, Store } = location.state || {}; // Default destructuring

  const [activeContent, setActiveContent] = useState(null); // Manage active content ('salesList' or 'invoiceList')

 

  // Toggle Invoice List content
  const toggleInvoiceList = () => {
    setActiveContent(activeContent === "invoiceList" ? null : "invoiceList");
  };

  const toggleSalesList = () => {
    setActiveContent(activeContent === "salesList" ? null : "salesList");
  };

  return (
    <div className="supplier-panel ">
      {/* Display user info */}
      <div className="user-info-panel" style={{display:"none"}} >
        <p><strong>Username:</strong> {UserName}</p>
        <p><strong>Store:</strong> {Store}</p>
      </div>

      {/* Button List */}
      <div className="button-list">
        <button onClick={toggleInvoiceList}>
          <FontAwesomeIcon className="button-icon" icon={faFileInvoice} />
          Invoice List
        </button>
        <button onClick={toggleSalesList}>
          <FontAwesomeIcon className="button-icon" icon={faList} />
          Sales List
        </button>
      </div>

      {/* Content area for dynamic sales or invoice list */}
      <div className="sales-content">
        {activeContent === "invoiceList" && <InvoiceTable UserName={UserName} store={Store} />}
        {activeContent === "salesList" && <SalesTable UserName={UserName} store={Store} />}
      </div>
    </div>
  );
};

export default Sales;
