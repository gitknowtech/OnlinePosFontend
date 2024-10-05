import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2
import "../css/CategoryModel.css";

export default function CategoryModel({ UserName, store }) {
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);
  const [editingCategoryId, setEditingCategoryId] = useState(null); // State to track the editing category
  const [editedCategoryName, setEditedCategoryName] = useState(""); // To track the updated category name
  const [error, setError] = useState("");
  const [saveStoreAsAll, setSaveStoreAsAll] = useState(false); // State to manage checkbox status
  const [searchTerm, setSearchTerm] = useState(""); // For search input
  const [currentPage, setCurrentPage] = useState(1); // For pagination
  const [categoriesPerPage] = useState(8); // Number of categories per page

  // Fetch categories when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/get_categories"
        );
        setCategories(response.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error fetching categories",
        });
      }
    };
    fetchCategories();
  }, []);

  const handleSave = async () => {
    if (categoryName.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Category name cannot be empty!",
      });
      return;
    }

    const isDuplicate = categories.some(
      (category) =>
        category.catName.toLowerCase() === categoryName.toLowerCase()
    );

    if (isDuplicate) {
      Swal.fire({
        icon: "error",
        title: "Duplicate Category",
        text: "Category name already exists!",
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
        "http://localhost:5000/api/create_categories",
        {
          catName: categoryName,
          user: UserName,
          store: storeValue,
          saveTime,
        }
      );

      if (response.status === 201) {
        const newCategory = {
          id: response.data.id,
          catName: categoryName,
          user: UserName,
          store: storeValue,
          saveTime: saveTime,
        };

        setCategories([...categories, newCategory]); // Update the table with the new category
        setCategoryName(""); // Clear the input
        setError("");
        setSaveStoreAsAll(false); // Reset checkbox after saving

        Swal.fire({
          icon: "success",
          title: "Category Saved",
          text: "Category has been added successfully!",
        });
      } else {
        throw new Error("Failed to save category");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        Swal.fire({
          icon: "error",
          title: "Error Saving Category",
          text: error.response.data.message,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `Error saving category: ${error.message}`,
        });
      }
    }
  };

  const handleEditClick = (categoryId, categoryName) => {
    setEditingCategoryId(categoryId); // Set the category being edited
    setEditedCategoryName(categoryName); // Initialize the edited name with the current name
  };

  const handleUpdateClick = async (categoryId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/update_category/${categoryId}`,
        {
          catName: editedCategoryName,
        }
      );

      if (response.status === 200) {
        // Update the category in the state
        setCategories(
          categories.map((category) =>
            category.id === categoryId
              ? { ...category, catName: editedCategoryName }
              : category
          )
        );
        setEditingCategoryId(null); // Reset the editing state
        Swal.fire({
          icon: "success",
          title: "Category Updated",
          text: "Category has been updated successfully!",
        });
      } else {
        throw new Error("Failed to update category");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Error updating category: ${error.message}`,
      });
    }
  };

  // Function to handle the deletion of a category
  const handleDelete = async (catName) => {
    Swal.fire({
      title: `Are you sure you want to delete category "${catName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(
            "http://localhost:5000/api/delete_category",
            {
              data: { catName }, // Send category name in the body of the delete request
            }
          );

          if (response.status === 200) {
            // Remove the deleted category from the state to update the UI
            setCategories(
              categories.filter((category) => category.catName !== catName)
            );

            Swal.fire(
              "Deleted!",
              `Category "${catName}" has been deleted.`,
              "success"
            );
          }
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: `Failed to delete category: ${
              err.response?.data?.message || err.message
            }`,
          });
        }
      }
    });
  };

  // Search filtering
  const filteredCategories = categories.filter((category) =>
    category.catName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = filteredCategories.slice(
    indexOfFirstCategory,
    indexOfLastCategory
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="category-model">
      <div className="category-form">
        <label htmlFor="categoryName">Category Name</label>
        <input
          type="text"
          id="categoryName"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Enter category name"
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
          <button className="saveButton" onClick={handleSave}>
            Save
          </button>
        </div>

        {/* Search box with FontAwesome icon */}
        <div className="search-box">
          <input
            type="text"
            placeholder="Search category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="category-grid">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Category Name</th>
              <th>User</th>
              <th>Store</th>
              <th>Added Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentCategories.map((category, index) => (
              <tr key={category.id}>
                <td>{indexOfFirstCategory + index + 1}</td>{" "}
                {/*for continuous numbering*/}
                <td>
                  {editingCategoryId === category.id ? (
                    <input
                      type="text"
                      value={editedCategoryName}
                      onChange={(e) => setEditedCategoryName(e.target.value)}
                    />
                  ) : (
                    category.catName
                  )}
                </td>
                <td>{category.user}</td>
                <td>{category.store}</td>
                <td>{category.saveTime}</td>
                <td className="button-td">
                  {editingCategoryId === category.id ? (
                    <button
                      className="update-button"
                      onClick={() => handleUpdateClick(category.id)}
                    >
                      Update
                    </button>
                  ) : (
                    <button
                      className="edit-button"
                      onClick={() =>
                        handleEditClick(category.id, category.catName)
                      }
                    >
                      Edit
                    </button>
                  )}

                  <button
                    className="delete-button"
                    onClick={() => handleDelete(category.catName)}
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
          {[
            ...Array(
              Math.ceil(filteredCategories.length / categoriesPerPage)
            ).keys(),
          ].map((number) => (
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
CategoryModel.propTypes = {
  UserName: PropTypes.string.isRequired,
  store: PropTypes.string.isRequired,
};
