import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './MultiChainPriceFeed.css';

// AggregatorV3Interface ABI - minimal ABI for price feed
const aggregatorV3InterfaceABI = [
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { name: "roundId", type: "uint80" },
      { name: "answer", type: "int256" },
      { name: "startedAt", type: "uint256" },
      { name: "updatedAt", type: "uint256" },
      { name: "answeredInRound", type: "uint80" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function"
  }
];

// Chain configurations
const chains = [
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    priceFeedAddress: '0x6970460aabF80C5BE983C6b74e5D06dEDCA95D4A',
    pair: 'BNB/USD',
    icon: '🔵', // Arbitrum icon
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    priceFeedAddress: '0xBb92195Ec95DE626346eeC8282D53e261dF95241',
    pair: 'BNB/USD',
    icon: '❄️', // Avalanche icon
  }
];

const MultiChainPriceFeed = () => {
  const [priceData, setPriceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPrices = async () => {
    setRefreshing(true);
    
    const newPriceData = { ...priceData };
    
    await Promise.all(chains.map(async (chain) => {
      try {
        // Connect to network
        const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl);
        
        // Create contract instance
        const priceFeed = new ethers.Contract(
          chain.priceFeedAddress,
          aggregatorV3InterfaceABI,
          provider
        );
        
        // Get decimals
        const decimals = await priceFeed.decimals();
        
        // Get latest round data
        const roundData = await priceFeed.latestRoundData();
        
        // Format the price
        const formattedPrice = ethers.utils.formatUnits(roundData.answer, decimals);
        const timestamp = new Date(roundData.updatedAt.toNumber() * 1000);
        
        newPriceData[chain.id] = {
          price: parseFloat(formattedPrice).toFixed(2),
          lastUpdate: timestamp.toLocaleTimeString(),
          status: 'success',
          timestamp: timestamp
        };
      } catch (err) {
        console.error(`Error fetching price for ${chain.name}:`, err);
        newPriceData[chain.id] = {
          price: null,
          lastUpdate: null,
          status: 'error',
          error: `Failed to fetch price from ${chain.name}`
        };
      }
    }));
    
    setPriceData(newPriceData);
    setLastUpdated(new Date().toLocaleTimeString());
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    // Fetch prices immediately on component mount
    fetchPrices();
    
    // Set up interval to fetch prices every 5 seconds
    const interval = setInterval(() => {
      fetchPrices();
    }, 5000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="multi-chain-price-feed">
      <div className="price-feed-header">
        <h2>Cross-Chain Price Feeds</h2>
        <div className="refresh-info">
          <span>Last refresh: {lastUpdated || 'Initializing...'}</span>
          <button 
            className={`refresh-button ${refreshing ? 'refreshing' : ''}`} 
            onClick={fetchPrices}
            disabled={refreshing}
          >
            ↻
          </button>
        </div>
      </div>
      
      <div className="price-table-container">
        <table className="price-table">
          <thead>
            <tr>
              <th>Network</th>
              <th>Pair</th>
              <th>Price</th>
              <th>Feed Address</th>
              <th>Last Updated</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && !Object.keys(priceData).length ? (
              <tr>
                <td colSpan="6" className="loading-row">Loading price data from all chains...</td>
              </tr>
            ) : (
              chains.map((chain) => {
                const data = priceData[chain.id] || {};
                return (
                  <tr key={chain.id} className={data.status}>
                    <td className="network-cell">
                      <span className="chain-icon">{chain.icon}</span>
                      {chain.name}
                    </td>
                    <td>{chain.pair}</td>
                    <td className="price-cell">
                      {data.price ? `$${data.price}` : '—'}
                    </td>
                    <td className="address-cell">
                      <div className="address-container">
                        <span className="address-text">{chain.priceFeedAddress.substring(0, 6)}...{chain.priceFeedAddress.substring(38)}</span>
                        <button 
                          className="copy-button" 
                          onClick={() => {
                            navigator.clipboard.writeText(chain.priceFeedAddress);
                            alert('Address copied to clipboard!');
                          }}
                        >
                          📋
                        </button>
                      </div>
                    </td>
                    <td>{data.lastUpdate || '—'}</td>
                    <td className="status-cell">
                      {data.status === 'success' ? 
                        <span className="status-badge success">Online</span> : 
                        <span className="status-badge error">Error</span>}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      <div className="add-chain-hint">
        <p>To add more chains, update the chains array in the component.</p>
      </div>
    </div>
  );
};

export default MultiChainPriceFeed;