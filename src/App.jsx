import SecureArbitrageApp from "./components/secure";

import MultiChainPriceFeed from "./datafeeds/MultiChainPriceFeed";
// import Raw from "./rawdata/ComprehensivePriceFeed"
import './App.css';

function App() {
  return (
    <div className="App">
     
        <MultiChainPriceFeed />
        {/* <Raw></Raw> */}
    </div>
  );
}

export default App;
