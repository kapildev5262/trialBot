import SecureArbitrageApp from "./components/secure";

import MultiChainPriceFeed from "./datafeeds/MultiChainPriceFeed";
import './App.css';

function App() {
  return (
    <div className="App">
      {/* <SecureArbitrageApp /> */}
      <header className="App-header">
        <h1>Multi-Chain Data Feed Dashboard</h1>
        <p>Real-time BNB/USD price data from multiple blockchains</p>
      </header>
      <main>
        <MultiChainPriceFeed />
      </main>
      <footer>
        <p>Data refreshes every 5 seconds. Data feeds powered by Chainlink.</p>
      </footer>
    </div>
  );
}

export default App;
