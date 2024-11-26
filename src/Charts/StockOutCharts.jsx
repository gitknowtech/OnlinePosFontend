// StockOutCharts.jsx

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';
import Chart from 'chart.js/auto';
import '../css/StockOutChart.css'; // Import the CSS for styling

const StockOutCharts = () => {
  // State variables
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openingBalance, setOpeningBalance] = useState(null);
  const [stockOutData, setStockOutData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Date range state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Ref for the chart canvas
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Debounced function to fetch suggestions
  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      if (!query) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await axios.get('http://localhost:5000/api/products/search_stock_out_chart', {
          params: { query },
        });
        setSuggestions(response.data);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    }, 300),
    []
  );

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchSuggestions(value);
  };

  // Handle suggestion click
  const handleSuggestionClick = async (product) => {
    setSelectedProduct(product);
    setSuggestions([]);
    setSearchTerm(`${product.productName} (${product.productId})`);
    setIsLoading(true);
    setError('');

    try {
      // Fetch opening balance using productId
      const balanceResponse = await axios.get(
        `http://localhost:5000/api/products/product/${product.productId}/opening-balance`
      );
      setOpeningBalance(balanceResponse.data);

      // Fetch stock out data using productId and date range
      const stockOutResponse = await axios.get(
        `http://localhost:5000/api/products/product/${product.productId}/stock-out-get-chart`,
        {
          params: {
            startDate: startDate || undefined, // Only include if set
            endDate: endDate || undefined,     // Only include if set
          },
        }
      );

      // Format data for the chart
      const formattedData = stockOutResponse.data.map((record) => ({
        date: new Date(record.date).toLocaleDateString(),
        quantity: Number(record.quantity),
      }));

      setStockOutData(formattedData);
    } catch (err) {
      console.error('Error fetching product data:', err);
      setError('Failed to fetch product data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle clicks outside the suggestions dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      const suggestionsBox = document.getElementById('suggestions-box');
      if (suggestionsBox && !suggestionsBox.contains(event.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Initialize or update the chart
  useEffect(() => {
    if (stockOutData.length === 0) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
      return;
    }

    const ctx = chartRef.current.getContext('2d');

    if (chartInstanceRef.current) {
      chartInstanceRef.current.data.labels = stockOutData.map((data) => data.date);
      chartInstanceRef.current.data.datasets[0].data = stockOutData.map(
        (data) => data.quantity
      );
      chartInstanceRef.current.update();
    } else {
      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: stockOutData.map((data) => data.date),
          datasets: [
            {
              label: 'Quantity',
              data: stockOutData.map((data) => data.quantity),
              fill: false,
              borderColor: '#D32F2F', // Dark Red
              backgroundColor: '#D32F2F', // For tooltips and points
              pointBackgroundColor: '#C62828', // Darker Red for points
              pointBorderColor: '#C62828',
              pointHoverBackgroundColor: '#FFCDD2', // Light Red on hover
              pointHoverBorderColor: '#FFCDD2',
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: '#FFCDD2', // Light Red tooltip background
              titleColor: '#D32F2F', // Dark Red title
              bodyColor: '#333', // Dark text
              borderColor: '#D32F2F', // Border matching line color
              borderWidth: 1,
            },
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false,
          },
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: 'Date',
                color: '#D32F2F', // Dark Red axis title
                font: {
                  size: 14,
                  weight: 'bold',
                },
              },
              grid: {
                color: '#FFCDD2', // Light Red grid lines
              },
              ticks: {
                color: '#D32F2F', // Dark Red tick labels
                font: {
                  size: 12,
                },
              },
            },
            y: {
              display: true,
              title: {
                display: true,
                text: 'Quantity',
                color: '#D32F2F', // Dark Red axis title
                font: {
                  size: 14,
                  weight: 'bold',
                },
              },
              grid: {
                color: '#FFCDD2', // Light Red grid lines
              },
              ticks: {
                color: '#D32F2F', // Dark Red tick labels
                font: {
                  size: 12,
                },
              },
            },
          },
        },
      });
    }
  }, [stockOutData]);

  // Handle applying the date range filter
  const handleApplyDateRange = () => {
    if (!selectedProduct) {
      setError('Please select a product first.');
      return;
    }
    handleSuggestionClick(selectedProduct);
  };

  return (
    <div className="stock-out-report">
      <h1>Stock Out Report</h1>

      {/* Date Range Selection */}
      <div className="date-range-container">
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="date-input"
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="date-input"
          />
        </label>
        <button onClick={handleApplyDateRange} className="apply-button">
          Apply
        </button>
      </div>

      {/* Search Container */}
      <div className="search-container">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by Product Name, ID, or Barcode"
          className="search-input"
        />
        {suggestions.length > 0 && (
          <ul id="suggestions-box" className="suggestions-list">
            {suggestions.map((product) => (
              <li
                key={product.productId} // Use productId as key
                onClick={() => handleSuggestionClick(product)}
                className="suggestion-item"
              >
                {product.productName} ({product.productId}) - {product.barcode}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Loading and Error Messages */}
      {isLoading && <p className="loading-message">Loading data...</p>}
      {error && <p className="error-message">{error}</p>}

      {/* Product Information */}
      {/* Product Information */}
      {selectedProduct && openingBalance && (
        <div className="product-info">
          {/* Product Image */}
          {selectedProduct.imageLink && (
            <img
              src={selectedProduct.imageLink}
              alt={selectedProduct.productName}
              className="product-image"
            />
          )}
          {/* Product Details */}
          <div className="product-details">
            <h2>{selectedProduct.productName}</h2>
            <p>
              <strong>Product ID:</strong> {selectedProduct.productId}
            </p>
            <p>
              <strong>Barcode:</strong> {selectedProduct.barcode}
            </p>
            <p>
              <strong>Opening Balance:</strong> {openingBalance.openingBalance}
            </p>
          </div>
        </div>
      )}


      {/* Chart */}
      {stockOutData.length > 0 && (
        <div className="chart-container">
          <h3>Stock Out Movements</h3>
          <canvas ref={chartRef}></canvas>
        </div>
      )}
    </div>
  );
};

export default StockOutCharts;
