// UserSetting.jsx

import { useState, useEffect } from "react";
import axios from "axios";
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
      setLoading(true);
      setError("");
      try {
        const response = await axios.get("http://localhost:5000/api/users");
        // Extract the 'users' array from the response
        setUsernames(response.data.users);
      } catch (error) {
        console.error("Error fetching usernames:", error);
        setError("Failed to fetch usernames.");
      } finally {
        setLoading(false);
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

    try {
      // Send PUT request to update the value in the backend
      const response = await axios.put(
        `http://localhost:5000/api/settings/${selectedUser}/${id}`,
        {
          value: newValue,
        }
      );

      // Check if the update was successful
      if (response.status === 200) {
        // Update the local state to reflect the change
        setUserSettings((prevSettings) =>
          prevSettings.map((setting) =>
            setting.id === id ? { ...setting, value: newValue } : setting
          )
        );
      } else {
        throw new Error(response.data.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error updating setting value:", error);
      setError(`Failed to update setting ID ${id}. Please try again.`);
    }
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
          disabled={loading}
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
          <p>Loading...</p>
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
                    className={`setting-value ${setting.value}`}
                    title="Double-click to toggle value"
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
