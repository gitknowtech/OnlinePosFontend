import historyImage from "../assets/images/errorImage.jpg"; // Ensure this path is correct
import "../css/ErrorAccess.css"; // Create a CSS file for styling if needed

const ErrorAccess = () => {
  return (
    <div id="error-access-wrapper">
      <div id="error-access-content">
        <img
          src={historyImage}
          alt="Access Denied"
          id="error-access-image"
        />
        <h2 id="error-access-title">Access Denied</h2>
        <p id="error-access-message">
          You do not have permission to access this section. Please contact your administrator.
        </p>
      </div>
    </div>
  );
};

export default ErrorAccess;
