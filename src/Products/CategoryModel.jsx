import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import salesimage from "../assets/icons/category.png"; // Image for categories
import "../css/CategoryModel.css";

export default function CategoryModel({ UserName, store }) {
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editedCategoryName, setEditedCategoryName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [categoriesPerPage] = useState(18);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://154.26.129.243:5000/api/categories/get_categories"
        );
        setCategories(response.data);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error fetching categories",err,
        });
      }
    };
    fetchCategories();
  }, []);

  const handleSave = async () => {
    if (!categoryName.trim()) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Category name cannot be empty!",
      });
      return;
    }

    const isDuplicate = categories.some(
      (category) => category.catName.toLowerCase() === categoryName.toLowerCase()
    );

    if (isDuplicate) {
      Swal.fire({
        icon: "error",
        title: "Duplicate Category",
        text: "Category name already exists!",
      });
      return;
    }

    try {
      const now = new Date();
      const saveTime = now.toISOString().slice(0, 10); // Extracting date in YYYY-MM-DD format
      const response = await axios.post(
        "http://154.26.129.243:5000/api/categories/create_categories",
        {
          catName: categoryName,
          user: UserName,
          store,
          saveTime,
        }
      );

      if (response.status === 201) {
        const newCategory = {
          id: response.data.id,
          catName: categoryName,
          store,
          saveTime,
        };
        setCategories([...categories, newCategory]);
        setCategoryName("");
        Swal.fire({
          icon: "success",
          title: "Category Saved",
          text: "Category has been added successfully!",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error Saving Category",
        text: error.response?.data.message || "Unknown error occurred",
      });
    }
  };

  const handleEditClick = (categoryId, categoryName) => {
    setEditingCategoryId(categoryId);
    setEditedCategoryName(categoryName);
  };

  const handleUpdateClick = async (categoryId) => {
    try {
      const response = await axios.put(
        `http://154.26.129.243:5000/api/categories/update_category/${categoryId}`,
        { catName: editedCategoryName }
      );

      if (response.status === 200) {
        setCategories(
          categories.map((category) =>
            category.id === categoryId
              ? { ...category, catName: editedCategoryName }
              : category
          )
        );
        setEditingCategoryId(null);
        Swal.fire({
          icon: "success",
          title: "Category Updated",
          text: "Category has been updated successfully!",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Error updating category: ${error.response?.data.message || error.message}`,
      });
    }
  };

  const handleDelete = async (catName) => {
    Swal.fire({
      title: `Are you sure you want to delete "${catName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(
            "http://154.26.129.243:5000/api/categories/delete_category",
            { data: { catName } }
          );
  
          if (response.status === 200) {
            setCategories(categories.filter((cat) => cat.catName !== catName));
            Swal.fire("Deleted!", `"${catName}" has been deleted.`, "success");
          }
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: err.response?.data.message || "Failed to delete category.",
          });
        }
      }
    });
  };
  

  const filteredCategories = categories.filter((category) =>
    category.catName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = filteredCategories.slice(
    indexOfFirstCategory,
    indexOfLastCategory
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="category-model">
      <div className="category-form">
        <input
          type="text"
          value={categoryName}
          placeholder="Enter category name"
          onChange={(e) => setCategoryName(e.target.value)}
        />
        <button onClick={handleSave}>Save</button>
      </div>
      <div className="search-box">
        <input
          type="text"
          placeholder="Search category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="category-cards">
        {currentCategories.map((category) => (
          <div className="category-card" key={category.id}>
            <img src={salesimage} alt="Category" className="category-image" />
            {editingCategoryId === category.id ? (
              <input
                type="text"
                value={editedCategoryName}
                onChange={(e) => setEditedCategoryName(e.target.value)}
              />
            ) : (
              <h4>{category.catName}</h4>
            )}
            <div className="category-actions">
              {editingCategoryId === category.id ? (
                <button className="edit-button" onClick={() => handleUpdateClick(category.id)}>
                  Update
                </button>
              ) : (
                <button className="edit-button" onClick={() => handleEditClick(category.id, category.catName)}>
                  Edit
                </button>
              )}
              <button className="delete-button" onClick={() => handleDelete(category.catName)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="pagination">
        {[...Array(Math.ceil(filteredCategories.length / categoriesPerPage)).keys()].map((number) => (
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

CategoryModel.propTypes = {
  UserName: PropTypes.string.isRequired,
  store: PropTypes.string.isRequired,
};
