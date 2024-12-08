// src/components/Setting.jsx

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCog, faFileInvoiceDollar, faBarcode } from "@fortawesome/free-solid-svg-icons";
import "../css1/Setting.css"; // Ensure the path is correct
import UserSetting from "./UserSetting"; // Import the UserSetting component

const BillSetting = () => <div id="bill-setting-content-user-setting">Bill Setting Content</div>;
const BarcodeSetting = () => <div id="barcode-setting-content-user-setting">Barcode Setting Content</div>;

const Setting = () => {
  // Default active content
  const [activeContent, setActiveContent] = useState("user");

  const toggleUserSetting = () => {
    setActiveContent(activeContent === "user" ? null : "user");
  };

  const toggleBillSetting = () => {
    setActiveContent(activeContent === "bill" ? null : "bill");
  };

  const toggleBarcodeSetting = () => {
    setActiveContent(activeContent === "barcode" ? null : "barcode");
  };

  return (
    <div id="settings-panel-user-setting">
      {/* Settings navigation buttons */}
      <div id="button-list-user-setting">
        <button id="user-setting-button-user-setting" onClick={toggleUserSetting}>
          <FontAwesomeIcon id="button-icon-user-setting" icon={faUserCog} />
          User Setting
        </button>
        <button id="bill-setting-button-user-setting" onClick={toggleBillSetting}>
          <FontAwesomeIcon id="button-icon-user-setting" icon={faFileInvoiceDollar} />
          Bill Setting
        </button>
        <button id="barcode-setting-button-user-setting" onClick={toggleBarcodeSetting}>
          <FontAwesomeIcon id="button-icon-user-setting" icon={faBarcode} />
          Barcode Setting
        </button>
      </div>

      {/* Dynamic content based on the selected button */}
      <div id="setting-content-user-setting">
        {activeContent === "user" && <UserSetting />}
        {activeContent === "bill" && <BillSetting />}
        {activeContent === "barcode" && <BarcodeSetting />}
      </div>
    </div>
  );
};

export default Setting;
