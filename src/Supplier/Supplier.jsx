import { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation } from "react-router-dom";
import {
  faCodeFork,
  faDollar,
  faPlus,
  faShoppingBag,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import "../css/SupplierMain.css";
import BankModel from "../Supplier/BankModel";
import AddSupplier from '../Supplier/AddSupplier';
import ManageSupplier from '../Supplier/ManageSupplier';
import ManageSupplierDelete from '../Supplier/ManageSuppliersRemoved';
import CreatePerchasing from "../Supplier/createNewPercheses";
import PurchasingDetails from "../Supplier/PurchasingDetails";
import DueSummery from "../Supplier/DueSummary";
import SupplierPayment from "../Supplier/SupplierPayment";

const Supplier = () => {
  const location = useLocation(); // Get location object
  const { UserName, Store } = location.state || {}; // Default destructuring

  // Set default active content to "manageSupplier"
  const [activeContent, setActiveContent] = useState("manageSupplier");

  const toggleBankModel = () => {
    setActiveContent(activeContent === "bank" ? null : "bank");
  };

  const toggleSupplierModel = () => {
    setActiveContent(activeContent === "addSupplier" ? null : "addSupplier");
  };

  const togglerManageSupplier = () => {
    setActiveContent(activeContent === "manageSupplier" ? null : "manageSupplier");
  };

  const togglerManageSupplierDelete = () => {
    setActiveContent(activeContent === "manageSupplierDelete" ? null : "manageSupplierDelete");
  };

  const togglerManageSupplierPayment = () => {
    setActiveContent(activeContent === "SupplierPayment" ? null : "SupplierPayment");
  };

  return (
    <div className="supplier-panel">
      {/* Display user info */}
      <div className="user-info-panel" style={{ display: "none" }}>
        <p><strong>Username:</strong> {UserName}</p>
        <p><strong>Store:</strong> {Store}</p>
      </div>

      <div className="button-list">
        <button onClick={togglerManageSupplier}>
          <FontAwesomeIcon className="button-icon" icon={faCodeFork} />
          Supplier List
        </button>
        <button onClick={toggleSupplierModel}>
          <FontAwesomeIcon className="button-icon" icon={faPlus} />
          Add New Supplier
        </button>
        <button onClick={togglerManageSupplierPayment}>
          <FontAwesomeIcon className="button-icon" icon={faDollar} />
          Supplier Payment
        </button>
        <button onClick={toggleBankModel}>
          <FontAwesomeIcon className="button-icon" icon={faShoppingBag} />
          Manage Bank
        </button>
        <button id="removed-button" onClick={togglerManageSupplierDelete}>
          <FontAwesomeIcon className="button-icon" icon={faTrash} />
          Removed Suppliers
        </button>
      </div>

      {/* Content area for dynamic supplier or purchase details */}
      <div className="supplier-content">
        {activeContent === "bank" && <BankModel UserName={UserName} store={Store} />}
        {activeContent === "addSupplier" && <AddSupplier UserName={UserName} store={Store} />}
        {activeContent === "manageSupplier" && <ManageSupplier UserName={UserName} store={Store} />}
        {activeContent === "manageSupplierDelete" && <ManageSupplierDelete UserName={UserName} store={Store} />}
        {activeContent === "createNewPerches" && <CreatePerchasing UserName={UserName} store={Store} />}
        {activeContent === "purchasingDetails" && <PurchasingDetails UserName={UserName} store={Store} />}
        {activeContent === "DueSummery" && <DueSummery UserName={UserName} store={Store} />}
        {activeContent === "SupplierPayment" && <SupplierPayment UserName={UserName} store={Store} />}
      </div>
    </div>
  );
};

export default Supplier;
