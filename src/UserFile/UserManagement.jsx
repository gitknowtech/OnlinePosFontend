import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation } from "react-router-dom"; // For accessing state
import {
  faUserPlus,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import "../css1/User.css";
import axios from "axios";
import Swal from "sweetalert2";
import ManageUser from "./ManageUser"; // Import the ManageUser component

const UserManagement = () => {
  const location = useLocation(); // Access the location state
  const { UserName, Store, Type, Email, LastLogin } = location.state || {}; // Destructure the passed state

  const [activeContent, setActiveContent] = useState(null); // Manage active content
  const [showAddUserModal, setShowAddUserModal] = useState(false); // Manage Add User Modal
  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    UserName: "",
    Password: "",
    Image: null,
    Type: "user", // Default user type
  }); // User form data

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

  // Handle Add User form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Check for duplicate email or username
      const checkResponse = await axios.get("http://localhost:5000/check-duplicate", {
        params: { Email: formData.Email, UserName: formData.UserName },
      });

      if (checkResponse.data.emailExists) {
        Swal.fire({
          icon: "error",
          title: "Email Already Exists",
          text: "This email address is already registered.",
          confirmButtonText: "OK",
          timer: 3000,
        });
        return;
      }

      if (checkResponse.data.usernameExists) {
        Swal.fire({
          icon: "error",
          title: "Username Already Exists",
          text: "This username is already taken. Please choose another.",
          confirmButtonText: "OK",
          timer: 3000,
        });
        return;
      }

      // If no duplicates, proceed with saving the user
      const form = new FormData();
      form.append("Name", formData.Name);
      form.append("Email", formData.Email);
      form.append("UserName", formData.UserName);
      form.append("Password", formData.Password);
      form.append("Type", formData.Type); // Append the user type
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
        setFormData({ Name: "", Email: "", UserName: "", Password: "", Image: null, Type: "user" }); // Reset form
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
                value={formData.Name}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="email-input">Email</label>
              <input
                id="email-input"
                type="email"
                name="Email"
                value={formData.Email}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="username-input">Username</label>
              <input
                id="username-input"
                type="text"
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
                value={formData.Password}
                onChange={handleInputChange}
                required
              />

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
