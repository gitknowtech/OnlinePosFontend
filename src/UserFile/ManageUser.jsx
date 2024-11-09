import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import deleteImage from "../assets/icons/bin.png";
import viewImage from "../assets/icons/view.png";
import editImage from "../assets/icons/edit.png";
import "../css1/ManageUser.css";

const ManageUser = () => {
  const [users, setUsers] = useState([]); // User data
  const [visiblePasswords, setVisiblePasswords] = useState({}); // Track visibility of passwords

  // Fetch user data on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/users/get_users_new");
      setUsers(response.data.filter(user => user.Type !== "admin")); // Exclude admin users
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch users.",
      });
    }
  };

  const togglePasswordVisibility = async (user) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/users/get_password/${user.UserName}`
      );
      Swal.fire({
        title: "Decrypted Password",
        text: `Password: ${response.data.password}`,
        icon: "info",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Error fetching password:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch password.",
      });
    }
  };

  const handleDelete = async (userName) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: `This will permanently delete the user "${userName}".`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:5000/api/users/delete_user/${userName}`);
      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "User deleted successfully.",
      });
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error("Error deleting user:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to delete user.",
      });
    }
  };

  return (
    <div className="manage-user">
      <table id="user-table-manage-user">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Username</th>
            <th>Password</th>
            <th>Type</th>
            <th>Store</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.Name}</td>
              <td>{user.Email}</td>
              <td>{user.UserName}</td>
              <td>
                <button
                  className="view-button-manage-user"
                  onClick={() => togglePasswordVisibility(user)}
                >
                  <img src={viewImage} alt="View Password" className="icon-manage-user" />
                </button>
              </td>
              <td>{user.Type}</td>
              <td>{user.Store}</td>
              <td>
                <div className="action-icons-manage-user">
                  <button
                    className="edit-button-manage-user"
                    title="Edit User"
                    onClick={() => console.log(`Edit user: ${user.id}`)}
                  >
                    <img src={editImage} alt="Edit User" className="icon-manage-user" />
                  </button>
                  <button
                    className="delete-button-manage-user"
                    title="Delete User"
                    onClick={() => handleDelete(user.UserName)}
                  >
                    <img src={deleteImage} alt="Delete User" className="icon-manage-user" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUser;
