import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom"; 
import "../css/CompanySetup.css";

const UserLogin = () => {
  const [loginData, setLoginData] = useState({
    UserName: "",
    Password: "",
  });
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate(); 

  // Function to handle input change
  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.id]: e.target.value,
    });
  };

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });

  // Function to handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 

    try {
      if (!loginData.UserName || !loginData.Password) {
        Swal.fire({
          icon: "warning",
          title: "Incomplete Details",
          text: "Please enter both username and password.",
          confirmButtonText: "OK",
          timer: 3000,
        });
        setLoading(false);
        return;
      }

      // Make a POST request to the backend for login
      const response = await axios.post("http://localhost:5000/login", loginData);

      if (response.status === 200 && response.data.success) {
        // Destructure the additional data (Username, Image, Type, Store) from the response
        const { UserName, Image, Store, Type, Email, LastLogin } = response.data.user;

        Toast.fire({
  icon: "success",
  title: "Signed in successfully"
}).then(() => {
  // Pass Username, Image, Store, and Type as state to Dashboard
  navigate("/dashboard", { 
    state: { UserName, Image, Store, Type, Email, LastLogin } 
  });
});
      } else {
        throw new Error(response.data.message || "Login failed. Please try again.");
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "You entered an incorrect username or password.",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="container">
      <div className="left-side">
        <img src="../src/assets/images/posimage.png" alt="POS Logo" className="logo" />
        <h1 className="pos-title">POS (Point Of Sale System)</h1>
        <h2 className="pos-version">V-1.0</h2>
      </div>
      <div className="right-side">
        <form className="pos-form" onSubmit={handleSubmit}>
          <h2>User Login</h2>
          <div className="form-group">
            <label htmlFor="UserName">User Name:</label>
            <input
              type="text"
              id="UserName"
              placeholder="Enter User Name"
              value={loginData.UserName}
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
              value={loginData.Password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserLogin;
