import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../css/storeModel.css"; // Import the CSS file
import storeImage from "../assets/images/store.png"; // Placeholder image for stores

export default function StoreModel({ UserName, store }) {
  const [storeName, setStoreName] = useState("");
  const [stores, setStores] = useState([]);
  const [editingStoreId] = useState(null);
  const [editedStoreName, setEditedStoreName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [storesPerPage] = useState(10);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/stores/get_stores");
        setStores(response.data);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error fetching stores",err,
        });
      }
    };
    fetchStores();
  }, []);

  const handleSave = async () => {
    if (!storeName.trim()) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Store name cannot be empty!",
      });
      return;
    }

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
      const response = await axios.post("http://localhost:5000/api/stores/create_store", {
        storeName,
        user: UserName,
        store,
      });

      if (response.status === 201) {
        const newStore = {
          id: response.data.id,
          storeName,
          user: UserName,
          storeImage: storeImage, // Add placeholder image
        };

        setStores([...stores, newStore]);
        setStoreName("");

        Swal.fire({
          icon: "success",
          title: "Store Saved",
          text: "Store has been added successfully!",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error Saving Store",
        text: error.response?.data?.message || "Error saving store",
      });
    }
  };

  {/*const handleEditClick = (storeId, storeName) => {
    setEditingStoreId(storeId);
    setEditedStoreName(storeName);
  };

  const handleUpdateClick = async (storeId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/stores/update_store/${storeId}`,
        { storeName: editedStoreName }
      );

      if (response.status === 200) {
        setStores(
          stores.map((store) =>
            store.id === storeId ? { ...store, storeName: editedStoreName } : store
          )
        );
        setEditingStoreId(null);
        Swal.fire({
          icon: "success",
          title: "Store Updated",
          text: "Store has been updated successfully!",
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        Swal.fire({
          icon: "error",
          title: "Duplicate Entry",
          text: "The store name already exists. Please choose a different name.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `Error updating store: ${error.message}`,
        });
      }
    }
  };

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
          const response = await axios.delete(`http://localhost:5000/api/stores/delete_store/${storeId}`);

          if (response.status === 200) {
            setStores(stores.filter((store) => store.id !== storeId));
            Swal.fire("Deleted!", `Store "${storeName}" has been deleted.`, "success");
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
  };*/}

  const filteredStores = stores.filter((store) =>
    store.storeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastStore = currentPage * storesPerPage;
  const indexOfFirstStore = indexOfLastStore - storesPerPage;
  const currentStores = filteredStores.slice(indexOfFirstStore, indexOfLastStore);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="store-model">
      <div className="store-form">
        <input
          type="text"
          autoComplete="off"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          placeholder="Enter store name"
        />
        <button className="save-button" onClick={handleSave}>
          Save
        </button>
        <div className="search-box">
          <input
            type="text"
            autoComplete="off"
            placeholder="Search store..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="store-cards">
        {currentStores.map((store) => (
          <div className="store-card" key={store.id}>
            <img
              src={store.storeImage || storeImage} // Use dynamic or placeholder image
              alt="Store"
              className="store-image"
            />
            {editingStoreId === store.id ? (
              <input
                type="text"
                value={editedStoreName}
                onChange={(e) => setEditedStoreName(e.target.value)}
                className="edit-input"
              />
            ) : (
              <h4>{store.storeName}</h4>
            )}
            <p>User: {store.user}</p>
           {/*} <div className="store-actions">
              {editingStoreId === store.id ? (
                <button className="update-button" onClick={() => handleUpdateClick(store.id)}>
                  Update
                </button>
              ) : (
                <button
                  className="edit-button"
                  onClick={() => handleEditClick(store.id, store.storeName)}
                >
                  Edit
                </button>
              )}
              <button
                className="delete-button"
                onClick={() => handleDelete(store.id, store.storeName)}
              >
                Delete
              </button>
            </div>*/}
          </div>
        ))}
      </div>

      <div className="pagination">
        {[...Array(Math.ceil(filteredStores.length / storesPerPage)).keys()].map((number) => (
          <button
            key={number + 1}
            onClick={() => paginate(number + 1)}
            className={currentPage === number + 1 ? "active" : ""}
          >
            {number + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

StoreModel.propTypes = {
  UserName: PropTypes.string.isRequired,
  store: PropTypes.string.isRequired,
};
