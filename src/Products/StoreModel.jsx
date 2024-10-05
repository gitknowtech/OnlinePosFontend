import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../css/StoreModel.css"; // Assuming a CSS file for styling

export default function StoreModel({ UserName, store }) {
  const [storeName, setStoreName] = useState("");
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false); // Disable buttons during API calls

  // Fetch stores when the component loads
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/get_stores"
        );
        setStores(response.data);
      } catch (error) {
        console.error("Error fetching stores: ", error);
      }
    };
    fetchStores();
  }, []);

  // Add new store
  const handleSave = async () => {
    if (storeName.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Store name cannot be empty!",
      });
      return;
    }

    // Check for duplicate store name
    const isDuplicate = stores.some(
      (existingStore) =>
        existingStore.storeName.toLowerCase() === storeName.toLowerCase()
    );

    if (isDuplicate) {
      Swal.fire({
        icon: "error",
        title: "Duplicate Store",
        text: "Store name already exists!",
      });
      return;
    }

    try {
      setLoading(true); // Disable buttons during API calls
      const response = await axios.post(
        "http://localhost:5000/api/create_store",
        {
          storeName,
          user: UserName,
          store,
        }
      );

      if (response.status === 201) {
        const newStore = {
          id: response.data.id,
          storeName,
          user: UserName,
          store,
        };
        setStores([...stores, newStore]);
        setStoreName(""); // Clear the input
        Swal.fire({
          icon: "success",
          title: "Store Added",
          text: "Store has been added successfully!",
        });
      } else {
        throw new Error("Failed to save store");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Error saving store: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  

  // Delete store
  const handleDelete = async (storeId, storeName) => {
    Swal.fire({
      title: `Are you sure you want to delete store "${storeName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(
            `http://localhost:5000/api/delete_store/${storeId}`
          );

          if (response.status === 200) {
            setStores(stores.filter((store) => store.id !== storeId));
            Swal.fire(
              "Deleted!",
              `Store "${storeName}" has been deleted.`,
              "success"
            );
          }
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: `Failed to delete store: ${error.message}`,
          });
        }
      }
    });
  };

  return (
    <div className="store-model">
      <div className="store-form">
        <label htmlFor="storeName">Store Name</label>
        <input
          type="text"
          id="storeName"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          placeholder="Enter store name"
        />

        <div className="button-group">
          <button className="save-button" onClick={handleSave} disabled={loading}>
            Save Store
          </button>
        </div>
      </div>

      <div className="store-list">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Store Name</th>
              <th>User</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store, index) => (
              <tr key={store.id}>
                <td>{index + 1}</td>
                <td>{store.storeName}</td> {/* Corrected this part */}
                <td>{store.user}</td>
                <td className="button-td">
                  <button className="delete-button"
                    onClick={() => handleDelete(store.id, store.storeName)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Validate props with PropTypes
StoreModel.propTypes = {
  UserName: PropTypes.string.isRequired,
  store: PropTypes.string.isRequired,
};
