import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import batchImage from "../assets/images/bank.png"; // Import the bank image
import "../css/BankModel.css";

export default function BankModel({ UserName, store }) {
  const [bankName, setBankName] = useState('');
  const [banks, setBanks] = useState([]);
  const [error, setError] = useState('');
  const [saveStoreAsAll, setSaveStoreAsAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [banksPerPage] = useState(14);

  // Fetch banks when the component mounts
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/banks/get_banks');
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
      const storeValue = saveStoreAsAll ? 'all' : store;

      const response = await axios.post('http://localhost:5000/api/banks/create_banks', {
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

        setBanks([...banks, newBank]);
        setBankName('');
        setError('');
        setSaveStoreAsAll(false);

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
          const response = await axios.delete('http://localhost:5000/api/banks/delete_bank', {
            data: { bankName },
          });

          if (response.status === 200) {
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
            autoComplete='off'
          id="bankName"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          placeholder="Enter bank name"
        />

        {/* Checkbox to save store as "all" (hidden) */}
        <div className="check-box" style={{ display: "none" }}>
          <input
            type="checkbox"
            id="allowStore"
            checked={saveStoreAsAll}
            onChange={(e) => setSaveStoreAsAll(e.target.checked)}
          />
          <label htmlFor="allowStore">All Store</label>
        </div>

        <button className='save-button' onClick={handleSave}>Save</button>

        <input
          type="text"
          className="search-input"
          placeholder="Search bank..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="bank-grid">
        <div className="cards-container">
          {currentBanks.length > 0 ? (
            currentBanks.map((bank) => (
              <div className="bank-card" key={bank.id}>
                <div className="card-image">
                  <img src={batchImage} alt={`${bank.bankName} Logo`} loading="lazy" />
                </div>
                <div className="card-body">
                  <h2>{bank.bankName}</h2>
                </div>
                <div className="card-actions">
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(bank.bankName)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-banks-message">No banks found.</p>
          )}
        </div>

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
