import { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation } from "react-router-dom";
import {
  faCodeFork,
  faDollar,
  faPlus,
  faShoppingBag,
  faSnowflake,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import "../css/SupplierMain.css";
import BankModel from "../Supplier/BankModel";
import AddSupplier from '../Supplier/AddSupplier';
import ManageSupplier from '../Supplier/ManageSupplier';
import ManageSupplierDelete from '../Supplier/ManageSuppliersRemoved';




const Supplier = () => {
  const location = useLocation(); // Get location object
  const { UserName, Store } = location.state || {}; // Default destructuring

  const [activeContent, setActiveContent] = useState(null); // Manage active content ('supplier' or 'purchase')

  // Function to toggle the purchasing content
  const togglePurchasingContent = () => {
    setActiveContent(activeContent === "purchasing" ? null : "purchasing"); // Toggle purchasing content
  };

  // Function to toggle the supplier content
  const toggleSupplierContent = () => {
    setActiveContent(activeContent === "supplier" ? null : "supplier"); // Toggle supplier content
  };


  const toggleBankModel = () =>{
    if(activeContent === "bank"){
      setActiveContent(null);
    }else{
      setActiveContent("bank");
    }
  }

  const toggleSupplierModel = () =>{
    if(activeContent === "addSupplier"){
      setActiveContent(null);
    }else{
      setActiveContent("addSupplier");
    }
  }


  const togglerManageSupplier = () => {
    if(activeContent === "manageSupplier"){
      setActiveContent(null);
    }else{
      setActiveContent("manageSupplier");
    }
  }

  const togglerManageSupplierDelete = () => {
    if(activeContent === "manageSupplierDelete"){
      setActiveContent(null);
    }else{
      setActiveContent("manageSupplierDelete");
    }
  }



  return (
    <div className="supplier-panel">
      <h2 className="panel-title">Manage Suppliers</h2>

      {/* Display user info */}
      <div className="user-info-panel">
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
        <button>
          <FontAwesomeIcon className="button-icon" icon={faDollar} />
          Supplier Payment
        </button>
        <button onClick={toggleBankModel}>
          <FontAwesomeIcon className="button-icon" icon={faShoppingBag} />
          Manage Bank
        </button>
        <button onClick={togglePurchasingContent}>
          <FontAwesomeIcon className="button-icon" icon={faCodeFork} />
          Create New Purchase
        </button>
        <button onClick={toggleSupplierContent}>
          <FontAwesomeIcon className="button-icon" icon={faSnowflake} />
          Purchasing Details
        </button>
        <button>
          <FontAwesomeIcon className="button-icon" icon={faSnowflake} />
          Due Summary
        </button>
        <button id="removed-button" onClick={togglerManageSupplierDelete}>
          <FontAwesomeIcon className="button-icon" icon={faTrash} />
          Removed Suppliers
        </button>
      </div>

      {/* Content area for dynamic supplier or purchase details */}
      <div className="supplier-content">
        {activeContent === "bank" && <BankModel UserName={UserName} store={Store} /> }
        {activeContent === "addSupplier" && <AddSupplier UserName={UserName} store={Store} />}
        {activeContent === "manageSupplier" && <ManageSupplier UserName={UserName} store={Store} />}
        {activeContent === "manageSupplierDelete" && <ManageSupplierDelete UserName={UserName} store={Store}/>};
      </div>
    </div>
  );
};

export default Supplier;
