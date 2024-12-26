import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../css/BatchModel.css"; // Ensure the CSS file exists
import batchImage from "../assets/images/batch.png"; // Placeholder image for batches

export default function BatchModel({ UserName, store }) {
  const [batchName, setBatchName] = useState("");
  const [batches, setBatches] = useState([]);
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [editedBatchName, setEditedBatchName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [batchesPerPage] = useState(30); // Number of batches per page

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/batches/get_batches");
        setBatches(response.data);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error fetching batches",err
        });
      }
    };
    fetchBatches();
  }, []);

  const handleSave = async () => {
    if (!batchName.trim()) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Batch name cannot be empty!",
      });
      return;
    }

    const isDuplicate = batches.some(
      (batch) => batch.batchName.toLowerCase() === batchName.toLowerCase()
    );

    if (isDuplicate) {
      Swal.fire({
        icon: "error",
        title: "Duplicate Batch",
        text: "Batch name already exists!",
      });
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/batches/create_batches", {
        batchName,
        user: UserName,
        store,
      });

      if (response.status === 201) {
        const newBatch = {
          id: response.data.id,
          batchName,
          store,
          saveTime: new Date().toISOString().slice(0, 10), // Add save time (YYYY-MM-DD format)
        };

        setBatches([...batches, newBatch]);
        setBatchName(""); // Clear the input

        Swal.fire({
          icon: "success",
          title: "Batch Saved",
          text: "Batch has been added successfully!",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error Saving Batch",
        text: error.response?.data?.message || "Error saving batch",
      });
    }
  };

  const handleEditClick = (batchId, batchName) => {
    setEditingBatchId(batchId);
    setEditedBatchName(batchName);
  };

  const handleUpdateClick = async (batchId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/batches/update_batch/${batchId}`,
        { batchName: editedBatchName }
      );

      if (response.status === 200) {
        setBatches(
          batches.map((batch) =>
            batch.id === batchId ? { ...batch, batchName: editedBatchName } : batch
          )
        );
        setEditingBatchId(null);
        Swal.fire({
          icon: "success",
          title: "Batch Updated",
          text: "Batch has been updated successfully!",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Error updating batch",
      });
    }
  };

  const handleDelete = async (batchName) => {
    Swal.fire({
      title: `Are you sure you want to delete batch "${batchName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete("http://localhost:5000/api/batches/delete_batch", {
            data: { batchName },
          });

          if (response.status === 200) {
            setBatches(batches.filter((batch) => batch.batchName !== batchName));
            Swal.fire("Deleted!", `Batch "${batchName}" has been deleted.`, "success");
          }
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: err.response?.data?.message || "Failed to delete batch",
          });
        }
      }
    });
  };

  const filteredBatches = batches.filter((batch) =>
    batch.batchName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastBatch = currentPage * batchesPerPage;
  const indexOfFirstBatch = indexOfLastBatch - batchesPerPage;
  const currentBatches = filteredBatches.slice(indexOfFirstBatch, indexOfLastBatch);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="batch-model">
      <div className="batch-form">
        <input
          type="text"
          id="batchName"
          autoComplete="off"
          value={batchName}
          onChange={(e) => setBatchName(e.target.value)}
          placeholder="Enter batch name"
        />
        <button className="save-button" onClick={handleSave}>
          Save
        </button>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search batch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="batch-cards">
        {currentBatches.map((batch) => (
          <div className="batch-card" key={batch.id}>
            <img src={batchImage} alt="Batch" className="batch-image" />
            {editingBatchId === batch.id ? (
              <input
                type="text"
                value={editedBatchName}
                onChange={(e) => setEditedBatchName(e.target.value)}
                className="edit-input"
              />
            ) : (
              <h4>{batch.batchName}</h4>
            )}
            <p>Store: {batch.store}</p>
            <div className="batch-actions">
              {editingBatchId === batch.id ? (
                <button className="update-button" onClick={() => handleUpdateClick(batch.id)}>
                  Update
                </button>
              ) : (
                <button
                  className="edit-button"
                  onClick={() => handleEditClick(batch.id, batch.batchName)}
                >
                  Edit
                </button>
              )}
              <button className="delete-button" onClick={() => handleDelete(batch.batchName)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        {[...Array(Math.ceil(filteredBatches.length / batchesPerPage)).keys()].map((number) => (
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

BatchModel.propTypes = {
  UserName: PropTypes.string.isRequired,
  store: PropTypes.string.isRequired,
};
