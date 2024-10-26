import { useState } from "react";
import "../css/stockMain.css";
import { useLocation } from "react-router-dom";
import StockInModel from "../Stock/StockIn";
import StockOutModel from "../Stock/StockOut";
import StockTransfer from "../Stock/StockTransfer";



const Stock = () => {
    const location = useLocation();
    // Make sure location.state exists
    const { UserName = "Default User", Store = "Default Store" } = location.state || {};
    const [activeContent, setActiveContent] = useState(null);


    const toggleStockInmodel = () => {
        if (activeContent === "stockin") {
            setActiveContent(null);
        } else {
            setActiveContent("stockin");
        }
    };

    const toggleStockOutmodel = () => {
        if(activeContent === "stockout"){
            setActiveContent(null);
        }else{
            setActiveContent("stockout");
        }
    }

    const toggleStocktransferModel = () => {
        if(activeContent === "stocktransfer"){
            setActiveContent(null);
        }else{
            setActiveContent("stocktransfer");
        }
    }

    return (
        <div className="stock-panel">
            {/* Display User Info */}
            <div className="user-info-panel">
                <p><strong>User : </strong>{UserName}</p>
                <p><strong>Store: </strong>{Store}</p>
            </div>

            <div className="button-list">
                <button onClick={toggleStockInmodel}>
                    Stock In
                </button>
                <button onClick={toggleStockOutmodel}>
                    Stock Out
                </button>
                <button onClick={toggleStocktransferModel}>
                    Stock Transfer
                </button>
                <button>
                    Stock by Category
                </button>
                <button>
                    Stock by Supplier
                </button>
            </div>

            <div className="product-content">
                {activeContent === "stockin" && <StockInModel store={Store} />}
                {activeContent === "stockout" && <StockOutModel store={Store}/>}
                {activeContent === "stocktransfer" && <StockTransfer store={Store}/>}
            </div>
        </div>
    );
};

export default Stock;
