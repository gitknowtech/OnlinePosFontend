import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2
import "../css/BatchModel.css"; // Ensure to create a corresponding CSS file

export default function BatchModel({ UserName, store }) {
  const [batchName, setBatchName] = useState("");
  const [batches, setBatches] = useState([]);
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [editedBatchName, setEditedBatchName] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [batchesPerPage] = useState(8); // Number of batches per page

  // Fetch batches when the component mounts
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/batches/get_batches");
        setBatches(response.data);
      } catch (err) {
        console.error("Error fetching batches:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error fetching batches",
        });
      }
    };
    fetchBatches();
  }, []);

  const handleSave = async () => {
    if (batchName.trim() === "") {
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
          user: UserName,
          store,
          saveTime: new Date().toISOString(), // Add save time
        };

        setBatches([...batches, newBatch]);
        setBatchName(""); // Clear the input
        setError("");

        Swal.fire({
          icon: "success",
          title: "Batch Saved",
          text: "Batch has been added successfully!",
        });
      } else {
        throw new Error("Failed to save batch");
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
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to update this batch?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "No, cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
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
              text: "Batch and related products have been updated successfully!",
            });
          }
        } catch (error) {
          if (error.response && error.response.status === 400 && error.response.data.message === 'Batch name already available') {
            Swal.fire({
              icon: "error",
              title: "Duplicate Entry",
              text: "The batch name already exists. Please choose a different name.",
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: `Error updating batch: ${error.message}`,
            });
          }
        }
      }
    });
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
            text: `Failed to delete batch: ${err.response?.data?.message || err.message}`,
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
        <label htmlFor="batchName">Batch Name</label>
        <input
          type="text"
          id="batchName"
          autoComplete="off"
          value={batchName}
          onChange={(e) => setBatchName(e.target.value)}
          placeholder="Enter batch name"
        />
        {error && <p className="error-message">{error}</p>}

        <div className="button-group">
          <button className="saveButton" onClick={handleSave}>
            Save
          </button>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search batch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="batch-grid">
        <table>
          <thead id="batch-grid-batch-model">
            <tr>
              <th>No</th>
              <th>Batch Name</th>
              <th>User</th>
              <th>Store</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentBatches.map((batch, index) => (
              <tr key={batch.id}>
                <td>{indexOfFirstBatch + index + 1}</td>
                <td>
                  {editingBatchId === batch.id ? (
                    <input
                      type="text"
                      value={editedBatchName}
                      onChange={(e) => setEditedBatchName(e.target.value)}
                    />
                  ) : (
                    batch.batchName
                  )}
                </td>
                <td>{batch.user}</td>
                <td>{batch.store}</td>
                <td className="button-td">
                  {editingBatchId === batch.id ? (
                    <button
                      className="update-button"
                      onClick={() => handleUpdateClick(batch.id)}
                    >
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
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(batch.batchName)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
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
    </div>
  );
}

// Validate props with PropTypes
BatchModel.propTypes = {
  UserName: PropTypes.string.isRequired,
  store: PropTypes.string.isRequired,
};
