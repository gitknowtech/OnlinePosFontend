import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import { useRef } from "react";
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
  const [filteredBatchList, setFilteredBatchList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredUnitList, setFilteredUnitList] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedBatch, setselectedBatch] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [wholesalePercentage, setWholesalePercentage] = useState("");
  const [lockedPrice, setLockedPrice] = useState("");
  const [openingBalance, setOpeningBalance] = useState(0);
  const [supplierList, setSupplierList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [realPrice, setRealPrice] = useState(0);
  const [realWholesalePrice, setRealWholesalePrice] = useState(0);
  const [stockAlert, setStockAlert] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [isBatchDropDownVisible, setBatchDropDownVisible] = useState(false);
  const [isSupplierDropDownVisible, setSupplierDropDownVisible] = useState(false);
  const [isCategoryDropDownVisible, setCategoryDropDownVisible] = useState(false);
  const [isUnitDropDownVisible, setUnitDropDownVisible] = useState(false);




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

    const fetchBatches = async () => {
      try {
        const batchresponse = await axios.get(
          "http://localhost:5000/api/get_batches"
        );
        console.log("Batch data:", batchresponse.data); // log fetched data
        setBatchList(batchresponse.data);
      } catch (error) {
        console.error("Error fetching batch data:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch batches. Please try again later.",
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

    fetchBatches();
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

  const handleBatchSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setFilteredBatchList(
      batchList.filter((batch) =>
        batch.batchName.toLowerCase().includes(searchTerm)
      )
    );
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

  const calculateProfit = () => {
    if (costPrice && mrpPrice) {
      // Parse values to ensure they are treated as floats
      const parsedCostPrice = parseFloat(costPrice);
      const parsedMrpPrice = parseFloat(mrpPrice);
  
      // Calculate profit amount and profit percentage with floating-point precision
      const profitAmount = parsedMrpPrice - parsedCostPrice;
      const profitPercentage = (profitAmount / parsedCostPrice) * 100;
  
      // Update state with values rounded to two decimal places
      setProfitAmount(profitAmount.toFixed(2));
      setProfitPercentage(profitPercentage.toFixed(2));
    } else {
      setProfitAmount(0);
      setProfitPercentage(0);
    }
  };
  

  const checkCostGreaterThanMRP = (costPrice, mrpPrice) => {
    if (isNaN(costPrice) || isNaN(mrpPrice)) {
      console.error("Invalid input: costPrice and mrpPrice must be numbers.");
      return;
    }

    if (costPrice < 0 || mrpPrice < 0) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Prices cannot be negative!",
      });
      setCostPrice(0);
      setMrpPrice(0);
      setProfitAmount(0);
      setProfitPercentage(0);
      return;
    }

    if (costPrice > mrpPrice) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Cost Price cannot be greater than Market Price!",
      });
      setCostPrice(0);
      setMrpPrice(0);
      setProfitAmount(0);
      setProfitPercentage(0);
      return;
    }

    calculateProfit();
  };

  const handcostChesking = () => {
    checkCostGreaterThanMRP(parseFloat(costPrice), parseFloat(mrpPrice));
  };

  const calculateDiscountFromPercentage = () => {
    if (mrpPrice && discountPercentage) {
      const discountPrice = Math.round((mrpPrice * discountPercentage) / 100);
      setDiscountPrice(discountPrice.toFixed(2));

      const realPrice = Math.round(mrpPrice - discountPrice);
      setRealPrice(realPrice.toFixed(2));

      if (realPrice > mrpPrice || realPrice < 0) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Discounted Price cannot be greater or Negative than Market Price!",
        });
        setDiscountPrice(0);
        setRealPrice(0);
      }
    }
  };

  const calculateWholesaleFromPercentage = () => {
    if (mrpPrice && wholesalePercentage) {
      const wholesalePrice = Math.round((mrpPrice * wholesalePercentage) / 100);
      setWholesalePrice(wholesalePrice.toFixed(2));

      const realWholesalePrice = Math.round(mrpPrice - wholesalePrice);
      setRealWholesalePrice(realWholesalePrice.toFixed(2));

      if (realWholesalePrice > mrpPrice || realWholesalePrice < 0) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Wholesale Price cannot be greater or negative than Market Price!",
        });
        setWholesalePrice(0);
        setRealWholesalePrice(0);
      }
    }
  };

  const calculateDiscountFromPrice = () => {
    if (mrpPrice && discountPrice) {
      const discountPercentage = Math.round((discountPrice / mrpPrice) * 100);
      setDiscountPercentage(discountPercentage.toFixed(2));

      const realPrice = Math.round(mrpPrice - discountPrice);
      setRealPrice(realPrice.toFixed(2));

      if (realPrice > mrpPrice || realPrice < 0) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Discounted Price cannot be greater or Negative than Market Price!",
        });
        setDiscountPrice(0);
        setRealPrice(0);
      }
    }
  };

  const calculateWholesaleFromPrice = () => {
    if (mrpPrice && wholesalePrice) {
      const wholesalePercentage = Math.round((wholesalePrice / mrpPrice) * 100);
      setWholesalePercentage(wholesalePercentage.toFixed(2));

      const realWholesalePrice = Math.round(mrpPrice - wholesalePrice);
      setRealWholesalePrice(realWholesalePrice.toFixed(2));

      if (realWholesalePrice > mrpPrice || realWholesalePrice < 0) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Wholesale Price cannot be greater or Negative than Market Price!",
        });
        setWholesalePrice(0);
        setRealWholesalePrice(0);
      }
    }
  };

  const handleWholesaleBlur = () => {
    calculateWholesaleFromPrice();
  };

  const handleDiscountBlur = () => {
    calculateDiscountFromPrice();
  };

  const generateBarcode = () => {
    const newBarcode = `0000${Math.floor(Math.random() * 100000)}`.slice(-5);
    setBarcode(newBarcode);
  };


  const productIdInputRef = useRef(null);

  //add validations for the textboxes
  const validateProductId = () => {
    //regular expression to check if the product is exacly 5 digit
    const productidRegx = /^\d{5}$/;
    if(productidRegx.test(productId)){
      Swal.fire({
        icon: "error",
        title: "Invalid Product Id",
        text: "Product id cannot be a 5-digit-number",
      }).then(() => {
        //set focus back to the Product id input field
        if(productIdInputRef.current){
          productIdInputRef.current.focus();
        }
      });
    }
  }


  const handleSave = async () => {
    if (!productId || !productName || !costPrice || !mrpPrice) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Product ID, Product Name, Cost Price, and MRP Price are required fields.",
      });
      return;
    }
  
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
      openingBalance,
      stockAlert,
      user: UserName,
      store,
      status: isActive ? "Active" : "Inactive",
    };
  
    try {
      const response = await axios.post('http://localhost:5000/api/create_product', productData);
      if (response.status === 201) {
        resetFormFields();
        Swal.fire({
          icon: "success",
          title: "Product Added",
          text: "Product has been added successfully!",
        });
      } else {
        throw new Error('Failed to save product');
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Error saving product: ${error.message}`,
      });
    }
  };
  

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
    setOpeningBalance("");
    setStockAlert("");
  };

  return (
    <div className="add-product-model">
      <h2>Product Details</h2>
      <div className="add-product-form">


        <div className="form-group">
          <label htmlFor="productId">Product ID</label>
          <input
            type="text"
            id="productId"
            value={productId}
            ref={productIdInputRef}
            onChange={(e) => setProductId(e.target.value)}
            onBlur={validateProductId}
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
            id="cabinNumber"
            value={cabinNumber}
            onChange={(e) => setCabinNumber(e.target.value)}
            placeholder="Enter Cabin Number of The Product"
          />
        </div>

        <h2>Supplier and Other Details</h2>
        <div className="form-group">
          <label htmlFor="selectedSupplier">Supplier</label>
          <input
            type="text"
            value={selectedSupplier}
            onChange={(e) => {
              setSelectedSupplier(e.target.value); // Update input with user input
              handleSupplierSearch(e); // Filter supplier list
              setSupplierDropDownVisible(true); // Show dropdown while typing
            }}
            placeholder="Type to search suppliers"
            onBlur={() =>
              setTimeout(() => setSupplierDropDownVisible(false), 200)
            }
            onFocus={() => setSupplierDropDownVisible(true)}
          />

          {isSupplierDropDownVisible && filteredSupplierList.length > 0 && (
            <ul className="dropdown-list">
              {filteredSupplierList.map((supplier) => (
                <li
                  key={supplier.id}
                  onClick={() => {
                    setSelectedSupplier(supplier.Supname);
                    setSupplierDropDownVisible(false);
                  }}
                >
                  {supplier.Supname}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="selectedCategory">Category</label>
          <input
            type="text"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value); // Update input field with user input
              handleCategorySearch(e); // Filter category list
              setCategoryDropDownVisible(true); // Show dropdown while typing
            }}
            placeholder="Type to search categories"
            onBlur={() =>
              setTimeout(() => setCategoryDropDownVisible(false), 200)
            }
            onFocus={() => setCategoryDropDownVisible(true)}
          />

          {isCategoryDropDownVisible && filteredCategoryList.length > 0 && (
            <ul className="dropdown-list">
              {filteredCategoryList.map((category) => (
                <li
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.catName);
                    setCategoryDropDownVisible(false);
                  }}
                >
                  {category.catName}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="selectedUnit">Units</label>
          <input
            type="text"
            value={selectedUnit}
            onChange={(e) => {
              setSelectedUnit(e.target.value); // Update the input field with user input
              handleUnitSearch(e); // Filter the unit list based on input
              setUnitDropDownVisible(true); // Show the dropdown while typing
            }}
            placeholder="Type to search units"
            onBlur={() => setTimeout(() => setUnitDropDownVisible(false), 200)} // Hide the dropdown on blur with delay
            onFocus={() => setUnitDropDownVisible(true)} // Show the dropdown when input is focused
          />

          {isUnitDropDownVisible && filteredUnitList.length > 0 && (
            <ul className="dropdown-list">
              {filteredUnitList.map((unit) => (
                <li
                  key={unit.id}
                  onClick={() => {
                    setSelectedUnit(unit.unitName);
                    setUnitDropDownVisible(false); // Hide dropdown after selection
                  }}
                >
                  {unit.unitName}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="selectedBatch">Batch</label>
          <input
            type="text"
            value={selectedBatch}
            onChange={(e) => {
              setselectedBatch(e.target.value); // Update input field with user input
              handleBatchSearch(e); // Filter batch list
              setBatchDropDownVisible(true); // Show dropdown while typing
            }}
            placeholder="Type to Search Batches"
            onBlur={() => setTimeout(() => setBatchDropDownVisible(false), 200)}
            onFocus={() => setBatchDropDownVisible(true)}
          />

          {isBatchDropDownVisible && filteredBatchList.length > 0 && (
            <ul className="dropdown-list">
              {filteredBatchList.map((batch) => (
                <li
                  key={batch.id}
                  onClick={() => {
                    setselectedBatch(batch.batchName);
                    setBatchDropDownVisible(false); // Hide the dropdown after selecting a value
                  }}
                >
                  {batch.batchName}
                </li>
              ))}
            </ul>
          )}
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
              placeholder="Enter Cost Price"
            />
          </div>

          <div className="form-group">
            <label htmlFor="mrpPrice">MRP Price</label>
            <input
              type="number"
              id="mrpPrice"
              value={mrpPrice}
              onChange={(e) => setMrpPrice(e.target.value)}
              onBlur={handcostChesking}
              placeholder="Enter MRP Price"
            />
          </div>

          <div className="form-group">
            <label htmlFor="profitPercentage">Profit Percentage</label>
            <input
              type="number"
              id="profitPercentage"
              value={profitPercentage}
              readOnly="ture"
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
              readOnly="true"
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
              <span> ({realWholesalePrice})</span>
            )}
          </div>
        </div>

        <div className="checkbox-group">
          <label
            style={{
              fontSize: "16px",
              textDecoration: "underline",
              fontWeight: "900",
              color: "red",
            }}
          >
            Status
          </label>
          <div className="check-box">
            <input
              type="checkbox"
              checked={isActive}
              onChange={() => {
                setIsActive(true);
              }}
            />
            <label>Active</label>
          </div>

          <div className="check-box">
            <input
              type="checkbox"
              checked={!isActive}
              onChange={() => {
                setIsActive(false);
              }}
            />
            <label>Inactive</label>
          </div>
        </div>

        <h2>Stock Details</h2>
        <div className="form-group">
          <label htmlFor="lockedPrice">Locked Price</label>
          <input
            type="number"
            id="lockedPrice"
            value={lockedPrice}
            onChange={(e) => setLockedPrice(e.target.value)}
            placeholder="Enter Locked Price"
          />
        </div>

        <div className="form-group">
          <label htmlFor="openingBalance">Stock Quantity</label>
          <input
            type="number"
            id="openingBalance"
            value={openingBalance}
            onChange={(e) => setOpeningBalance(e.target.value)}
            placeholder="Enter Stock Opening Balance"
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

        {/* Submit Button */}
        <div className="button-group">
          <button className="saveButton" onClick={handleSave}>
            Save Product
          </button>
        </div>
      </div>
    </div>
  );
}

// Validate props with PropTypes
AddProducts.propTypes = {
  UserName: PropTypes.string.isRequired,
  store: PropTypes.string.isRequired,
};
