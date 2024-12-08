import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../css1/UserSetting.css"; // Ensure the path is correct

const UserSetting = () => {
  const [usernames, setUsernames] = useState([]); // List of usernames
  const [selectedUser, setSelectedUser] = useState(""); // Selected username
  const [userSettings, setUserSettings] = useState([]); // User-specific table data
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error message

  // Fetch usernames on component mount
  useEffect(() => {
    const fetchUsernames = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users");
        setUsernames(response.data);
      } catch (error) {
        console.error("Error fetching usernames:", error);
        setError("Failed to fetch usernames.");
      }
    };

    fetchUsernames();
  }, []);

  // Fetch user-specific table data
  const fetchUserSettings = async (username) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`http://localhost:5000/api/settings/${username}`);
      setUserSettings(response.data);
    } catch (error) {
      console.error("Error fetching user settings:", error);
      setError(`Failed to fetch settings for ${username}.`);
      setUserSettings([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle user selection change
  const handleUserChange = (event) => {
    const username = event.target.value;
    setSelectedUser(username);
    if (username) {
      fetchUserSettings(username);
    } else {
      setUserSettings([]);
    }
  };

  // Toggle the value of a setting on double-click
  const toggleValue = async (id, currentValue) => {
    const newValue = currentValue === "yes" ? "no" : "yes";

    // Confirmation using SweetAlert2
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to change this value to "${newValue}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Send PUT request to update the value in the backend
          await axios.put(`http://localhost:5000/api/settings/${selectedUser}/${id}`, {
            value: newValue,
          });

          // Update the local state to reflect the change
          setUserSettings((prevSettings) =>
            prevSettings.map((setting) =>
              setting.id === id ? { ...setting, value: newValue } : setting
            )
          );

          // Success message using SweetAlert2
          Swal.fire("Updated!", `The value has been changed to "${newValue}".`, "success");
        } catch (error) {
          console.error("Error updating setting value:", error);

          // Error message using SweetAlert2
          Swal.fire("Error!", "Failed to update the value. Please try again.", "error");
        }
      }
    });
  };

  return (
    <div id="user-setting-panel-user-setting">
      <h2>User Settings</h2>

      {/* Combobox for selecting username */}
      <div id="user-selection-user-setting">
        <label htmlFor="userDropdown-user-setting">Select User:</label>
        <select
          id="userDropdown-user-setting"
          value={selectedUser}
          onChange={handleUserChange}
        >
          <option value="">-- Select a User --</option>
          {usernames.map((user) => (
            <option key={user.UserName} value={user.UserName}>
              {user.UserName}
            </option>
          ))}
        </select>
      </div>

      {/* Display settings table */}
      <div id="settings-table-user-setting">
        {loading ? (
          <p>Loading settings...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : userSettings.length > 0 ? (
          <table id="settings-table-user-setting-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Setting Name</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {userSettings.map((setting) => (
                <tr key={setting.id}>
                  <td>{setting.id}</td>
                  <td>{setting.name}</td>
                  <td
                    onDoubleClick={() => toggleValue(setting.id, setting.value)}
                    id={`setting-value-${setting.id}-user-setting`}
                    style={{
                      cursor: "pointer",
                      color: "white",
                      backgroundColor:
                        setting.value === "yes" ? "green" : "red",
                      textAlign: "center",
                      padding: "8px",
                    }}
                  >
                    {setting.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : selectedUser ? (
          <p>No settings found for {selectedUser}.</p>
        ) : (
          <p>Select a user to view settings.</p>
        )}
      </div>
    </div>
  );
};

export default UserSetting;
