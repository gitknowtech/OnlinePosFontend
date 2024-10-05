import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../css/AddProducts.css"; // Assuming a separate CSS file for AddProducts

export default function AddProducts({ UserName, store }) {
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [productNameSinhala, setProductNameSinhala] = useState("");
  const [cabinNumber, setCabinNumber] = useState("");
  const [barcode, setBarcode] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [manufacturingDate, setManufacturingDate] = useState(new Date());
  const [expiringDate, setExpiringDate] = useState(new Date());
  const [costPrice, setCostPrice] = useState("");
  const [mrpPrice, setMrpPrice] = useState("");
  const [profitPercentage, setProfitPercentage] = useState("");
  const [profitAmount, setProfitAmount] = useState("");
  const [filteredSupplierList, setFilteredSupplierList] = useState([]);
  const [filteredCategoryList, setFilteredCategoryList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredUnitList, setFilteredUnitList] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [storeValues, setStoreValues] = useState({});
  const [discountPrice, setDiscountPrice] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [wholesalePercentage, setWholesalePercentage] = useState("");
  const [lockedPrice, setLockedPrice] = useState("");
  const [availableStock, setAvailableStock] = useState("");
  const [supplierList, setSupplierList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [realPrice, setRealPrice] = useState(0);
  const [realWholesalePrice, setRealWholesalePrice] = useState(0);
  const [stockAlert, setStockAlert] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [storeList, setStoreList] = useState([]);
  const [saveStoreAsAll, setSaveStoreAsAll] = useState(false);

  // Fetch supplier, category, and unit data when the component mounts
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const supplierResponse = await axios.get(
          "http://localhost:5000/api/get_suppliers"
        );
        console.log("Suppliers data:", supplierResponse.data); // Log fetched data
        setSupplierList(supplierResponse.data);
      } catch (error) {
        console.error("Error fetching suppliers: ", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch suppliers. Please try again later.",
        });
      }
    };

    const fetchCategories = async () => {
      try {
        const categoryResponse = await axios.get(
          "http://localhost:5000/api/get_categories"
        );
        console.log("Categories data:", categoryResponse.data); // Log fetched data
        setCategoryList(categoryResponse.data);
      } catch (error) {
        console.error("Error fetching categories: ", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch categories. Please try again later.",
        });
      }
    };

    const fetchUnits = async () => {
      try {
        const unitResponse = await axios.get(
          "http://localhost:5000/api/get_units"
        );
        console.log("Units data:", unitResponse.data); // Log fetched data
        setUnitList(unitResponse.data);
      } catch (error) {
        console.error("Error fetching units: ", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch units. Please try again later.",
        });
      }
    };

    const fetchStores = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/get_stores"
        );
        setStoreList(response.data);
      } catch (error) {
        console.error("Error fetching stores: ", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch stores. Please try again later.",
        });
      }
    };

    fetchStores();
    fetchSuppliers();
    fetchCategories();
    fetchUnits();
  }, []);

  // Handle supplier search
  const handleSupplierSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setFilteredSupplierList(
      supplierList.filter((supplier) =>
        supplier.Supname.toLowerCase().includes(searchTerm)
      )
    );
    setSelectedSupplier(e.target.value);
  };

  // Handle category search
  const handleCategorySearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setFilteredCategoryList(
      categoryList.filter((category) =>
        category.catName.toLowerCase().includes(searchTerm)
      )
    );
    setSelectedCategory(e.target.value);
  };

  // Handle unit search
  const handleUnitSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setFilteredUnitList(
      unitList.filter((unit) =>
        unit.unitName.toLowerCase().includes(searchTerm)
      )
    );
    setSelectedUnit(e.target.value);
  };

  // Handle store values change
  const handleStoreValuesChange = (storeName, field, value) => {
    setStoreValues((prev) => ({
      ...prev,
      [storeName]: {
        ...prev[storeName],
        [field]: value,
      },
    }));
  };

  //calculate profit pecentage and profit price
  const calculateProfit = () => {
    if (costPrice && mrpPrice) {
      const profiAmount = Math.round(mrpPrice - costPrice);
      const profitPercentage = Math.round((profiAmount / costPrice) * 100);
      setProfitAmount(profiAmount);
      setProfitPercentage(profitPercentage.toFixed(2));
    } else {
      setProfitAmount(0);
      setProfitPercentage(0);
    }
  };

  //calculate discount pecentage and discount price
  const calculateDiscountFromPercentage = () => {
    if (mrpPrice && discountPercentage) {
      const discountPrice = Math.round((mrpPrice * discountPercentage) / 100);
      setDiscountPrice(discountPrice.toFixed(2)); //round to 2 decimal places
      const realPrice = Math.round(mrpPrice - discountPrice);
      setRealPrice(realPrice.toFixed(2)); //round to 2 decimal places
    }
  };

  //calculate wholesale from price
  const calculateWholesaleFromPrice = () => {
    if (mrpPrice && wholesalePrice) {
      const wholesalePercentage = Math.round((wholesalePrice / mrpPrice) * 100);
      setWholesalePercentage(wholesalePercentage.toFixed(2)); //round to 2 decimal places
      const realWholesalePrice = Math.round(mrpPrice - wholesalePrice);
      setRealWholesalePrice(realWholesalePrice.toFixed(2)); //round to 2 decimal places
    }
  };

  //calculate discount pecentage and discount price
  const calculateWholesaleFromPercentage = () => {
    if (mrpPrice && wholesalePercentage) {
      const wholesalePrice = Math.round((mrpPrice * wholesalePercentage) / 100);
      setWholesalePrice(wholesalePrice.toFixed(2)); //round to 2 decimal places
      const realWholesalePrice = Math.round(mrpPrice - wholesalePrice);
      setRealWholesalePrice(realWholesalePrice.toFixed(2)); //round to 2 decimal places
    }
  };

  //calculate discount from price
  const calculateDiscountFromPrice = () => {
    if (mrpPrice && discountPrice) {
      const discountPercentage = Math.round((discountPrice / mrpPrice) * 100);
      setDiscountPercentage(discountPercentage.toFixed(2)); //round to 2 decimal places
      const realPrice = Math.round(mrpPrice - discountPrice);
      setRealPrice(realPrice.toFixed(2)); //round to 2 decimal places
    }
  };

  const validatePrice = (field, value) => {
    if (mrpPrice && value > mrpPrice) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Discount Price cannot be greater than Market Price!",
      });

      //reset the field value
      if (field === "Cost Price") setCostPrice(0);
      if (field === "Discount Price") setDiscountPrice(0);
      if (field === "Wholesale Price") setWholesalePrice(0);
      if (field === "Locked Price") setLockedPrice(0);
    }
  };

  const handleWholesaleBlur = () => {
    calculateWholesaleFromPrice(); // This is your original calculation logic
    validatePrice('Wholesale Price', wholesalePrice); 
  }

  const handleDiscountBlur = () => {
    calculateDiscountFromPrice(); // This is your original calculation logic
    validatePrice('Discount Price', discountPrice); 
  }


  // Auto-generate barcode with 5 digits
  const generateBarcode = () => {
    const newBarcode = `0000${Math.floor(Math.random() * 100000)}`.slice(-5);
    setBarcode(newBarcode);
  };

  // Form validation
  const validateFormData = () => {
    if (productId.trim() === "" || productName.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Product ID and Product Name are required!",
      });
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSave = async () => {
    if (!validateFormData()) return;

    const productData = {
      productId,
      productName,
      productNameSinhala,
      barcode,
      batchNumber,
      selectedSupplier,
      selectedCategory,
      selectedUnit,
      manufacturingDate,
      expiringDate,
      costPrice,
      mrpPrice,
      profitPercentage,
      profitAmount,
      discountPrice,
      discountPercentage,
      wholesalePrice,
      wholesalePercentage,
      lockedPrice,
      availableStock,
      user: UserName,
      store: saveStoreAsAll ? "all" : store,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/create_product",
        productData
      );
      if (response.status === 201) {
        resetFormFields();
        Swal.fire({
          icon: "success",
          title: "Product Added",
          text: "Product has been added successfully!",
        });
      } else {
        throw new Error("Failed to save product");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Error saving product: ${error.message}`,
      });
    }
  };

  // Reset form fields after submission
  const resetFormFields = () => {
    setProductId("");
    setProductName("");
    setProductNameSinhala("");
    setBarcode("");
    setBatchNumber("");
    setSelectedSupplier("");
    setSelectedCategory("");
    setSelectedUnit("");
    setManufacturingDate(new Date());
    setExpiringDate(new Date());
    setCostPrice("");
    setMrpPrice("");
    setProfitPercentage("");
    setProfitAmount("");
    setDiscountPrice("");
    setDiscountPercentage("");
    setWholesalePrice("");
    setWholesalePercentage("");
    setLockedPrice("");
    setAvailableStock("");
    setSaveStoreAsAll(false);
  };

  return (
    <div className="add-product-model">
      <h2>Product Details</h2>
      <div className="check-box">
        <input
          type="checkbox"
          checked={saveStoreAsAll}
          onChange={(e) => setSaveStoreAsAll(e.target.checked)}
        />
        <label>All Store</label>
      </div>
      <div className="add-product-form">
        <div className="form-group">
          <label htmlFor="productId">Product ID</label>
          <input
            type="text"
            id="productId"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Enter Product ID"
          />
        </div>

        <div className="form-group">
          <label htmlFor="productName">Product Name</label>
          <input
            type="text"
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Enter Product Name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="productNameSinhala">Product Name (Sinhala)</label>
          <input
            type="text"
            id="productNameSinhala"
            value={productNameSinhala}
            onChange={(e) => setProductNameSinhala(e.target.value)}
            placeholder="Enter Product Name in Sinhala"
          />
        </div>

        <div className="form-group">
          <label htmlFor="barcode">Barcode</label>
          <input type="text" id="barcode" value={barcode} readOnly />
        </div>


        <div className="form-group option">
          <button type="button" onClick={generateBarcode}>
            Auto Generate
          </button>
        </div>

        

        <div className="form-group">
          <label htmlFor="cabinNumber">Cabin Number (Raakka)</label>
          <input
            type="text"
            id="cabinNumber" value={cabinNumber}
            onChange={(e) => setCabinNumber(e.target.value)}
            placeholder="Enter Cabin Numnber of The Product"
          />
        </div>

        <h2>Supplier and Other Details</h2>
        <div className="form-group">
          <label htmlFor="selectedSupplier">Supplier</label>
          <input
            type="text"
            value={selectedSupplier}
            onChange={handleSupplierSearch}
            placeholder="Type to search suppliers"
          />
          <ul className="dropdown-list">
            {filteredSupplierList.map((supplier) => (
              <li
                key={supplier.id}
                onClick={() => setSelectedSupplier(supplier.Supname)}
              >
                {supplier.Supname}
              </li>
            ))}
          </ul>
        </div>

        <div className="form-group">
          <label htmlFor="selectedCategory">Category</label>
          <input
            type="text"
            value={selectedCategory}
            onChange={handleCategorySearch}
            placeholder="Type to search categories"
          />
          <ul className="dropdown-list">
            {filteredCategoryList.map((category) => (
              <li
                key={category.id}
                onClick={() => setSelectedCategory(category.catName)}
              >
                {category.catName}
              </li>
            ))}
          </ul>
        </div>

        <div className="form-group">
          <label htmlFor="selectedUnit">Units</label>
          <input
            type="text"
            value={selectedUnit}
            onChange={handleUnitSearch}
            placeholder="Type to search units"
          />
          <ul className="dropdown-list">
            {filteredUnitList.map((unit) => (
              <li key={unit.id} onClick={() => setSelectedUnit(unit.unitName)}>
                {unit.unitName}
              </li>
            ))}
          </ul>
        </div>

        <div className="form-group">
          <label htmlFor="manufacturingDate">Manufacturing Date</label>
          <DatePicker
            selected={manufacturingDate}
            onChange={(date) => setManufacturingDate(date)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="expiringDate">Expiring Date</label>
          <DatePicker
            selected={expiringDate}
            onChange={(date) => setExpiringDate(date)}
          />
        </div>

        <h2>Product Price Details</h2>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="costPrice">Cost Price</label>
            <input
              type="number"
              id="costPrice"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              onBlur={calculateProfit}
              placeholder="Enter Cost Price"
            />
          </div>

          <div className="form-group">
            <label htmlFor="mrpPrice">MRP Price</label>
            <input
              type="number"
              id="mrpPrice"
              value={mrpPrice}
              onChange={(e) => setMrpPrice(e.target.value)} // Only set value on change
              onBlur={calculateProfit} // Calculate when user leaves the field
              placeholder="Enter MRP Price"
            />
          </div>

          <div className="form-group">
            <label htmlFor="profitPercentage">Profit Percentage</label>
            <input
              type="number"
              id="profitPercentage"
              value={profitPercentage}
              onChange={(e) => setProfitPercentage(e.target.value)}
              placeholder="Enter Profit Percentage"
            />
          </div>

          <div className="form-group">
            <label htmlFor="profitAmount">Profit Amount</label>
            <input
              type="number"
              id="profitAmount"
              value={profitAmount}
              onChange={(e) => setProfitAmount(e.target.value)}
              placeholder="Enter Profit Amount"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="discountPercentage">Discount Percentage</label>
            <input
              type="number"
              id="discountPercentage"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
              onBlur={calculateDiscountFromPercentage}
              placeholder="Enter Discount Percentage"
            />
          </div>

          <div className="form-group">
            <label htmlFor="discountPrice">Discount Price</label>
            <input
              type="number"
              id="discountPrice"
              value={discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value)}
              onBlur={handleDiscountBlur}
              placeholder="Enter Discount Price"
            />

            {discountPrice && realPrice && (
              <span> ({realPrice})</span> // Display real price in parentheses next to the discount price
            )}
          </div>

          <div className="form-group">
            <label htmlFor="wholesalePercentage">Wholesale Percentage</label>
            <input
              type="number"
              id="wholesalePercentage"
              value={wholesalePercentage}
              onChange={(e) => setWholesalePercentage(e.target.value)}
              onBlur={calculateWholesaleFromPercentage}
              placeholder="Enter Wholesale Percentage"
            />
          </div>

          <div className="form-group">
            <label htmlFor="wholesalePrice">Wholesale Price</label>
            <input
              type="number"
              id="wholesalePrice"
              value={wholesalePrice}
              onChange={(e) => setWholesalePrice(e.target.value)}
              onBlur={handleWholesaleBlur}
              placeholder="Enter Wholesale Price"
            />
            {wholesalePrice && realWholesalePrice && (
              <span> ({realWholesalePrice})</span> // Display real price in parentheses next to the discount price
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="lockedPrice">Locked Price</label>
          <input
            type="number"
            id="lockedPrice"
            value={lockedPrice}
            onChange={(e) => setLockedPrice(e.target.value)}
            onBlur={() => validatePrice("Locked Price", lockedPrice)} // Validate locked price on blur
            placeholder="Enter Locked Price"
          />
        </div>

        <div className="form-group">
          <label htmlFor="StockAlert">Stock Alert</label>
          <input
            type="number"
            id="stockAlert"
            value={stockAlert}
            onChange={(e) => setStockAlert(e.target.value)}
            placeholder="Enter Stock Alert Count"
          />
        </div>

        <h2>Stock Details</h2>
        <div className="table-container">
          <div className="locked-stock-container">
            {storeList.map((store) => (
              <div key={store.id} className="form-group">
                <label>{store.storeName}</label>
                <input
                  type="number"
                  value={storeValues[store.storeName]?.stockAlert || ""}
                  onChange={(e) =>
                    handleStoreValuesChange(
                      store.storeName,
                      "stockAlert",
                      e.target.value
                    )
                  }
                  placeholder="Stock Alert"
                />
              </div>
            ))}
          </div>

          <div className="locked-price-container">
            {storeList.map((store) => (
              <div key={store.id} className="form-group">
                <label>{store.storeName}</label>
                <input
                  type="number"
                  value={storeValues[store.storeName]?.lockedPrice || ""}
                  onChange={(e) =>
                    handleStoreValuesChange(
                      store.storeName,
                      "lockedPrice",
                      e.target.value
                    )
                  }
                  placeholder="Locked Price"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="button-group">
        <button className="saveButton" onClick={handleSave}>
          Save Product
        </button>
      </div>
    </div>
  );
}

// Validate props with PropTypes
AddProducts.propTypes = {
  UserName: PropTypes.string.isRequired,
  store: PropTypes.string.isRequired,
};
