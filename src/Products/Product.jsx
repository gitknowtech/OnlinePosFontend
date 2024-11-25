import { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation } from "react-router-dom";
import {
  faBacteria,
  faCodeFork,
  faPlus,
  faSnowflake,
  faStore,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import "../css/ProductsMain.css";
import CategoryModel from "../Products/CategoryModel"; // Import the CategoryModel component
import UnitModel from "../Products/UnitModel";
import AddProducts from "../Products/AddProducts";
import ManageStore from "../Products/StoreModel"; 
import ManageBatch from "../Products/BatchModel";
import ManageProducts from "../Products/ManageProducts";
import ManageProductsRemoved from "../Products/ManageProductsRemoved";
import ManageProductCard from "../Products/ManageProductsCard";

const Product = () => {
  const location = useLocation(); // Get location object
  const { UserName, Store } = location.state || {};

  // Set default active content to "ManageProductsCard"
  const [activeContent, setActiveContent] = useState("ManageProductsCard");

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

  const togglerManagaeStore = () => {
    setActiveContent(activeContent === "manageStore" ? null : "manageStore");
  };

  const togglermanageBatch = () => {
    setActiveContent(activeContent === "manageBatch" ? null : "manageBatch");
  };

  const togglermanageProducts = () => {
    setActiveContent(activeContent === "ManageProducts" ? null : "ManageProducts");
  };

  const togglermanageProductsCard = () => {
    setActiveContent(activeContent === "ManageProductsCard" ? null : "ManageProductsCard");
  };

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
        <button onClick={togglermanageProductsCard}>
          <FontAwesomeIcon className="button-icon" icon={faCodeFork} />
          Product Card
        </button>
        <button onClick={togglermanageProducts}>
          <FontAwesomeIcon className="button-icon" icon={faCodeFork} />
          Product List
        </button>
        <button onClick={togglerAddProductsContent}>
          <FontAwesomeIcon className="button-icon" icon={faPlus} />
          Add Products
        </button>
        <button onClick={togglermanageBatch}>
          <FontAwesomeIcon className="button-icon" icon={faBacteria} />
          Manage Batch
        </button>
        <button onClick={togglerManagaeStore}>
          <FontAwesomeIcon className="button-icon" icon={faStore} />
          Manage Store
        </button>
        <button onClick={toggleUnitContent}>
          <FontAwesomeIcon className="button-icon" icon={faCodeFork} />
          Manage Unit
        </button>
        <button onClick={toggleCategoryContent}>
          <FontAwesomeIcon className="button-icon" icon={faSnowflake} />
          Manage Category
        </button>
        <button id="removed-button" onClick={toggleRemovedProducts}>
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
