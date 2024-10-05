import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons'; // Import search icon
import "../css/BankModel.css"; // Assuming similar styles for BankModel

export default function BankModel({ UserName, store }) {
  const [bankName, setBankName] = useState('');
  const [banks, setBanks] = useState([]);
  const [error, setError] = useState('');
  const [saveStoreAsAll, setSaveStoreAsAll] = useState(false); // State to manage checkbox status
  const [searchTerm, setSearchTerm] = useState(''); // For search input
  const [currentPage, setCurrentPage] = useState(1); // For pagination
  const [banksPerPage] = useState(8); // Number of banks per page

  // Fetch banks when the component mounts
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/get_banks');
        setBanks(response.data);
      } catch (err) {
        console.error('Error fetching banks:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error fetching banks',
        });
      }
    };
    fetchBanks();
  }, []);

  const handleSave = async () => {
    if (bankName.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Bank name cannot be empty!',
      });
      return;
    }

    const isDuplicate = banks.some(
      (bank) => bank.bankName.toLowerCase() === bankName.toLowerCase()
    );

    if (isDuplicate) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Bank',
        text: 'Bank name already exists!',
      });
      return;
    }

    const now = new Date();
    const saveTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    try {
      const storeValue = saveStoreAsAll ? 'all' : store; // If checkbox is checked, store as "all"

      const response = await axios.post('http://localhost:5000/api/create_banks', {
        bankName: bankName,
        user: UserName,
        store: storeValue,
        saveTime,
      });

      if (response.status === 201) {
        const newBank = {
          id: response.data.id,
          bankName: bankName,
          user: UserName,
          store: storeValue,
          saveTime: saveTime,
        };

        setBanks([...banks, newBank]); // Update the table with the new bank
        setBankName(''); // Clear the input
        setError('');
        setSaveStoreAsAll(false); // Reset checkbox after saving

        Swal.fire({
          icon: 'success',
          title: 'Bank Saved',
          text: 'Bank has been added successfully!',
        });
      } else {
        throw new Error('Failed to save bank');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        Swal.fire({
          icon: 'error',
          title: 'Error Saving Bank',
          text: error.response.data.message,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Error saving bank: ${error.message}`,
        });
      }
    }
  };

  // Function to handle the deletion of a bank
  const handleDelete = async (bankName) => {
    Swal.fire({
      title: `Are you sure you want to delete bank "${bankName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete('http://localhost:5000/api/delete_bank', {
            data: { bankName }, // Send bank name in the body of the delete request
          });

          if (response.status === 200) {
            // Remove the deleted bank from the state to update the UI
            setBanks(banks.filter(bank => bank.bankName !== bankName));

            Swal.fire('Deleted!', `Bank "${bankName}" has been deleted.`, 'success');
          }
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Failed to delete bank: ${err.response?.data?.message || err.message}`,
          });
        }
      }
    });
  };

  // Search filtering
  const filteredBanks = banks.filter((bank) =>
    bank.bankName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastBank = currentPage * banksPerPage;
  const indexOfFirstBank = indexOfLastBank - banksPerPage;
  const currentBanks = filteredBanks.slice(indexOfFirstBank, indexOfLastBank);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="bank-model">
      <div className="bank-form">
        <label htmlFor="bankName">Bank Name</label>
        <input
          type="text"
          id="bankName"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          placeholder="Enter bank name"
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

        {/* Search box with FontAwesome icon */}
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search bank..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bank-grid">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Bank Name</th>
              <th>User</th>
              <th>Store</th>
              <th>Added Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentBanks.map((bank, index) => (
              <tr key={bank.id}>
                <td>{indexOfFirstBank + index + 1}</td> {/*for continuous numbering*/}
                <td>{bank.bankName}</td>
                <td>{bank.user}</td>
                <td>{bank.store}</td>
                <td>{bank.saveTime}</td>
                <td className="button-td">
                  {/* Action buttons placeholder */}
                  <button className="edit-button">Edit</button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(bank.bankName)}
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
          {[...Array(Math.ceil(filteredBanks.length / banksPerPage)).keys()].map(
            (number) => (
              <button
                key={number + 1}
                onClick={() => paginate(number + 1)}
                className={currentPage === number + 1 ? 'active' : ''}
              >
                {number + 1}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// Validate props with PropTypes
BankModel.propTypes = {
  UserName: PropTypes.string.isRequired,
  store: PropTypes.string.isRequired,
};
