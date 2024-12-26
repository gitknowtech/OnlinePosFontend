import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "../css/CompanySetup.css";




const AdminAccount = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // Store image preview URL
  const [adminData, setAdminData] = useState({
    Name: "",
    Email: "",
    UserName: "",
    Password: "",
  });
  const [loading, setLoading] = useState(false); // To handle loading state

  const navigate = useNavigate();


  
  // Function to handle image selection
  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const imageFile = event.target.files[0];
      setSelectedImage(imageFile); // Store the selected image file

      // Generate image preview URL
      const previewUrl = URL.createObjectURL(imageFile);
      setImagePreview(previewUrl); // Set the preview URL
    }
  };

  // Clean up image preview URL when component is unmounted or image changes
  useEffect(() => {
    // Revoke object URL to prevent memory leaks
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Function to handle input change
  const handleChange = (e) => {
    setAdminData({
      ...adminData,
      [e.target.id]: e.target.value,
    });
  };

  // Function to validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading state

    try {
      // Validate form inputs
      if (!adminData.Name || !adminData.Email || !adminData.UserName || !adminData.Password) {
        Swal.fire({
          icon: "warning",
          title: "Incomplete Details",
          text: "All fields are required. Please fill in all details.",
          confirmButtonText: "OK",
          timer: 3000,
        });
        return;
      }

      // Check if the email is valid
      if (!validateEmail(adminData.Email)) {
        Swal.fire({
          icon: "error",
          title: "Invalid Email Format",
          text: "Please enter a valid email address.",
          confirmButtonText: "OK",
          timer: 3000,
        });
        return;
      }

      // Check if the password is at least 6 characters long
      if (adminData.Password.length < 6) {
        Swal.fire({
          icon: "error",
          title: "Weak Password",
          text: "Password must be at least 6 characters long.",
          confirmButtonText: "OK",
          timer: 3000,
        });
        return;
      }

      // Check for duplicate email or username by making a GET request
      const checkResponse = await axios.get("http://localhost:5000/check-duplicate", {
        params: { Email: adminData.Email, UserName: adminData.UserName },
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

      // Create FormData to send text and file together
      const formData = new FormData();
      formData.append("Name", adminData.Name);
      formData.append("Email", adminData.Email);
      formData.append("UserName", adminData.UserName);
      formData.append("Password", adminData.Password);
      formData.append("Image", selectedImage); // Append the image file

      // Make a POST request to the backend to save the data
      const response = await axios.post("http://localhost:5000/create-admin", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Admin Created",
          text: "Admin account created successfully!",
          confirmButtonText: "OK",
          timer: 3000,
        }).then(() => {
          navigate("/login-user");
        });

        // Optionally reset the form
        setAdminData({ Name: "", Email: "", UserName: "", Password: "" });
        setSelectedImage(null); // Clear the selected image
        setImagePreview(null); // Clear image preview
      } else {
        throw new Error("Something went wrong while saving the admin data.");
      }
    } catch (error) {
      // Handle different error cases and display appropriate error message
      if (error.response && error.response.data) {
        Swal.fire({
          icon: "error",
          title: "API Error",
          text: error.response.data,
          confirmButtonText: "OK",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
          confirmButtonText: "OK",
        });
      }
      console.error("Error saving admin data:", error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="container">
      {/* Left side: logo and text */}
      <div className="left-side">
        <img
          src="../src/assets/images/posimage.png"
          alt="POS Logo"
          className="logo"
        />
        <h1 className="pos-title">POS (Point Of Sale System)</h1>
        <h2 className="pos-version">V-1.0</h2>
      </div>

      {/* Right side: form section */}
      <div className="right-side">
        <form action="" className="pos-form" onSubmit={handleSubmit}>
          <h2>Admin Account</h2>
          <div className="form-group">
            <label htmlFor="Name">Full Name:</label>
            <input
              type="text"
              id="Name"
              placeholder="Enter Full Name"
              value={adminData.Name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="Email">Email:</label>
            <input
              type="email"
              id="Email"
              placeholder="Enter Email"
              value={adminData.Email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="UserName">User Name:</label>
            <input
              type="text"
              id="UserName"
              placeholder="Enter User Name"
              value={adminData.UserName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="Password">Password:</label>
            <input
              type="password"
              id="Password"
              placeholder="Enter Password"
              value={adminData.Password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Image upload */}
          <div className="form-group">
            <label htmlFor="logo-upload">Admin Photo:</label>
            <input
              type="file"
              id="logo-upload"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="logo-preview">
                <img src={imagePreview} alt="Selected Logo" />
              </div>
            )}
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Processing..." : "Submit & Continue"}
          </button>

          {/* Footer Text */}
          <div className="footer-text">
            <p>@2024 POS (Point of Sale System) v 1.0</p>
            <p>Design & Developed by Gitknow Software Solution</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAccount;
