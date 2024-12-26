// StockInChart.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';
import Chart from 'chart.js/auto';
import '../css/StockInChart.css'; // Import the CSS for styling

const StockInChart = () => {
  // State variables
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openingBalance, setOpeningBalance] = useState(null);
  const [stockInData, setStockInData] = useState([]);
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
        const response = await axios.get('http://localhost:5000/api/products/search_stock_in', {
          params: { query },
        });
        setSuggestions(response.data);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        // Optionally, set an error state
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

      // Fetch stock in data using productId and date range
      const stockInResponse = await axios.get(
        `http://localhost:5000/api/products/product/${product.productId}/stock-in-get-chart`,
        {
          params: {
            startDate: startDate || undefined, // Only include if set
            endDate: endDate || undefined,     // Only include if set
          },
        }
      );

      // Format data for the chart
      const formattedData = stockInResponse.data.map((record) => ({
        date: new Date(record.date).toLocaleDateString(),
        quantity: Number(record.quantity),
      }));

      setStockInData(formattedData);
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
    if (stockInData.length === 0) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
      return;
    }

    const ctx = chartRef.current.getContext('2d');

    if (chartInstanceRef.current) {
      chartInstanceRef.current.data.labels = stockInData.map((data) => data.date);
      chartInstanceRef.current.data.datasets[0].data = stockInData.map(
        (data) => data.quantity
      );
      chartInstanceRef.current.update();
    } else {
      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: stockInData.map((data) => data.date),
          datasets: [
            {
              label: 'Quantity',
              data: stockInData.map((data) => data.quantity),
              fill: false,
              borderColor: '#388E3C', // Dark Green
              backgroundColor: '#388E3C', // For tooltips and points
              pointBackgroundColor: '#2E7D32', // Darker Green for points
              pointBorderColor: '#2E7D32',
              pointHoverBackgroundColor: '#C8E6C9', // Light Green on hover
              pointHoverBorderColor: '#C8E6C9',
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
              backgroundColor: '#C8E6C9', // Light Green tooltip background
              titleColor: '#388E3C', // Dark Green title
              bodyColor: '#333', // Dark text
              borderColor: '#388E3C', // Border matching line color
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
                color: '#388E3C', // Dark Green axis title
                font: {
                  size: 14,
                  weight: 'bold',
                },
              },
              grid: {
                color: '#C8E6C9', // Light Green grid lines
              },
              ticks: {
                color: '#388E3C', // Dark Green tick labels
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
                color: '#388E3C', // Dark Green axis title
                font: {
                  size: 14,
                  weight: 'bold',
                },
              },
              grid: {
                color: '#C8E6C9', // Light Green grid lines
              },
              ticks: {
                color: '#388E3C', // Dark Green tick labels
                font: {
                  size: 12,
                },
              },
            },
          },
        },
      });
    }
  }, [stockInData]);

  // Handle applying the date range filter
  const handleApplyDateRange = () => {
    if (!selectedProduct) {
      setError('Please select a product first.');
      return;
    }
    handleSuggestionClick(selectedProduct);
  };

  return (
    <div className="stock-in-chart">
      <h1>Stock In Report</h1>

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
      {selectedProduct && openingBalance && (
        <div className="product-info">
          {/* Product Image */}
          {selectedProduct.imageLink ? (
            <img
              src={selectedProduct.imageLink}
              alt={selectedProduct.productName}
              className="product-image"
              onError={(e) => { 
                e.target.onerror = null; 
                e.target.src = '/path-to-placeholder-image.jpg'; // Fallback image
              }}
            />
          ) : (
            <img
              src="/path-to-placeholder-image.jpg"
              alt="No Image Available"
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
      {stockInData.length > 0 && (
        <div className="chart-container">
          <h3>Stock In Movements</h3>
          <canvas ref={chartRef}></canvas>
        </div>
      )}
    </div>
  );
};

export default StockInChart;
