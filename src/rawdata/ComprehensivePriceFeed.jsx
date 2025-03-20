import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './ComprehensivePriceFeed.css';

// Extended ABI to access more Chainlink data
const extendedAggregatorABI = [
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
    inputs: [{ name: "_roundId", type: "uint80" }],
    name: "getRoundData",
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
  },
  {
    inputs: [],
    name: "description",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "version",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
];

// Chain configurations
const chains = [
  {
    id: 'bnb',
    name: 'BNB Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    priceFeedAddress: '0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE',
    pair: 'BNB/USD',
    icon: '🟡', // BNB Chain icon
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    priceFeedAddress: '0x6970460aabF80C5BE983C6b74e5D06dEDCA95D4A',
    pair: 'BNB/USD',
    icon: '🔵', // Arbitrum icon
  }
];

const ComprehensivePriceFeed = () => {
  const [priceData, setPriceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedView, setExpandedView] = useState({});

  const fetchPrices = async () => {
    setRefreshing(true);
    
    const newPriceData = { ...priceData };
    const currentTimestamp = Math.floor(Date.now() / 1000);
    
    await Promise.all(chains.map(async (chain) => {
      try {
        // Connect to network
        const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl);
        
        // Create contract instance
        const priceFeed = new ethers.Contract(
          chain.priceFeedAddress,
          extendedAggregatorABI,
          provider
        );
        
        // Get metadata
        const decimals = await priceFeed.decimals();
        const description = await priceFeed.description();
        const version = await priceFeed.version();
        
        // Get latest round data
        const roundData = await priceFeed.latestRoundData();
        
        // Format the price
        const formattedPrice = ethers.utils.formatUnits(roundData.answer, decimals);
        const updateTimestamp = roundData.updatedAt.toNumber();
        const startTimestamp = roundData.startedAt.toNumber();
        const priceAge = currentTimestamp - updateTimestamp;
        
        // Try to get previous round data to calculate deviation
        let previousRoundData;
        let priceDeviation = null;
        
        try {
          const previousRoundId = roundData.roundId.sub(1);
          previousRoundData = await priceFeed.getRoundData(previousRoundId);
          
          if (previousRoundData && previousRoundData.answer.gt(0)) {
            const prevPrice = ethers.utils.formatUnits(previousRoundData.answer, decimals);
            priceDeviation = ((parseFloat(formattedPrice) - parseFloat(prevPrice)) / parseFloat(prevPrice)) * 100;
          }
        } catch (err) {
          console.log(`Could not fetch previous round data for ${chain.name}`);
        }
        
        newPriceData[chain.id] = {
          metadata: {
            description,
            decimals: decimals.toString(),
            version: version.toString()
          },
          latestRound: {
            roundId: roundData.roundId.toString(),
            rawAnswer: roundData.answer.toString(),
            price: parseFloat(formattedPrice).toFixed(decimals),
            startedAt: new Date(startTimestamp * 1000).toLocaleString(),
            updatedAt: new Date(updateTimestamp * 1000).toLocaleString(),
            answeredInRound: roundData.answeredInRound.toString(),
            priceAge: priceAge,
            priceAgeFormatted: formatDuration(priceAge),
            deviation: priceDeviation !== null ? priceDeviation.toFixed(2) + '%' : 'N/A'
          },
          status: 'success'
        };
      } catch (err) {
        console.error(`Error fetching price for ${chain.name}:`, err);
        newPriceData[chain.id] = {
          status: 'error',
          error: `Failed to fetch price from ${chain.name}: ${err.message}`
        };
      }
    }));
    
    setPriceData(newPriceData);
    setLastUpdated(new Date().toLocaleString());
    setLoading(false);
    setRefreshing(false);
  };

  // Helper function to format duration in seconds to human-readable format
  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
    return `${Math.floor(seconds / 86400)} days`;
  };

  // Toggle expanded view for a chain
  const toggleExpandedView = (chainId) => {
    setExpandedView(prev => ({
      ...prev,
      [chainId]: !prev[chainId]
    }));
  };

  useEffect(() => {
    fetchPrices();
    
    const interval = setInterval(() => {
      fetchPrices();
    }, 15000); // Update every 15 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="comprehensive-price-feed">
      <div className="price-feed-header">
        <h2>Chainlink Price Feed Data</h2>
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
      
      {loading ? (
        <div className="loading">Loading price data from all chains...</div>
      ) : (
        <div className="price-feed-grid">
          {chains.map((chain) => {
            const data = priceData[chain.id] || {};
            const isExpanded = expandedView[chain.id] || false;
            
            return (
              <div key={chain.id} className={`price-card ${data.status}`}>
                <div className="price-card-header">
                  <div className="chain-info">
                    <span className="chain-icon">{chain.icon}</span>
                    <h3>{chain.name}</h3>
                  </div>
                  <button 
                    className="expand-button"
                    onClick={() => toggleExpandedView(chain.id)}
                  >
                    {isExpanded ? '▲' : '▼'}
                  </button>
                </div>
                
                {data.status === 'success' ? (
                  <div className="price-card-content">
                    <div className="price-main-info">
                      <div className="price-value">
                        ${data.latestRound.price}
                      </div>
                      <div className="price-pair">
                        {data.metadata.description || chain.pair}
                      </div>
                      <div className="price-updated">
                        Updated: {data.latestRound.priceAgeFormatted} ago
                      </div>
                      {data.latestRound.deviation !== 'N/A' && (
                        <div className={`price-deviation ${parseFloat(data.latestRound.deviation) >= 0 ? 'positive' : 'negative'}`}>
                          {parseFloat(data.latestRound.deviation) >= 0 ? '▲' : '▼'} {data.latestRound.deviation}
                        </div>
                      )}
                    </div>
                    
                    {isExpanded && (
                      <div className="price-detailed-info">
                        <h4>Metadata</h4>
                        <table className="data-table">
                          <tbody>
                            <tr>
                              <td>Description</td>
                              <td>{data.metadata.description}</td>
                            </tr>
                            <tr>
                              <td>Decimals</td>
                              <td>{data.metadata.decimals}</td>
                            </tr>
                            <tr>
                              <td>Version</td>
                              <td>{data.metadata.version}</td>
                            </tr>
                            <tr>
                              <td>Feed Address</td>
                              <td className="address">{chain.priceFeedAddress}</td>
                            </tr>
                          </tbody>
                        </table>
                        
                        <h4>Round Data</h4>
                        <table className="data-table">
                          <tbody>
                            <tr>
                              <td>Round ID</td>
                              <td>{data.latestRound.roundId}</td>
                            </tr>
                            <tr>
                              <td>Raw Answer</td>
                              <td>{data.latestRound.rawAnswer}</td>
                            </tr>
                            <tr>
                              <td>Started At</td>
                              <td>{data.latestRound.startedAt}</td>
                            </tr>
                            <tr>
                              <td>Updated At</td>
                              <td>{data.latestRound.updatedAt}</td>
                            </tr>
                            <tr>
                              <td>Answered In Round</td>
                              <td>{data.latestRound.answeredInRound}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="price-card-error">
                    <p>{data.error || 'Failed to load price data'}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ComprehensivePriceFeed;