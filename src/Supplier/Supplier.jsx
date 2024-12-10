import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2"; // For access denial alerts
import {
  faCodeFork,
  faDollar,
  faPlus,
  faShoppingBag,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import "../css/SupplierMain.css";
import BankModel from "../Supplier/BankModel";
import AddSupplier from "../Supplier/AddSupplier";
import ManageSupplier from "../Supplier/ManageSupplier";
import ManageSupplierDelete from "../Supplier/ManageSuppliersRemoved";
import CreatePerchasing from "../Supplier/createNewPercheses";
import PurchasingDetails from "../Supplier/PurchasingDetails";
import DueSummery from "../Supplier/DueSummary";
import SupplierPayment from "../Supplier/SupplierPayment";

const Supplier = () => {
  const location = useLocation(); // Get location object
  const { UserName, Store } = location.state || {}; // Default destructuring

  // State to manage active content and access rights
  const [activeContent, setActiveContent] = useState("bank"); // Default to null
  const [accessRights, setAccessRights] = useState({
    SupplierList: false,
    AddSupplier: false,
    SupplierPayment: false,
    ManageBank: false,
    RemovedSuppliers: false,
  });
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch access rights for all sections
  useEffect(() => {
    const fetchAccessRights = async () => {
      try {
        const sections = [
          "SupplierList",
          "AddSupplier",
          "SupplierPayment",
          "ManageBank",
          "RemovedSupplier",
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
        setLoading(false); // Stop loading
      }
    };

    if (UserName) {
      fetchAccessRights();
    }
  }, [UserName]);

  // Handle access check and toggle content
  const handleAccessCheck = (section, toggleFunction) => {
    if (accessRights[section]) {
      toggleFunction(); // Toggle content if access is granted
    } else {
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: "You do not have access to this section. Please request access.",
      });
    }
  };

  // Toggle functions for each content
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

  if (loading) {
    return <div>Loading...</div>; // Show loading state
  }

  return (
    <div className="supplier-panel">
      {/* Display user info */}
      <div className="user-info-panel" style={{ display: "none" }}>
        <p>
          <strong>Username:</strong> {UserName}
        </p>
        <p>
          <strong>Store:</strong> {Store}
        </p>
      </div>

      {/* Button List */}
      <div className="button-list">
        <button onClick={() => handleAccessCheck("SupplierList", togglerManageSupplier)}>
          <FontAwesomeIcon className="button-icon" icon={faCodeFork} />
          Supplier List
        </button>
        <button onClick={() => handleAccessCheck("AddSupplier", toggleSupplierModel)}>
          <FontAwesomeIcon className="button-icon" icon={faPlus} />
          Add New Supplier
        </button>
        <button onClick={() => handleAccessCheck("SupplierPayment", togglerManageSupplierPayment)}>
          <FontAwesomeIcon className="button-icon" icon={faDollar} />
          Supplier Payment
        </button>
        <button onClick={() => handleAccessCheck("ManageBank", toggleBankModel)}>
          <FontAwesomeIcon className="button-icon" icon={faShoppingBag} />
          Manage Bank
        </button>
        <button onClick={() => handleAccessCheck("RemovedSupplier", togglerManageSupplierDelete)}>
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
