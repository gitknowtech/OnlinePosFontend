import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CompanySetup from './FirstPage/CompanySetup';
import CheckPages from './FirstPage/checkPages';
import AdminAccount from './FirstPage/AdminAccount';
import UserLogin from './FirstPage/Loginuser';
import Dashboard from './Dashboard/Dashboard';
import Product from './Products/Product';
import Supplier from './Supplier/Supplier'; // Import Supplier
import Stock from './Stock/Stock'; //Import Stock
import Invoice from './Invoice/invoice';
import Customer from './CustomerFile/Customer';
import ManageCustomer from './CustomerFile/ManageCustomer';
import CreatePerches from  './Supplier/createNewPercheses';
import PerchasingDetails from './Supplier/PurchasingDetails';



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
          <Route path="stock" element={<Stock/>}/>{/* Stock Route*/}
          <Route path="invoice" element={<Invoice/>}/>{/*Invoice Route */}
          <Route path="customer" element={<Customer/>}/>{/* customer router*/}
          <Route path="manageCustomer" element={<ManageCustomer/>}/>{/* manage customer route*/}
          <Route path="createNewPerches" element={<CreatePerches/>}/>
          <Route path="purchasingDetails" element={<PerchasingDetails/>}/>
          {/* You can add other nested routes under Dashboard */}
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
