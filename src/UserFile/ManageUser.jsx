import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import deleteImage from "../assets/icons/bin.png";
import viewImage from "../assets/icons/view.png";
import editImage from "../assets/icons/edit.png";
import "../css1/ManageUser.css";

const ManageUser = () => {
  const [users, setUsers] = useState([]); // User data
  const [editUser, setEditUser] = useState(null); // User being edited
  const [updatedData, setUpdatedData] = useState({
    Email: "",
    Password: "",
  }); // Updated email and password

  // Fetch user data on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://154.26.129.243:5000/api/users/get_users_new");
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

  // Open edit modal and populate the fields
  const handleEdit = (user) => {
    setEditUser(user);
    setUpdatedData({
      Email: user.Email,
      Password: "",
    });
  };

  // Handle input change in the edit modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = async (user) => {
    try {
      const response = await axios.get(
        `http://154.26.129.243:5000/api/users/get_password/${user.UserName}`
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


  // Submit updated data
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://154.26.129.243:5000/api/users/update_user/${editUser.UserName}`,
        updatedData
      );

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "User updated successfully.",
        });
        fetchUsers(); // Refresh user list
        setEditUser(null); // Close modal
      }
    } catch (error) {
      console.error("Error updating user:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to update user.",
      });
    }
  };


  // Delete user
  const handleDelete = async (userName) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the user.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(
            `http://154.26.129.243:5000/delete_user/${userName}`
          );
  
          if (response.status === 200) {
            Swal.fire({
              icon: "success",
              title: "Deleted",
              text: "User has been deleted successfully.",
            });
            fetchUsers(); // Refresh user list
          }
        } catch (error) {
          console.error("Error deleting user:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.response?.data?.message || "Failed to delete user.",
          });
        }
      }
    });
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
              <td style={{width:"70px"}}>
                <div className="action-icons-manage-user">
                  <button
                    className="edit-button-manage-user"
                    title="Edit User"
                    onClick={() => handleEdit(user)}
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

      {/* Edit User Modal */}
      {editUser && (
        <div id="edit-user-modal">
          <div id="modal-content-edit-user">
            <h3>Edit User</h3>
            <form onSubmit={handleUpdate}>
              <label>Email</label>
              <input
                type="email"
                name="Email"
                value={updatedData.Email}
                onChange={handleInputChange}
                required
              />

              <label>New Password</label>
              <input
                type="password"
                name="Password"
                value={updatedData.Password}
                onChange={handleInputChange}
              />

              <div id="modal-buttons-edit-user">
                <button type="submit" id="submit-button-edit-user">
                  Update
                </button>
                <button
                  type="button"
                  id="cancel-button-edit-user"
                  onClick={() => setEditUser(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUser;
