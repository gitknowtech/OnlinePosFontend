import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2"; // SweetAlert2 for alerts
import {
  faBacteria,
  faCodeFork,
  faPlus,
  faSnowflake,
  faStore,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import "../css/ProductsMain.css";
import CategoryModel from "../Products/CategoryModel";
import UnitModel from "../Products/UnitModel";
import AddProducts from "../Products/AddProducts";
import ManageStore from "../Products/StoreModel";
import ManageBatch from "../Products/BatchModel";
import ManageProducts from "../Products/ManageProducts";
import ManageProductsRemoved from "../Products/ManageProductsRemoved";
import ManageProductCard from "../Products/ManageProductsCard";

const Product = () => {
  const location = useLocation();
  const { UserName, Store } = location.state || {};

  // State to manage active content and access rights
  const [activeContent, setActiveContent] = useState("ManageProductsCard"); // Default to null
  const [accessRights, setAccessRights] = useState({
    ProductCard: false,
    ProductList: false,
    AddProduct: false,
    ManageBatch: false,
    ManageUnit: false,
    ManageCategory: false,
    RemovedProducts: false,
  });
  const [loading, setLoading] = useState(true); // Loading state

  // Function to fetch access rights for all sections
  useEffect(() => {
    const fetchAccessRights = async () => {
      try {
        const sections = [
          "ProductCard",
          "ProductList",
          "AddProduct",
          "ManageBatch",
          "ManageStore",
          "ManageUnit",
          "ManageCategory",
          "RemovedProducts",
        ];

        // Fetch access rights for each section
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
  const toggleCategoryContent = () => {
    setActiveContent(activeContent === "category" ? null : "category");
  };

  const toggleRemovedProducts = () => {
    setActiveContent(activeContent === "ManageProductsRemoved" ? null : "ManageProductsRemoved");
  };

  const toggleUnitContent = () => {
    setActiveContent(activeContent === "unit" ? null : "unit");
  };

  const togglerAddProductsContent = () => {
    setActiveContent(activeContent === "addProducts" ? null : "addProducts");
  };

  const togglerManageStore = () => {
    setActiveContent(activeContent === "manageStore" ? null : "manageStore");
  };

  const togglerManageBatch = () => {
    setActiveContent(activeContent === "manageBatch" ? null : "manageBatch");
  };

  const togglerManageProducts = () => {
    setActiveContent(activeContent === "ManageProducts" ? null : "ManageProducts");
  };

  const togglerManageProductsCard = () => {
    setActiveContent(activeContent === "ManageProductsCard" ? null : "ManageProductsCard");
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading state
  }

  return (
    <div className="product-panel">
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
        <button onClick={() => handleAccessCheck("ProductCard", togglerManageProductsCard)}>
          <FontAwesomeIcon className="button-icon" icon={faCodeFork} />
          Product Card
        </button>
        <button onClick={() => handleAccessCheck("ProductList", togglerManageProducts)}>
          <FontAwesomeIcon className="button-icon" icon={faCodeFork} />
          Product List
        </button>
        <button onClick={() => handleAccessCheck("AddProduct", togglerAddProductsContent)}>
          <FontAwesomeIcon className="button-icon" icon={faPlus} />
          Add Products
        </button>
        <button onClick={() => handleAccessCheck("ManageBatch", togglerManageBatch)}>
          <FontAwesomeIcon className="button-icon" icon={faBacteria} />
          Manage Batch
        </button>
        <button onClick={() => handleAccessCheck("ManageStore", togglerManageStore)}>
          <FontAwesomeIcon className="button-icon" icon={faStore} />
          Manage Store
        </button>
        <button onClick={() => handleAccessCheck("ManageUnit", toggleUnitContent)}>
          <FontAwesomeIcon className="button-icon" icon={faCodeFork} />
          Manage Unit
        </button>
        <button onClick={() => handleAccessCheck("ManageCategory", toggleCategoryContent)}>
          <FontAwesomeIcon className="button-icon" icon={faSnowflake} />
          Manage Category
        </button>
        <button onClick={() => handleAccessCheck("RemovedProducts", toggleRemovedProducts)}>
          <FontAwesomeIcon className="button-icon" icon={faTrash} />
          Removed Products
        </button>
      </div>

      {/* Embedded content */}
      <div className="product-content">
        {activeContent === "category" && <CategoryModel UserName={UserName} store={Store} />}
        {activeContent === "unit" && <UnitModel UserName={UserName} store={Store} />}
        {activeContent === "addProducts" && <AddProducts UserName={UserName} store={Store} />}
        {activeContent === "manageStore" && <ManageStore UserName={UserName} store={Store} />}
        {activeContent === "manageBatch" && <ManageBatch UserName={UserName} store={Store} />}
        {activeContent === "ManageProducts" && <ManageProducts UserName={UserName} store={Store} />}
        {activeContent === "ManageProductsRemoved" && <ManageProductsRemoved UserName={UserName} store={Store} />}
        {activeContent === "ManageProductsCard" && <ManageProductCard UserName={UserName} store={Store} />}
      </div>
    </div>
  );
};

export default Product;
