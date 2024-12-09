// src/components/Dashboard.jsx

import "../css/Dashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useLocation hook
import { Link, Outlet } from "react-router-dom"; // Use Outlet to load child routes dynamically
import Swal from "sweetalert2";

import {
  faStore,
  faArchive,
  faReceipt,
  faDashboard,
  faUser,
  faWrench,
  faCartPlus,
  faFileText,
  faUserSecret,
  faTrashRestore,
  faBars,
  faChartBar,
  faRightFromBracket,
  faBarsProgress,
  faEnvelope,
  faTry,
  faTimeline,
} from "@fortawesome/free-solid-svg-icons";
import adminImage from "../assets/images/user.png";

const Dashboard = () => {
  const location = useLocation(); // Get location object
  const navigate = useNavigate(); // Initialize useNavigate for redirection

  // State variables for user information
  const [isOpen, setIsOpen] = useState(true); // Sidebar state
  const [username, setUsername] = useState(""); // User's name
  const [store, setStore] = useState("Berty Sport Corner"); // Store name
  const [type, setType] = useState("N/A"); // User type
  const [email, setEmail] = useState("N/A"); // Email address
  const [lastLogin, setLastLogin] = useState("N/A"); // Last login

  // State variables for loading and error handling
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // State variables for current date and time
  const [currentDateTime, setCurrentDateTime] = useState({
    date: "",
    time: "",
  });

  // State variables for access rights
  const [accessRights, setAccessRights] = useState({});
  const [loadingAccess, setLoadingAccess] = useState(true);

  // Function to toggle sidebar visibility
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Function to update current date and time every second
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options = {
        timeZone: "Asia/Colombo",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      };

      const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", options);
      const parts = dateTimeFormatter.formatToParts(now);

      const day = parts.find(part => part.type === 'day')?.value;
      const month = parts.find(part => part.type === 'month')?.value;
      const year = parts.find(part => part.type === 'year')?.value;
      const hour = parts.find(part => part.type === 'hour')?.value;
      const minute = parts.find(part => part.type === 'minute')?.value;
      const second = parts.find(part => part.type === 'second')?.value;
      const dayPeriod = parts.find(part => part.type === 'dayPeriod')?.value;

      const formattedDate = `${day} ${month}, ${year}`;
      const formattedTime = `${hour}:${minute}:${second} ${dayPeriod}`;

      setCurrentDateTime({
        date: formattedDate,
        time: formattedTime,
      });
    };

    const intervalId = setInterval(updateDateTime, 1000); // Update every second
    updateDateTime(); // Set initial time

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  // Function to fetch user data from location.state
  useEffect(() => {
    if (location.state) {
      const { UserName, Store, Type, Email, LastLogin } = location.state;

      setUsername(UserName || "Guest");
      setStore(Store || "Berty Sport Corner");
      setType(Type || "N/A");
      setEmail(Email || "N/A");
      setLastLogin(LastLogin || "N/A");
    } else {
      setError("No user data available");
    }

    setLoading(false);
  }, [location.state]);

  // Function to fetch access rights for all sections
  useEffect(() => {
    const fetchAccessRights = async () => {
      try {
        const sections = [
          "Dashboard",
          "Invoice",
          "Sales",
          "Stock",
          "Products",
          "Purchasing",
          "ManageUser",
          "Customer",
          "Quotation",
          "Charts",
          "Reports",
          "Setting",
          "Backup",
        ];

        const accessPromises = sections.map((section) =>
          fetch(`http://localhost:5000/api/access/${username}/${section}`)
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

        setAccessRights(accessObject);
      } catch (error) {
        console.error("Error fetching access rights:", error);
        setError("Failed to fetch access rights.");
      } finally {
        setLoadingAccess(false);
      }
    };

    if (username) {
      fetchAccessRights();
    }
  }, [username]);

  // Function to handle access check before navigation
  const handleAccessCheck = async (section, route) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/access/${username}/${section}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch access for ${section}`);
      }
      const data = await response.json();

      if (data.access) {
        navigate(route, {
          state: {
            UserName: username,
            Store: store,
            Type: type,
            Email: email,
            LastLogin: lastLogin,
          },
        });
      } else {
        navigate("/ErrorAccess");
      }
    } catch (error) {
      console.error("Error checking access:", error);
      navigate("/ErrorAccess");
    }
  };

  // Render loading or error states
  if (loading || loadingAccess) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard_wrapper">
      {/* Dashboard main navbar */}
      <div className="dashboard_header">
        <div className="company-name">
          <h2 id="companyname">GitKnowTech</h2>
        </div>
        <div className="togglerIcon">
          <FontAwesomeIcon
            className="sidebar-toggle-icon"
            icon={isOpen ? faBars : faBarsProgress}
            onClick={toggleSidebar}
          />
        </div>

        {/* Current timestamp section */}
        <div className="now-time-stamp">
          <div className="date-time">
            <span className="current-date">
              Today, {currentDateTime.date} /
            </span>
            <span className="current-time">
              &nbsp;Time: {currentDateTime.time}
            </span>
          </div>
        </div>

        <div className="user-info">
          <div className="user-details">
            {/* Display the admin image and username */}
            <img src={adminImage} alt="Admin" className="admin-image" />

            {/* Hover popup */}
            <div className="user-popup">
              <p>
                <strong>
                  <FontAwesomeIcon className="user-popup-icon" icon={faUser} />
                  &nbsp;Username:
                </strong>{" "}
                {username}
              </p>
              <p>
                <strong>
                  <FontAwesomeIcon
                    className="user-popup-icon"
                    icon={faEnvelope}
                  />
                  &nbsp;Email:
                </strong>{" "}
                {email}
              </p>
              <p>
                <strong>
                  <FontAwesomeIcon className="user-popup-icon" icon={faTry} />
                  &nbsp;Type:
                </strong>{" "}
                {type}
              </p>
              <p>
                <strong>
                  <FontAwesomeIcon className="user-popup-icon" icon={faStore} />
                  &nbsp;Store:
                </strong>{" "}
                {store}
              </p>
              <p>
                <strong>
                  <FontAwesomeIcon
                    className="user-popup-icon"
                    icon={faTimeline}
                  />
                  &nbsp;Last Login:
                </strong>{" "}
                {lastLogin}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar and main container */}
      <div className="dashboard_main">
        {/* Dashboard sidebar */}
        <div className={`dashboard_sidebar ${isOpen ? "" : "close"}`}>
          {/* Sidebar links */}
          <div className="scrollbox">
            <div className="scrollbox-inner">
              <ul className="nav-links">
                {accessRights["Dashboard"] && (
                  <li>
                    <div
                      className="icon-link"
                      onClick={() =>
                        handleAccessCheck("Dashboard", "/dashboard/MainDashboard")
                      }
                    >
                      <Link
                        to="MainDashboard"
                        state={{
                          UserName: username,
                          Store: store,
                          Type: type,
                          Email: email,
                          LastLogin: lastLogin,
                        }}
                      >
                        <FontAwesomeIcon
                          className="nav-icon"
                          icon={faDashboard}
                        />
                        <span className="link-name">DASHBOARD</span>
                      </Link>
                    </div>
                    <hr />
                  </li>
                )}

                {accessRights["Invoice"] && (
                  <li>
                    <div
                      className="icon-link"
                      onClick={() =>
                        handleAccessCheck("Invoice", "/dashboard/invoice")
                      }
                    >
                      <Link
                        to="invoice"
                        state={{
                          UserName: username,
                          Store: store,
                          Type: type,
                          Email: email,
                          LastLogin: lastLogin,
                        }}
                      >
                        <FontAwesomeIcon className="nav-icon" icon={faReceipt} />
                        <span className="link-name">INVOICE</span>
                      </Link>
                    </div>
                  </li>
                )}

                {accessRights["Sales"] && (
                  <li>
                    <div
                      className="icon-link"
                      onClick={() =>
                        handleAccessCheck("Sales", "/dashboard/sales")
                      }
                    >
                      <Link
                        to="sales"
                        state={{
                          UserName: username,
                          Store: store,
                          Type: type,
                          Email: email,
                          LastLogin: lastLogin,
                        }}
                      >
                        <FontAwesomeIcon className="nav-icon" icon={faChartBar} />
                        <span className="link-name">SALES</span>
                      </Link>
                    </div>
                  </li>
                )}

                {accessRights["Stock"] && (
                  <li>
                    <div
                      className="icon-link"
                      onClick={() =>
                        handleAccessCheck("Stock", "/dashboard/stock")
                      }
                    >
                      <Link
                        to="stock"
                        state={{
                          UserName: username,
                          Store: store,
                          Type: type,
                          Email: email,
                          LastLogin: lastLogin,
                        }}
                      >
                        <FontAwesomeIcon className="nav-icon" icon={faCartPlus} />
                        <span className="link-name">STOCK</span>
                      </Link>
                    </div>
                  </li>
                )}

                <hr />

                {accessRights["Products"] && (
                  <li>
                    <div
                      className="icon-link"
                      onClick={() =>
                        handleAccessCheck("Products", "/dashboard/products")
                      }
                    >
                      <Link
                        to="products"
                        state={{
                          UserName: username,
                          Store: store,
                          Type: type,
                          Email: email,
                          LastLogin: lastLogin,
                        }}
                      >
                        <FontAwesomeIcon className="nav-icon" icon={faArchive} />
                        <span className="link-name">PRODUCTS</span>
                      </Link>
                    </div>
                  </li>
                )}

                {accessRights["Purchasing"] && (
                  <li>
                    <div
                      className="icon-link"
                      onClick={() =>
                        handleAccessCheck("Purchasing", "/dashboard/purchasing")
                      }
                    >
                      <Link
                        to="purchasing"
                        state={{
                          UserName: username,
                          Store: store,
                          Type: type,
                          Email: email,
                          LastLogin: lastLogin,
                        }}
                      >
                        <FontAwesomeIcon
                          className="nav-icon"
                          icon={faUserSecret}
                        />
                        <span className="link-name">PURCHASING</span>
                      </Link>
                    </div>
                  </li>
                )}

                {accessRights["ManageUser"] && (
                  <li>
                    <div
                      className="icon-link"
                      onClick={() =>
                        handleAccessCheck("ManageUser", "/dashboard/ManageUser")
                      }
                    >
                      <Link
                        to="ManageUser"
                        state={{
                          UserName: username,
                          Store: store,
                          Type: type,
                          Email: email,
                          LastLogin: lastLogin,
                        }}
                      >
                        <FontAwesomeIcon
                          className="nav-icon"
                          icon={faUserSecret}
                        />
                        <span className="link-name">USER</span>
                      </Link>
                    </div>
                  </li>
                )}

                {accessRights["Customer"] && (
                  <li>
                    <div
                      className="icon-link"
                      onClick={() =>
                        handleAccessCheck("Customer", "/dashboard/customer")
                      }
                    >
                      <Link
                        to="customer"
                        state={{
                          UserName: username,
                          Store: store,
                          Type: type,
                          Email: email,
                          LastLogin: lastLogin,
                        }}
                      >
                        <FontAwesomeIcon
                          className="nav-icon"
                          icon={faUserSecret}
                        />
                        <span className="link-name">CUSTOMER</span>
                      </Link>
                    </div>
                    <hr />
                  </li>
                )}

                {accessRights["Quotation"] && (
                  <li>
                    <div
                      className="icon-link"
                      onClick={() =>
                        handleAccessCheck("Quotation", "/dashboard/invoiceNew")
                      }
                    >
                      <Link
                        to="invoiceNew"
                        state={{
                          UserName: username,
                          Store: store,
                          Type: type,
                          Email: email,
                          LastLogin: lastLogin,
                        }}
                      >
                        <FontAwesomeIcon
                          className="nav-icon"
                          icon={faTry}
                        />
                        <span className="link-name">QUOTATION</span>
                      </Link>
                    </div>
                  </li>
                )}

                {accessRights["Charts"] && (
                  <li>
                    <div
                      className="icon-link"
                      onClick={() =>
                        handleAccessCheck("Charts", "/dashboard/Charts")
                      }
                    >
                      <Link
                        to="Charts"
                        state={{
                          UserName: username,
                          Store: store,
                          Type: type,
                          Email: email,
                          LastLogin: lastLogin,
                        }}
                      >
                        <FontAwesomeIcon className="nav-icon" icon={faFileText} />
                        <span className="link-name">CHARTS</span>
                      </Link>
                    </div>
                  </li>
                )}

                {accessRights["Reports"] && (
                  <li>
                    <div
                      className="icon-link"
                      onClick={() =>
                        handleAccessCheck("Reports", "/dashboard/Reports")
                      }
                    >
                      <Link
                        to="Reports"
                        state={{
                          UserName: username,
                          Store: store,
                          Type: type,
                          Email: email,
                          LastLogin: lastLogin,
                        }}
                      >
                        <FontAwesomeIcon className="nav-icon" icon={faChartBar} />
                        <span className="link-name">REPORTS</span>
                      </Link>
                    </div>
                  </li>
                )}

                {accessRights["Setting"] && (
                  <li>
                    <div
                      className="icon-link"
                      onClick={() =>
                        handleAccessCheck("Setting", "/dashboard/Setting")
                      }
                    >
                      <Link
                        to="Setting"
                        state={{
                          UserName: username,
                          Store: store,
                          Type: type,
                          Email: email,
                          LastLogin: lastLogin,
                        }}
                      >
                        <FontAwesomeIcon className="nav-icon" icon={faWrench} />
                        <span className="link-name">SETTING</span>
                      </Link>
                    </div>
                  </li>
                )}

                {accessRights["Reports"] && (
                  <li>
                    <div
                      className="icon-link"
                      onClick={() =>
                        handleAccessCheck("Reports", "/dashboard/Reports")
                      }
                    >
                      <Link
                        to="Reports"
                        state={{
                          UserName: username,
                          Store: store,
                          Type: type,
                          Email: email,
                          LastLogin: lastLogin,
                        }}
                      >
                        <FontAwesomeIcon className="nav-icon" icon={faChartBar} />
                        <span className="link-name">REPORTS</span>
                      </Link>
                    </div>
                  </li>
                )}

                {accessRights["Backup"] && (
                  <li>
                    <div
                      className="icon-link"
                      onClick={() =>
                        handleAccessCheck("Backup", "/dashboard/Backup")
                      }
                    >
                      <Link
                        to="Backup"
                        state={{
                          UserName: username,
                          Store: store,
                          Type: type,
                          Email: email,
                          LastLogin: lastLogin,
                        }}
                      >
                        <FontAwesomeIcon
                          className="nav-icon"
                          icon={faTrashRestore}
                        />
                        <span className="link-name">BACKUP</span>
                      </Link>
                    </div>
                    <hr />
                  </li>
                )}

                {/* Logout Button */}
                <li style={{marginTop:"10px", marginLeft:"20px", padding:"5px" , fontSize: "12px"}}>
                  <button
                    className="icon-link logout-button"
                    onClick={() => {
                      // Handle logout functionality
                      setUsername("");
                      setStore("Berty Sport Corner");
                      setType("N/A");
                      setEmail("N/A");
                      setLastLogin("N/A");
                      setAccessRights({});
                      navigate("/");
                    }}
                  >
                    <FontAwesomeIcon
                      className="nav-icon"
                      icon={faRightFromBracket}
                    />
                    <span className="link-name">LOGOUT</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main content container */}
        <div className={`dashboard_container ${isOpen ? "" : "full-width"}`}>
          {/* This is where child routes like Product.jsx will be rendered */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
