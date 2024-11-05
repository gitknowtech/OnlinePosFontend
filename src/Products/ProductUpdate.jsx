import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../css1/ProductUpdateModel.css"; // Ensure this CSS file is updated

export default function ProductUpdate({ product, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    ...product,
    manufacturingDate: product.manufacturingDate ? new Date(product.manufacturingDate) : null,
    expiringDate: product.expiringDate ? new Date(product.expiringDate) : null,
  });
  const [supplierList, setSupplierList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const productIdInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supplierResponse = await axios.get("http://localhost:5000/api/suppliers/get_suppliers");
        setSupplierList(supplierResponse.data);
      } catch {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch suppliers. Please try again later.",
        });
      }

      try {
        const categoryResponse = await axios.get("http://localhost:5000/api/categories/get_categories");
        setCategoryList(categoryResponse.data);
      } catch {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch categories. Please try again later.",
        });
      }

      try {
        const unitResponse = await axios.get("http://localhost:5000/api/units/get_units");
        setUnitList(unitResponse.data);
      } catch {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch units. Please try again later.",
        });
      }

      try {
        const batchResponse = await axios.get("http://localhost:5000/api/batches/get_batches");
        setBatchList(batchResponse.data);
      } catch {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch batches. Please try again later.",
        });
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCostValidation = () => {
    const cost = parseFloat(formData.costPrice) || 0;
    const mrp = parseFloat(formData.mrpPrice) || 0;

    if (cost > mrp) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Cost Price cannot be greater than MRP Price!",
      });
      setFormData((prev) => ({ ...prev, costPrice: "", mrpPrice: "" }));
    } else {
      calculateProfit();
    }
  };


  // Additional functions to handle calculations based on user input
  const handleDiscountBlur = () => {
    const mrp = parseFloat(formData.mrpPrice) || 0;
    const discountPrice = parseFloat(formData.discountPrice) || 0;

    if (mrp && discountPrice) {
      const discountPercentage = ((mrp - discountPrice) / mrp) * 100;
      setFormData((prev) => ({
        ...prev,
        discountPercentage: discountPercentage.toFixed(2),
      }));
    }
  };

  const handleDiscountPercentageBlur = () => {
    const mrp = parseFloat(formData.mrpPrice) || 0;
    const discountPercentage = parseFloat(formData.discountPercentage) || 0;

    if (mrp && discountPercentage) {
      const discountPrice = mrp - (mrp * discountPercentage) / 100;
      setFormData((prev) => ({
        ...prev,
        discountPrice: discountPrice.toFixed(2),
      }));
    }
  };

  const handleWholesaleBlur = () => {
    const mrp = parseFloat(formData.mrpPrice) || 0;
    const wholesalePrice = parseFloat(formData.wholesalePrice) || 0;

    if (mrp && wholesalePrice) {
      const wholesalePercentage = ((mrp - wholesalePrice) / mrp) * 100;
      setFormData((prev) => ({
        ...prev,
        wholesalePercentage: wholesalePercentage.toFixed(2),
      }));
    }
  };

  const handleWholesalePercentageBlur = () => {
    const mrp = parseFloat(formData.mrpPrice) || 0;
    const wholesalePercentage = parseFloat(formData.wholesalePercentage) || 0;

    if (mrp && wholesalePercentage) {
      const wholesalePrice = mrp - (mrp * wholesalePercentage) / 100;
      setFormData((prev) => ({
        ...prev,
        wholesalePrice: wholesalePrice.toFixed(2),
      }));
    }
  };

  // Add these to the input fields as onBlur handlers




  const calculateProfit = () => {
    const cost = parseFloat(formData.costPrice) || 0;
    const mrp = parseFloat(formData.mrpPrice) || 0;
    if (mrp >= cost) {
      const profitAmount = mrp - cost;
      const profitPercentage = ((profitAmount / cost) * 100).toFixed(2);
      setFormData((prev) => ({
        ...prev,
        profitAmount: profitAmount.toFixed(2),
        profitPercentage,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Format date fields to 'YYYY-MM-DD'
      const formattedFormData = {
        ...formData,
        manufacturingDate: formData.manufacturingDate
          ? new Date(formData.manufacturingDate).toISOString().split('T')[0]
          : null,
        expiringDate: formData.expiringDate
          ? new Date(formData.expiringDate).toISOString().split('T')[0]
          : null,
      };

      await axios.put(
        `http://localhost:5000/api/products/update_product/${formData.productId}`,
        formattedFormData
      );

      Swal.fire({
        icon: "success",
        title: "Product Updated",
        text: "The product details have been updated successfully!",
      });
      onUpdate(formData);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Error updating product: ${error.message}`,
      });
    }
  };



  return (
    <div id="product-update-modal-overlay">
      <div id="product-update-modal-content">
        <h2>Update Product</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Product ID</label>
              <input type="text" name="productId" value={formData.productId} readOnly ref={productIdInputRef} />
            </div>
            <div className="form-group">
              <label>Barcode</label>
              <input type="text" name="barcode" value={formData.barcode} readOnly />
            </div>
            <div className="form-group">
              <label>Product Name</label>
              <input type="text" name="productName" value={formData.productName} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Product Name (Sinhala)</label>
              <input type="text" name="productNameSinhala" value={formData.productNameSinhala} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Supplier</label>
              <select name="selectedSupplier" value={formData.selectedSupplier} onChange={handleInputChange}>
                <option value="">Select Supplier</option>
                {supplierList.map((supplier) => (
                  <option key={supplier.id} value={supplier.Supname}>
                    {supplier.Supname}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select name="selectedCategory" value={formData.selectedCategory} onChange={handleInputChange}>
                <option value="">Select Category</option>
                {categoryList.map((category) => (
                  <option key={category.id} value={category.catName}>
                    {category.catName}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Units</label>
              <select name="selectedUnit" value={formData.selectedUnit} onChange={handleInputChange}>
                <option value="">Select Unit</option>
                {unitList.map((unit) => (
                  <option key={unit.id} value={unit.unitName}>
                    {unit.unitName}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Batch</label>
              <select name="selectedBatch" value={formData.selectedBatch} onChange={handleInputChange}>
                <option value="">Select Batch</option>
                {batchList.map((batch) => (
                  <option key={batch.id} value={batch.batchName}>
                    {batch.batchName}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Manufacturing Date</label>
              <DatePicker
                selected={formData.manufacturingDate}
                onChange={(date) => setFormData((prev) => ({ ...prev, manufacturingDate: date }))}
                dateFormat="yyyy-MM-dd"
              />
            </div>
            <div className="form-group">
              <label>Expiring Date</label>
              <DatePicker
                selected={formData.expiringDate}
                onChange={(date) => setFormData((prev) => ({ ...prev, expiringDate: date }))}
                dateFormat="yyyy-MM-dd"
              />
            </div>
            <div className="form-group">
              <label>Cost Price</label>
              <input type="number" name="costPrice" value={formData.costPrice} onChange={handleInputChange} onBlur={handleCostValidation} />
            </div>
            <div className="form-group">
              <label>MRP Price</label>
              <input type="number" name="mrpPrice" value={formData.mrpPrice} onChange={handleInputChange} onBlur={handleCostValidation} />
            </div>
            <div className="form-group">
              <label>Profit Percentage</label>
              <input type="number" name="profitPercentage" value={formData.profitPercentage} readOnly />
            </div>
            <div className="form-group">
              <label>Profit Amount</label>
              <input type="number" name="profitAmount" value={formData.profitAmount} readOnly />
            </div>
            <div className="form-group">
              <label>Stock Quantity</label>
              <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Stock Alert</label>
              <input type="number" name="stockAlert" value={formData.stockAlert} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Discount Percentage</label>
              <input
                type="number"
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleInputChange}
                onBlur={handleDiscountPercentageBlur} // Calculate discount price based on percentage
              />
            </div>
            <div className="form-group">
              <label>Discount Price</label>
              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleInputChange}
                onBlur={handleDiscountBlur} // Calculate discount percentage based on price
              />
            </div>
            <div className="form-group">
              <label>Wholesale Percentage</label>
              <input
                type="number"
                name="wholesalePercentage"
                value={formData.wholesalePercentage}
                onChange={handleInputChange}
                onBlur={handleWholesalePercentageBlur} // Calculate wholesale price based on percentage
              />
            </div>
            <div className="form-group">
              <label>Wholesale Price</label>
              <input
                type="number"
                name="wholesalePrice"
                value={formData.wholesalePrice}
                onChange={handleInputChange}
                onBlur={handleWholesaleBlur} // Calculate wholesale percentage based on price
              />
            </div>
            <div className="form-group">
              <label>Locked Price</label>
              <input type="number" name="lockedPrice" value={formData.lockedPrice} onChange={handleInputChange} />
            </div>
            <div className="form-group" style={{display:"none"}}>
              <label>Store</label>
              <input type="text" name="store" value={formData.store} readOnly onChange={handleInputChange} />
            </div>
            <div className="form-group" style={{display:"none"}}>
              <label>User</label>
              <input type="text" name="user" value={formData.user} readOnly onChange={handleInputChange} />
            </div>
            <div className="form-group" style={{display:"none"}}>
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="form-group">
              <label>Image Link</label>
              <input type="text" name="imageLink" value={formData.imageLink} onChange={handleInputChange} />
            </div>
          </div>

          <div id="product-update-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Update</button>
          </div>
        </form>
      </div>
    </div>
  );
}

ProductUpdate.propTypes = {
  product: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};
