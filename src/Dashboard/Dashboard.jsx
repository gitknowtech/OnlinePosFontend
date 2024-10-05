import "../css/Dashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation hook
import { Link, Outlet } from "react-router-dom"; // Use Outlet to load child routes dynamically


import {
  faStore,
  faArchive,
  faReceipt,
  faDashboard,
  faSignal,
  faVcard,
  faUser,
  faWrench,
  faCartPlus,
  faFileText,
  faUserSecret,
  faTrashRestore,
  faHistory,
  faBars,
  faUserGroup,
  faChartBar,
  faRightFromBracket,
  faUserCircle,
  faBarsProgress,
  faEnvelope,
  faTry,
  faTimeline,
} from "@fortawesome/free-solid-svg-icons";
import adminImage from "../assets/images/user.png";

const Dashboard = () => {
  const location = useLocation(); // Get location object
  const [isOpen, setIsOpen] = useState(true); // Sidebar state
  const [username, setUsername] = useState(""); // User's name
  const [store, setStore] = useState("Berty Sport Corner"); // Store name
  const [type, setType] = useState("N/A"); // User type
  const [email, setEmail] = useState("N/A"); // Email address
  const [LastLogin, setlastLogin] = useState("N/A"); // Last login
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const [currentDateTime, setCurrentDateTime] = useState({
    date: "",
    time: "",
  });


  // Combine user data and time update in one useEffect
  useEffect(() => {
    // Function to get the current date and time in Sri Lanka timezone
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

      // Format date and time based on Sri Lanka timezone
      const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", options);
      const parts = dateTimeFormatter.formatToParts(now);

      const formattedDate = `${parts[2].value} ${parts[0].value}, ${parts[4].value}`;
      const formattedTime = `${parts[6].value}:${parts[8].value}:${parts[10].value} ${parts[12].value}`;

      setCurrentDateTime({
        date: formattedDate,
        time: formattedTime,
      });
    };

    // Update time every second
    const intervalId = setInterval(updateDateTime, 1000); // Update every second
    updateDateTime(); // Set initial time

    // Check if location.state exists and contains user data
    if (location.state) {
      const { UserName, Store, Type, Email, LastLogin } = location.state;

      setUsername(UserName || "Guest");
      setStore(Store || "Berty Sport Corner");
      setType(Type || "N/A");
      setEmail(Email || "N/A");
      setlastLogin(LastLogin || "N/A");
    } else {
      // Set an error message if location.state does not exist
      setError("No user data available");
    }
    
    setLoading(false); // Stop loading after processing data

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [location.state]); // Only re-run the effect when location.state changes

  if (loading) {
    return <div className="loading">Loading...</div>; // Show loading message
  }

  if (error) {
    return <div className="error">{error}</div>; // Show error message if there is an error
  }
  
  



 


  return (
    <div className="dashboard_wrapper">
      {/* Dashboard main navbar */}
      <div className="dashboard_header">
        <div className="company-name">
          <h2>GitKnowTech</h2>
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
              &nbsp;Time :{currentDateTime.time}
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
                {LastLogin}
              </p>
            </div>
          </div>
        </div>
      </div>




      

      {/* Sidebar and main container */}
      <div className="dashboard_main">
        {/* Dashboard side bar */}
        <div className={`dashboard_sidebar ${isOpen ? "" : "close"}`}>
          {/* Sidebar links */}
          <div className="scrollbox">
            <div className="scrollbox-inner">
              <ul className="nav-links">
                <li>
                  <div className="icon-link">
                    <a href="#">
                      <FontAwesomeIcon
                        className="nav-icon"
                        icon={faDashboard}
                      />
                      <span className="link-name">DASHBOARD</span>
                    </a>
                  </div>
                  <hr />
                </li>
                <li>
                  <div className="icon-link">
                    <a href="#">
                      <FontAwesomeIcon className="nav-icon" icon={faReceipt} />
                      <span className="link-name">INVOICE</span>
                    </a>
                  </div>
                </li>
                <li>
                  <div className="icon-link">
                    <a href="#">
                      <FontAwesomeIcon className="nav-icon" icon={faSignal} />
                      <span className="link-name">SALES</span>
                    </a>
                  </div>
                  <hr />
                </li>
                <li>
                  <div className="icon-link">
                    <a href="#">
                      <FontAwesomeIcon className="nav-icon" icon={faCartPlus} />
                      <span className="link-name">STOCK</span>
                    </a>
                  </div>
                </li>
                <li>
                  <div className="icon-link">
                    <a href="#">
                      <FontAwesomeIcon className="nav-icon" icon={faVcard} />
                      <span className="link-name">CREDIT SALES</span>
                    </a>
                  </div>
                </li>
                <li>
                  <div className="icon-link">
                  <Link
                    to="products"
                    state={{ UserName: username, Store: store, Type: type, Email: email, LastLogin }}>
                    <FontAwesomeIcon className="nav-icon" icon={faArchive} />
                    <span className="link-name">PRODUCTS</span>
                  </Link>
                  </div>
                  <hr />
                </li>
                <li>
                  <div className="icon-link">
                  <Link
                    to="purchasing"
                    state={{ UserName: username, Store: store, Type: type, Email: email, LastLogin }}>
                      <FontAwesomeIcon className="nav-icon" icon={faUserSecret}/>
                      <span className="link-name">PURCHESING</span>
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="icon-link">
                    <a href="#">
                      <FontAwesomeIcon
                        className="nav-icon"
                        icon={faUserGroup}
                      />
                      <span className="link-name">USER</span>
                    </a>
                  </div>
                </li>

                <li>
                  <div className="icon-link">
                    <a href="#">
                      <FontAwesomeIcon
                        className="nav-icon"
                        icon={faUserCircle}
                      />
                      <span className="link-name">EMPLOYEE</span>
                    </a>
                  </div>
                </li>
                <li>
                  <div className="icon-link">
                    <a href="#">
                      <FontAwesomeIcon className="nav-icon" icon={faUser} />
                      <span className="link-name">CUSTOMER</span>
                    </a>
                  </div>
                  <hr />
                </li>
                <li>
                  <div className="icon-link">
                    <a href="#">
                      <FontAwesomeIcon className="nav-icon" icon={faStore} />
                      <span className="link-name">QUOTATION</span>
                    </a>
                  </div>
                </li>
                <li>
                  <div className="icon-link">
                    <a href="#">
                      <FontAwesomeIcon className="nav-icon" icon={faFileText} />
                      <span className="link-name">REPORTS</span>
                    </a>
                  </div>
                </li>
                <li>
                  <div className="icon-link">
                    <a href="#">
                      <FontAwesomeIcon className="nav-icon" icon={faChartBar} />
                      <span className="link-name">CHART</span>
                    </a>
                  </div>
                </li>
                <li>
                  <div className="icon-link">
                    <a href="#">
                      <FontAwesomeIcon className="nav-icon" icon={faHistory} />
                      <span className="link-name">HISTORY</span>
                    </a>
                  </div>
                  <hr />
                </li>
                <li>
                  <div className="icon-link">
                    <a href="#">
                      <FontAwesomeIcon className="nav-icon" icon={faWrench} />
                      <span className="link-name">SETTING</span>
                    </a>
                  </div>
                </li>
                <li>
                  <div className="icon-link">
                    <a href="#">
                      <FontAwesomeIcon
                        className="nav-icon"
                        icon={faTrashRestore}
                      />
                      <span className="link-name">BACKUP</span>
                    </a>
                  </div>
                  <hr />
                </li>
                <li>
                  <div className="icon-link">
                    <a href="#">
                      <FontAwesomeIcon
                        className="nav-icon"
                        icon={faRightFromBracket}
                      />
                      <span className="link-name">LOGOUT</span>
                    </a>
                  </div>
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
