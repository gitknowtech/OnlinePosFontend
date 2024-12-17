import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './StockModel.css';
import axios from 'axios';
import Swal from 'sweetalert2';

function StockModel({ show, onClose, onProductSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [productList, setProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    if (show) {
      searchInputRef.current?.focus();
    }
  }, [show]);

  useEffect(() => {
    if (!show) return;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (searchTerm.trim() === '') {
      setProductList([]);
      return;
    }

    debounceTimeoutRef.current = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchTerm, show]);

  const handleSearch = async () => {
    if (searchTerm.trim() === '') {
      setProductList([]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.get(
        `http://154.26.129.243:5000/api/products/search_stock?query=${encodeURIComponent(searchTerm)}`
      );
      setProductList(response.data);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to fetch product data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (product) => {
    onProductSelect(product);
    onClose();
  };

  if (!show) return null;

  return ReactDOM.createPortal(
    <div id="modal-overlay-StockModel">
      <div id="modal-content-StockModel">
        <button id="modal-close-button-StockModel" onClick={onClose} aria-label="Close Modal">×</button>
        <h2 id="title-StockModel">Search Product</h2>
        <div id="search-container-StockModel">
          <input
            type="text"
            id="search-input-StockModel"
            placeholder="Enter Product Details"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            ref={searchInputRef}
          />
        </div>

        {isLoading && <div id="loading-indicator-StockModel">Loading...</div>}

        <div id="product-table-container-StockModel">
          <table id="product-table-StockModel">
            <thead>
              <tr id="header-row-StockModel">
                <th>No.</th>
                <th>Product Name</th>
                <th>Barcode</th>
                <th>Sale Price</th>
                <th>QTY</th>
                <th>Wholesale</th>
                <th>Special</th>
              </tr>
            </thead>
            <tbody id="product-table-body-StockModel">
              {productList.length > 0 ? (
                productList.map((product, index) => (
                  <tr
                    key={product.id}
                    id={`product-row-${product.id}-StockModel`}
                    onClick={() => handleProductClick(product)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{index + 1}</td>
                    <td>{product.productName}</td>
                    <td>{product.barcode}</td>
                    <td>{product.salePrice ? product.salePrice.toFixed(2) : '-'}</td>
                    <td>{product.quantity ? product.quantity.toFixed(3) : '-'}</td>
                    <td>{product.wholesalePrice ? product.wholesalePrice.toFixed(2) : '-'}</td>
                    <td>{product.discountPrice ? product.discountPrice.toFixed(2) : '-'}</td>
                  </tr>
                ))
              ) : searchTerm.trim() !== '' && !isLoading ? (
                <tr id="no-products-row-StockModel">
                  <td colSpan="7" id="no-products-cell-StockModel">Product not found</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>,
    document.body
  );
}

StockModel.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onProductSelect: PropTypes.func.isRequired,
};

export default StockModel;
