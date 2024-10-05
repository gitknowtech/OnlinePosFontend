import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2
import "../css/CompanySetup.css";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const CompanySetup = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [companyData, setCompanyData] = useState({
    Comid: "",
    Comname: "",
    Mobile: "",
    Location: "",
    Email: "",
  });

  const navigate = useNavigate();

  // Function to handle image selection
  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]); // Store the image file
    }
  };

  // Function to handle input change
  const handleChange = (e) => {
    setCompanyData({
      ...companyData,
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

    try {
      // Validate form inputs
      if (!companyData.Comid || !companyData.Comname || !companyData.Mobile || !companyData.Location || !companyData.Email) {
        return Swal.fire({
          icon: 'warning',
          title: 'Incomplete Details',
          text: 'All fields are required. Please fill in all details.',
          confirmButtonText: 'OK',
          timer: 3000,
        });
      }

      if (!selectedImage) {
        return Swal.fire({
          icon: 'warning',
          title: 'No Image Selected',
          text: 'Please upload a company logo.',
          confirmButtonText: 'OK',
          timer: 3000,
        });
      }

      // Check if the email format is valid
      if (!validateEmail(companyData.Email)) {
        return Swal.fire({
          icon: 'error',
          title: 'Invalid Email Format',
          text: 'Please enter a valid email address.',
          confirmButtonText: 'OK',
          timer: 3000,
        });
      }

      // Check if the mobile number has exactly 10 digits
      if (!/^\d{10}$/.test(companyData.Mobile)) {
        return Swal.fire({
          icon: 'error',
          title: 'Invalid Mobile Number',
          text: 'Mobile number must be exactly 10 digits.',
          confirmButtonText: 'OK',
          timer: 3000,
        });
      }

      // Create FormData to send text and file together
      const formData = new FormData();
      formData.append("Comid", companyData.Comid);
      formData.append("Comname", companyData.Comname);
      formData.append("Mobile", companyData.Mobile);
      formData.append("Location", companyData.Location);
      formData.append("Email", companyData.Email);
      formData.append("Image", selectedImage);

      // Make a POST request to the backend to save the data
      const response = await axios.post("http://localhost:5000/companies", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Success case: Redirect to AdminAccount and show a success message
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Company added successfully!",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/admin-account");
        });
      } else {
        throw new Error("Something went wrong while saving the company data.");
      }

    } catch (error) {
      // Handle different error cases and display appropriate error message using SweetAlert2
      if (error.response && error.response.data) {
        Swal.fire({
          icon: 'error',
          title: 'API Error',
          text: error.response.data,
          confirmButtonText: 'OK',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message,
          confirmButtonText: 'OK',
        });
      }
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
        <form className="pos-form" onSubmit={handleSubmit}>
          <h2>Company Setup</h2>
          <div className="form-group">
            <label htmlFor="Comid">Company ID:</label>
            <input
              type="text"
              id="Comid"
              placeholder="Enter Company ID"
              value={companyData.Comid}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="Comname">Company Name:</label>
            <input
              type="text"
              id="Comname"
              placeholder="Enter Company Name"
              value={companyData.Comname}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="Mobile">Mobile Number:</label>
            <input
              type="text"
              id="Mobile"
              placeholder="Enter Mobile Number"
              value={companyData.Mobile}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="Location">Location:</label>
            <input
              type="text"
              id="Location"
              placeholder="Enter Location"
              value={companyData.Location}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="Email">Email:</label>
            <input
              type="email"
              id="Email"
              placeholder="Enter Email Address"
              value={companyData.Email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Image upload */}
          <div className="form-group">
            <label htmlFor="logo-upload">Company Logo:</label>
            <input
              type="file"
              id="logo-upload"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            {selectedImage && (
              <div className="logo-preview">
                <img src={URL.createObjectURL(selectedImage)} alt="Selected Logo" />
              </div>
            )}
          </div>

          <button type="submit" className="submit-btn">
            Submit & Continue
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

export default CompanySetup;
