import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../css/UnitModel.css"; // Import the updated CSS
import placeholderImage from "../assets/images/unit.png"; // Placeholder image

export default function UnitModel({ UserName, store }) {
  const [unitName, setUnitName] = useState("");
  const [units, setUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Items per page
  const [editingUnitId, setEditingUnitId] = useState(null);
  const [editedUnitName, setEditedUnitName] = useState("");

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await axios.get("http://154.26.129.243:5000/api/units/get_units");
        setUnits(response.data);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error fetching units",err,
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

    try {
      const response = await axios.post(
        "http://154.26.129.243:5000/api/units/create_units",
        {
          unitName,
          user: UserName,
          store,
        }
      );

      if (response.status === 201) {
        const newUnit = {
          id: response.data.id,
          unitName,
          user: UserName,
          store,
        };

        setUnits([...units, newUnit]);
        setUnitName("");

        Swal.fire({
          icon: "success",
          title: "Unit Saved",
          text: "Unit has been added successfully!",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error Saving Unit",
        text: error.response?.data?.message || "Error saving unit",
      });
    }
  };

  const handleEditClick = (unitId, unitName) => {
    setEditingUnitId(unitId);
    setEditedUnitName(unitName);
  };

  const handleUpdateClick = async (unitId) => {
    try {
      const response = await axios.put(
        `http://154.26.129.243:5000/api/units/update_unit/${unitId}`,
        { unitName: editedUnitName }
      );

      if (response.status === 200) {
        setUnits(
          units.map((unit) =>
            unit.id === unitId ? { ...unit, unitName: editedUnitName } : unit
          )
        );
        setEditingUnitId(null);
        Swal.fire({
          icon: "success",
          title: "Unit Updated",
          text: "Unit has been updated successfully!",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error Updating Unit",
        text: `Error updating unit: ${error.response?.data.message || error.message}`,
      });
    }
  };

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
            "http://154.26.129.243:5000/api/units/delete_unit",
            {
              data: { unitName },
            }
          );

          if (response.status === 200) {
            setUnits(units.filter((unit) => unit.unitName !== unitName));
            Swal.fire("Deleted!", `Unit "${unitName}" has been deleted.`, "success");
          }
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: `Failed to delete unit: ${err.response?.data?.message || err.message}`,
          });
        }
      }
    });
  };

  const filteredUnits = units.filter((unit) =>
    unit.unitName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUnits = filteredUnits.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="unit-model">
      <div className="unit-form">
        <input
          type="text"
          placeholder="Enter unit name"
          value={unitName}
          onChange={(e) => setUnitName(e.target.value)}
        />
        <button onClick={handleSave}>Save</button>
        <input
          type="text"
          placeholder="Search unit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="unit-model-search-box"
        />
      </div>

      <div style={{marginTop:"20px"}} className="unit-cards">
        {currentUnits.map((unit) => (
          <div className="unit-card" key={unit.id}>
            <img
              src={placeholderImage}
              alt="Unit"
              className="unit-image"
            />
            {editingUnitId === unit.id ? (
              <input
                type="text"
                value={editedUnitName}
                onChange={(e) => setEditedUnitName(e.target.value)}
                className="edit-input"
              />
            ) : (
              <h4>{unit.unitName}</h4>
            )}
            <div className="unit-actions">
              {editingUnitId === unit.id ? (
                <button className="update-button" onClick={() => handleUpdateClick(unit.id)}>Update</button>
              ) : (
                <button className="edit-button" onClick={() => handleEditClick(unit.id, unit.unitName)}>Edit</button>
              )}
              <button className="delete-button" onClick={() => handleDelete(unit.unitName)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        {Array.from({ length: Math.ceil(filteredUnits.length / itemsPerPage) }).map((_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={currentPage === index + 1 ? "active" : ""}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

UnitModel.propTypes = {
  UserName: PropTypes.string.isRequired,
  store: PropTypes.string.isRequired,
};
