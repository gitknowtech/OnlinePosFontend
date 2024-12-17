import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';
import Chart from 'chart.js/auto';
import '../css/StockQuantityMovement.css'; // Import the CSS for styling

const StockQuantityMovement = () => {
  // State variables
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openingBalance, setOpeningBalance] = useState(null);
  const [stockQuantityData, setStockQuantityData] = useState([]);
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
        const response = await axios.get('http://154.26.129.243:5000/api/products/search_stock_in_quanity_chart', {
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
        `http://154.26.129.243:5000/api/products/product/${product.productId}/opening-balance`
      );
      setOpeningBalance(balanceResponse.data);

      // Fetch stock in data using productId and date range
      const stockInResponse = await axios.get(
        `http://154.26.129.243:5000/api/products/product/${product.productId}/stock-in-get-chart`,
        {
          params: {
            startDate: startDate || undefined, // Only include if set
            endDate: endDate || undefined,     // Only include if set
          },
        }
      );

      // Fetch stock out data using productId and date range
      const stockOutResponse = await axios.get(
        `http://154.26.129.243:5000/api/products/product/${product.productId}/stock-out-get-chart`,
        {
          params: {
            startDate: startDate || undefined,
            endDate: endDate || undefined,
          },
        }
      );

      // Process and combine stock in and stock out data
      const stockInEvents = stockInResponse.data.map((record) => ({
        date: new Date(record.date),
        quantityChange: Number(record.quantity),
      }));

      const stockOutEvents = stockOutResponse.data.map((record) => ({
        date: new Date(record.date),
        quantityChange: -Number(record.quantity),
      }));

      // Combine events and sort by date
      const allEvents = [...stockInEvents, ...stockOutEvents];
      allEvents.sort((a, b) => a.date - b.date);

      // Compute cumulative quantity over time
      let cumulativeQuantity = Number(openingBalance.openingBalance);
      const cumulativeData = [];

      // Add initial data point with the opening balance
      if (allEvents.length === 0 || startDate) {
        // If no events or a start date is specified, use the start date or today
        const initialDate = startDate ? new Date(startDate) : new Date();
        cumulativeData.push({
          date: initialDate.toLocaleDateString(),
          quantity: cumulativeQuantity,
        });
      } else {
        // Use the date of the first event
        cumulativeData.push({
          date: allEvents[0].date.toLocaleDateString(),
          quantity: cumulativeQuantity,
        });
      }

      for (const event of allEvents) {
        cumulativeQuantity += event.quantityChange;
        cumulativeData.push({
          date: event.date.toLocaleDateString(),
          quantity: cumulativeQuantity,
        });
      }

      setStockQuantityData(cumulativeData);
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
    if (stockQuantityData.length === 0) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
      return;
    }

    const ctx = chartRef.current.getContext('2d');

    if (chartInstanceRef.current) {
      chartInstanceRef.current.data.labels = stockQuantityData.map((data) => data.date);
      chartInstanceRef.current.data.datasets[0].data = stockQuantityData.map(
        (data) => data.quantity
      );
      chartInstanceRef.current.update();
    } else {
      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: stockQuantityData.map((data) => data.date),
          datasets: [
            {
              label: 'Stock Quantity',
              data: stockQuantityData.map((data) => data.quantity),
              fill: false,
              borderColor: '#2196F3', // Blue
              backgroundColor: '#2196F3', // For tooltips and points
              pointBackgroundColor: '#1976D2', // Darker Blue for points
              pointBorderColor: '#1976D2',
              pointHoverBackgroundColor: '#BBDEFB', // Light Blue on hover
              pointHoverBorderColor: '#BBDEFB',
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
              backgroundColor: '#BBDEFB', // Light Blue tooltip background
              titleColor: '#2196F3', // Blue title
              bodyColor: '#333', // Dark text
              borderColor: '#2196F3', // Border matching line color
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
                color: '#2196F3', // Blue axis title
                font: {
                  size: 14,
                  weight: 'bold',
                },
              },
              grid: {
                color: '#BBDEFB', // Light Blue grid lines
              },
              ticks: {
                color: '#2196F3', // Blue tick labels
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
                color: '#2196F3', // Blue axis title
                font: {
                  size: 14,
                  weight: 'bold',
                },
              },
              grid: {
                color: '#BBDEFB', // Light Blue grid lines
              },
              ticks: {
                color: '#2196F3', // Blue tick labels
                font: {
                  size: 12,
                },
              },
            },
          },
        },
      });
    }
  }, [stockQuantityData]);

  // Handle applying the date range filter
  const handleApplyDateRange = () => {
    if (!selectedProduct) {
      setError('Please select a product first.');
      return;
    }
    handleSuggestionClick(selectedProduct);
  };

  return (
    <div className="stock-quantity-movement">
      <h1>Stock Quantity Movement</h1>

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
      {stockQuantityData.length > 0 && (
        <div className="chart-container">
          <h3>Stock Quantity Over Time</h3>
          <canvas ref={chartRef}></canvas>
        </div>
      )}
    </div>
  );
};

export default StockQuantityMovement;
