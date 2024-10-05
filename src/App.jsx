import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CompanySetup from './FirstPage/CompanySetup';
import CheckPages from './FirstPage/checkPages';
import AdminAccount from './FirstPage/AdminAccount';
import UserLogin from './FirstPage/Loginuser';
import Dashboard from './Dashboard/Dashboard';
import Product from './Products/Product';
import Supplier from './Supplier/Supplier'; // Import Supplier

function App() {
  return (
    <Router>
      <Routes>
        {/* CheckPages route as the default path */}
        <Route path="/" element={<CheckPages />} />

        {/* CompanySetup and AdminAccount routes */}
        <Route path="/company-setup" element={<CompanySetup />} />
        <Route path="/admin-account" element={<AdminAccount />} />
        <Route path="/login-user" element={<UserLogin />} />

        <Route path="/dashboard/*" element={<Dashboard />}>
          <Route path="products" element={<Product />} /> {/* Product route */}
          <Route path="purchasing" element={<Supplier />} /> {/* Supplier route */}
          {/* You can add other nested routes under Dashboard */}
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
