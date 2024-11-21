import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation } from "react-router-dom"; // For accessing state
import { faUserPlus, faClipboardList } from "@fortawesome/free-solid-svg-icons";
import "../css1/User.css";
import axios from "axios";
import Swal from "sweetalert2";
import ManageUser from "./ManageUser"; // Import the ManageUser component

const UserManagement = () => {
  const location = useLocation(); // Access the location state
  const { UserName, Store, Email, LastLogin } = location.state || {}; // Destructure the passed state

  const [activeContent, setActiveContent] = useState(null); // Manage active content
  const [showAddUserModal, setShowAddUserModal] = useState(false); // Manage Add User Modal
  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    UserName: "",
    Password: "",
    Image: null,
    Type: "user", // Default user type
    Store: "", // Selected store
  }); // User form data
  const [storeList, setStoreList] = useState([]); // List of stores

  // Fetch stores when the component mounts
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/stores/get_stores");
        console.log("Fetched Stores:", response.data); // Log the stores
        setStoreList(response.data);
      } catch (error) {
        console.error("Error fetching stores:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch stores. Please try again later.",
        });
      }
    };
  
    fetchStores();
  }, []);
  

  // Toggle ManageUser Panel
  const toggleManageUser = () => {
    if (activeContent === "ManageUser") {
      setActiveContent(null); // Hide ManageUser if already active
    } else {
      setActiveContent("ManageUser"); // Show ManageUser panel
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle file input change for image
  const handleFileChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      Image: e.target.files[0],
    }));
  };

  //handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.Store) {
      Swal.fire({
        icon: "error",
        title: "Store Required",
        text: "Please select a store for the user.",
        confirmButtonText: "OK",
      });
      return;
    }
  
    // Retrieve the store name
    const selectedStore = storeList.find((store) => store.id.toString() === formData.Store); // Convert to string for comparison
    const storeName = selectedStore ? selectedStore.storeName : "";
  
    if (!storeName) {
      Swal.fire({
        icon: "error",
        title: "Invalid Store",
        text: "Selected store is invalid.",
        confirmButtonText: "OK",
      });
      return;
    }
  
    try {
      // Proceed with form submission
      const form = new FormData();
      form.append("Name", formData.Name);
      form.append("Email", formData.Email);
      form.append("UserName", formData.UserName);
      form.append("Password", formData.Password);
      form.append("Type", formData.Type);
      form.append("Store", storeName); // Send storeName directly
      if (formData.Image) {
        form.append("Image", formData.Image);
      }
  
      const response = await axios.post("http://localhost:5000/create-user", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "User Created",
          text: "User account created successfully!",
          confirmButtonText: "OK",
          timer: 3000,
        });
        setShowAddUserModal(false); // Close modal on success
        setFormData({
          Name: "",
          Email: "",
          UserName: "",
          Password: "",
          Image: null,
          Type: "user",
          Store: "",
        }); // Reset form
      }
    } catch (error) {
      console.error("Error creating user:", error);
      const errorMessage = error.response?.data?.message || "Failed to create user.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonText: "OK",
      });
    }
  };
  

  return (
    <div className="user-management-panel">
      {/* Display user info */}
      <div id="user-info" style={{ display: "none" }}>
        <p>
          <strong>Username:</strong> {UserName}
        </p>
        <p>
          <strong>Store:</strong> {Store}
        </p>
        <p>
          <strong>Email:</strong> {Email}
        </p>
        <p>
          <strong>Last Login:</strong> {LastLogin || "N/A"}
        </p>
      </div>

      <div className="button-list">
        <button onClick={() => setShowAddUserModal(true)}>
          <FontAwesomeIcon className="button-icon" icon={faUserPlus} />
          Add User
        </button>
        <button onClick={toggleManageUser}>
          <FontAwesomeIcon className="button-icon" icon={faClipboardList} />
          Manage Users
        </button>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div id="add-user-modal">
          <div id="modal-content-user-model">
            <h3>Add New User</h3>
            <form id="add-user-form" onSubmit={handleSubmit}>
              <label htmlFor="name-input">Name</label>
              <input
                id="name-input"
                type="text"
                name="Name"
                autoComplete="off"
                value={formData.Name}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="email-input">Email</label>
              <input
                id="email-input"
                type="email"
                autoComplete="off"
                name="Email"
                value={formData.Email}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="username-input">Username</label>
              <input
                id="username-input"
                type="text"
                autoComplete="off"
                name="UserName"
                value={formData.UserName}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="password-input">Password</label>
              <input
                id="password-input"
                type="password"
                name="Password"
                autoComplete="off"
                value={formData.Password}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="store-select">Store</label>
              <select
                id="store-select-user-management"
                name="Store"
                value={formData.Store} // Ensure this holds the selected store ID
                onChange={handleInputChange} // Updates the formData.Store value
                required
              >
                <option value="" disabled>
                  Select a Store
                </option>
                {storeList.map((store) => (
                  <option key={store.id} value={store.id}>
                    {" "}
                    {/* Pass store.id here */}
                    {store.storeName}
                  </option>
                ))}
              </select>

              <label htmlFor="image-input">Profile Image</label>
              <input
                id="image-input"
                type="file"
                name="Image"
                accept="image/*"
                onChange={handleFileChange}
              />

              <div id="modal-buttons-user-model">
                <button type="submit" id="submit-button-user-model">
                  Submit
                </button>
                <button
                  type="button"
                  id="cancel-button-user-model"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Users Panel */}
      {activeContent === "ManageUser" && <ManageUser />}
    </div>
  );
};

export default UserManagement;
