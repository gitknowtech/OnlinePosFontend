import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../css/UnitModel.css"; // Assuming a separate CSS file for UnitModel

export default function UnitModel({ UserName, store }) {
  const [unitName, setUnitName] = useState("");
  const [units, setUnits] = useState([]);
  const [error, setError] = useState("");
  const [saveStoreAsAll, setSaveStoreAsAll] = useState(false); // State to manage checkbox status
  const [searchTerm, setSearchTerm] = useState(""); // State for search functionality
  const [currentPage, setCurrentPage] = useState(1); // For pagination
  const itemsPerPage = 8; // Number of items to display per page
  const [editingUnitId, setEditingUnitId] = useState(null); // State to track the unit being edited
  const [editedUnitName, setEditedUnitName] = useState("");

  // Fetch units when the component mounts
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/get_units");
        setUnits(response.data);
      } catch (err) {
        console.error("Error fetching units:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error fetching units",
        });
      }
    };
    fetchUnits();
  }, []);

  const handleSave = async () => {
    if (unitName.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Unit name cannot be empty!",
      });
      return;
    }

    const isDuplicate = units.some(
      (unit) => unit.unitName.toLowerCase() === unitName.toLowerCase()
    );

    if (isDuplicate) {
      Swal.fire({
        icon: "error",
        title: "Duplicate Unit",
        text: "Unit name already exists!",
      });
      return;
    }

    const now = new Date();
    const saveTime = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(
      now.getHours()
    ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(
      now.getSeconds()
    ).padStart(2, "0")}`;

    try {
      const storeValue = saveStoreAsAll ? "all" : store; // If checkbox is checked, store as "all"

      const response = await axios.post(
        "http://localhost:5000/api/create_units",
        {
          unitName: unitName,
          user: UserName,
          store: storeValue,
          saveTime,
        }
      );

      if (response.status === 201) {
        const newUnit = {
          id: response.data.id,
          unitName: unitName,
          user: UserName,
          store: storeValue,
          saveTime: saveTime,
        };

        setUnits([...units, newUnit]); // Update the table with the new unit
        setUnitName(""); // Clear the input
        setError("");
        setSaveStoreAsAll(false); // Reset checkbox after saving

        Swal.fire({
          icon: "success",
          title: "Unit Saved",
          text: "Unit has been added successfully!",
        });
      } else {
        throw new Error("Failed to save unit");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        Swal.fire({
          icon: "error",
          title: "Error Saving Unit",
          text: error.response.data.message,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `Error saving unit: ${error.message}`,
        });
      }
    }
  };

  // Function to handle the editing of a unit
  const handleEditClick = (unitId, unitName) => {
    setEditingUnitId(unitId); // Set the unit being edited
    setEditedUnitName(unitName); // Initialize the edited name with the current name
  };

  const handleUpdateClick = async (unitId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/update_unit/${unitId}`,
        {
          unitName: editedUnitName,
        }
      );

      if (response.status === 200) {
        // Update the unit in the state
        setUnits(
          units.map((unit) =>
            unit.id === unitId ? { ...unit, unitName: editedUnitName } : unit
          )
        );
        setEditingUnitId(null); // Reset the editing state
        Swal.fire({
          icon: "success",
          title: "Unit Updated",
          text: "Unit has been updated successfully!",
        });
      } else {
        throw new Error("Failed to update unit");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error Updating Unit",
        text: `Error updating unit: ${error.message}`,
      });
    }
  };

  // Function to handle the deletion of a unit
  const handleDelete = async (unitName) => {
    Swal.fire({
      title: `Are you sure you want to delete unit "${unitName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(
            "http://localhost:5000/api/delete_unit",
            {
              data: { unitName }, // Send unit name in the body of the delete request
            }
          );

          if (response.status === 200) {
            // Remove the deleted unit from the state to update the UI
            setUnits(units.filter((unit) => unit.unitName !== unitName));

            Swal.fire(
              "Deleted!",
              `Unit "${unitName}" has been deleted.`,
              "success"
            );
          }
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: `Failed to delete unit: ${
              err.response?.data?.message || err.message
            }`,
          });
        }
      }
    });
  };

  // Pagination and search logic
  const filteredUnits = units.filter((unit) =>
    unit.unitName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUnits = filteredUnits.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="unit-model">
      <div className="unit-form">
        <label htmlFor="unitName">Unit Name</label>
        <input
          type="text"
          id="unitName"
          value={unitName}
          onChange={(e) => setUnitName(e.target.value)}
          placeholder="Enter unit name"
        />
        {error && <p className="error-message">{error}</p>}

        {/* Checkbox to save store as "all" */}
        <div className="check-box">
          <input
            type="checkbox"
            id="allowStore"
            checked={saveStoreAsAll}
            onChange={(e) => setSaveStoreAsAll(e.target.checked)}
          />
          <label htmlFor="allowStore">All Store</label>
        </div>

        <div className="button-group">
          <button onClick={handleSave}>Save</button>
        </div>

        {/* Search box */}
        <div className="search-box">
          <input
            type="text"
            placeholder="Search unit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FontAwesomeIcon icon="search" className="search-icon" />
        </div>
      </div>

      <div className="unit-grid">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Unit Name</th>
              <th>User</th>
              <th>Store</th>
              <th>Added Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUnits.map((unit, index) => (
              <tr key={unit.id}>
                <td>{indexOfFirstItem + index + 1}</td>

                <td>
                  {editingUnitId === unit.id ? (
                    <input
                      type="text"
                      value={editedUnitName}
                      onChange={(e) => setEditedUnitName(e.target.value)}
                    />
                  ) : (
                    unit.unitName
                  )}
                </td>

                <td>{unit.user}</td>
                <td>{unit.store}</td>
                <td>{unit.saveTime}</td>
                <td className="button-td">
                  {editingUnitId === unit.id ? (
                    <button
                      className="update-button"
                      onClick={() => handleUpdateClick(unit.id)}
                    >
                      Update
                    </button>
                  ) : (
                    <button
                      className="edit-button"
                      onClick={() => handleEditClick(unit.id, unit.unitName)}
                    >
                      Edit
                    </button>
                  )}

                  <button
                    className="delete-button"
                    onClick={() => handleDelete(unit.unitName)}
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
          {Array.from({
            length: Math.ceil(filteredUnits.length / itemsPerPage),
          }).map((_, index) => (
            <button
              key={index}
              className={currentPage === index + 1 ? "active" : ""}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Validate props with PropTypes
UnitModel.propTypes = {
  UserName: PropTypes.string.isRequired,
  store: PropTypes.string.isRequired,
};
