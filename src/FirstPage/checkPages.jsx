import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CheckPages = () => {
  const [loading, setLoading] = useState(true); // To handle loading state
  const navigate = useNavigate(); // For navigation

  useEffect(() => {
    // Create an async function for better flow
    const checkTables = async () => {
      try {
        // Step 1: Check the companies table
        const companiesResponse = await axios.get('http://localhost:5000/check-companies');
        const { hasData: hasCompanies } = companiesResponse.data;

        if (!hasCompanies) {
          // If companies table has NO data, navigate to CompanySetup
          navigate('/company-setup');
        } else {
          // Step 2: If companies table has data, check the users table
          const usersResponse = await axios.get('http://localhost:5000/check-users');
          const { hasData: hasUsers } = usersResponse.data;

          if (hasUsers) {
            // If users table has data, navigate to LoginUser
            navigate('/login-user');
          } else {
            // If users table has NO data, navigate to AdminAccount
            navigate('/admin-account');
          }
        }
      } catch (error) {
        console.error('Error checking tables:', error);
      } finally {
        setLoading(false); // Stop the loading state
      }
    };

    checkTables();
  }, [navigate]);

  // Show loading while checking the tables
  if (loading) {
    return <div>Loading...</div>;
  }

  return null; // Empty component because it only handles redirection
};

export default CheckPages;
