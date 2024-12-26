import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Chart from 'chart.js/auto';
import "../css1/SalesTableChart.css"; // Adjust the path according to your project structure

const SalesTableChart = ({ store }) => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);  

  const chartRefLine = useRef(null); // Canvas ref
  const chartInstanceRefLine = useRef(null); // Chart instance ref

  const chartRefPie = useRef(null);
  const chartInstanceRefPie = useRef(null);

  const chartRefBar = useRef(null);
  const chartInstanceRefBar = useRef(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("http://localhost:5000/api/invoices/fetch_sales_chart_table", {
          params: { Store: store, startDate, endDate },
        });
        setSalesData(response.data);
      } catch (err) {
        setError(`Error fetching sales data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchSalesData();
  }, [store, startDate, endDate]);

  useEffect(() => {
    if (!salesData.length) {
      [chartInstanceRefLine, chartInstanceRefPie, chartInstanceRefBar].forEach((ref) => {
        if (ref.current) ref.current.destroy();
      });
      return;
    }

    const salesByDate = salesData.reduce((acc, sale) => {
      const date = new Date(sale.createdAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + parseFloat(sale.netAmount);
      return acc;
    }, {});

    const labels = Object.keys(salesByDate);
    const data = Object.values(salesByDate);
    const colors = labels.map(() => `hsl(${Math.random() * 360}, 70%, 60%)`);

    const createChart = (chartInstanceRef, canvasRef, type, config) => {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
      const ctx = canvasRef.current.getContext("2d");
      chartInstanceRef.current = new Chart(ctx, { type, ...config });
    };

    const chartConfigs = {
      data: { labels, datasets: [{ data, label: "Total Sales", backgroundColor: colors }] },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: "top", labels: { font: { size: 14 }, color: "#333" } },
          tooltip: {
            callbacks: {
              label: (context) => `Sales: $${context.parsed.toFixed(2)}`,
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Date",
              font: { size: 16 },
              color: "#555",
            },
          },
          y: {
            title: {
              display: true,
              text: "Sales Amount",
              font: { size: 16 },
              color: "#555",
            },
            beginAtZero: true,
          },
        },
      },
    };

    // Line Chart
    createChart(chartInstanceRefLine, chartRefLine, "line", {
      ...chartConfigs,
      data: {
        ...chartConfigs.data,
        datasets: [{ ...chartConfigs.data.datasets[0], borderColor: "#42A5F5", fill: false }],
      },
    });

    // Pie Chart
    createChart(chartInstanceRefPie, chartRefPie, "pie", {
      ...chartConfigs,
      options: {
        ...chartConfigs.options,
        scales: undefined, // No scales for Pie chart
      },
    });

    // Bar Chart
    createChart(chartInstanceRefBar, chartRefBar, "bar", {
      ...chartConfigs,
      data: {
        ...chartConfigs.data,
        datasets: [{ ...chartConfigs.data.datasets[0], backgroundColor: "#FF8A65" }],
      },
    });

    return () => {
      [chartInstanceRefLine, chartInstanceRefPie, chartInstanceRefBar].forEach((ref) => {
        if (ref.current) ref.current.destroy();
      });
    };
  }, [salesData]);

  return (
    <div className="sales-chart-container">
      <div className="filters">
        <div>
          <label>Start Date:</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label>End Date:</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      {loading && <p>Loading data...</p>}
      {error && <p className="error">{error}</p>}

      <div className="chart-wrapper">
        <h2>Line Chart</h2>
        <canvas ref={chartRefLine}></canvas>
      </div>

      <div className="chart-wrapper">
        <h2>Pie Chart</h2>
        <canvas ref={chartRefPie}></canvas>
      </div>

      <div className="chart-wrapper">
        <h2>Bar Chart</h2>
        <canvas ref={chartRefBar}></canvas>
      </div>
    </div>
  );
};

SalesTableChart.propTypes = {
  store: PropTypes.string.isRequired,
};

export default SalesTableChart;
