import React from 'react';
import './ArbitrageStyles.css';

const ArbitrageUI = ({
  // State props
  account,
  networkName,
  bnbBalance,
  usdtBalance,
  loading,
  error,
  success,
  trialDetails,
  flashLoanAmount,
  usdtDepositAmount,
  bnbFeeAmount,
  isOwner,
  isExecuter,
  contractInfo,
  pendingRefunds,
  currentTab,
  executionData,
  newExecuterWallet,
  newFeeCollector,
  minRewardAmount,
  maxRewardAmount,
  refundAmount,
  // Form update handlers
  setFlashLoanAmount,
  setUsdtDepositAmount,
  setbnbFeeAmount,
  setExecutionData,
  setCurrentTab,
  setNewExecuterWallet,
  setNewFeeCollector,
  setMinRewardAmount,
  setMaxRewardAmount,
  setRefundAmount,
  // Functions
  connectWallet,
  disconnectWallet,
  approveUSDT,
  startArbitrageTrial,
  executeArbitrage,
  processRefund,
  updateExecuter,
  updateFeeCollector,
  updateRewardRange,
  depositContractUSDT,
  withdrawContractUSDT,
  withdrawContractBNB
}) => {
  return (
    <div className="arbitrage-container">
      {/* Header Section */}
      <div className="arbitrage-header">
        <h1>Secure Arbitrage Trial (Sepolia Testnet)</h1>
        {account ? (
          <div className="account-info">
            <p>Network: {networkName || 'Not connected'}</p>
            <p>Account: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not connected'}</p>
            <p>ETH Balance: {parseFloat(bnbBalance).toFixed(4)} ETH</p>
            <p>USDT Balance: {parseFloat(usdtBalance).toFixed(2)} USDT</p>
            <button 
              onClick={disconnectWallet} 
              className="disconnect-btn"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div className="connect-wallet-container">
            <button 
              onClick={connectWallet} 
              disabled={loading}
              className="connect-btn"
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        )}
      </div>
      
      {/* Notification Messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      {/* Tab Navigation for different roles */}
      {account && (isOwner || isExecuter) && (
        <div className="tab-navigation">
          <button 
            className={`tab-button ${currentTab === 'user' ? 'active' : ''}`} 
            onClick={() => setCurrentTab('user')}
          >
            User
          </button>
          
          {isExecuter && (
            <button 
              className={`tab-button ${currentTab === 'executer' ? 'active' : ''}`} 
              onClick={() => setCurrentTab('executer')}
            >
              Executer
            </button>
          )}
          
          {isOwner && (
            <button 
              className={`tab-button ${currentTab === 'owner' ? 'active' : ''}`} 
              onClick={() => setCurrentTab('owner')}
            >
              Owner
            </button>
          )}
        </div>
      )}
      
      {/* Main Content Area */}
      <div className="main-content">
        {/* User Interface Tab */}
        {currentTab === 'user' && account && (
          <div className="user-interface">
            <h2>Arbitrage Trial</h2>
            
            {/* Trial Details */}
            {trialDetails && (
              <div className="trial-details-box">
                <h3>Your Trial Details</h3>
                <div className="trial-grid">
                  <div className="trial-item">
                    <span className="label">Status:</span>
                    <span className={`value ${trialDetails.isActive ? 'status-active' : ''} ${trialDetails.isCompleted ? 'status-completed' : ''}`}>
                      {trialDetails.isActive ? 'Active' : trialDetails.isCompleted ? 'Completed' : 'Not Started'}
                    </span>
                  </div>
                  <div className="trial-item">
                    <span className="label">Completed Trials:</span>
                    <span className="value">{trialDetails.completedTrials}/3</span>
                  </div>
                  <div className="trial-item">
                    <span className="label">Start Time:</span>
                    <span className="value">{trialDetails.startTime}</span>
                  </div>
                  <div className="trial-item">
                    <span className="label">Deposited Amount:</span>
                    <span className="value">{parseFloat(trialDetails.depositedAmount).toFixed(2)} USDT</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Pending Refunds Section */}
            {pendingRefunds.length > 0 && (
              <div className="pending-refunds-box">
                <h3>Pending Refunds</h3>
                <p>You have pending refunds for trial numbers: {pendingRefunds.join(', ')}</p>
                <p>Please contact support to claim your refund.</p>
              </div>
            )}
            
            {/* Trial Configuration */}
            <div className="trial-config">
              <h3>Configure Trial</h3>
              
              <div className="form-group">
                <label>Flash Loan Amount (USDT):</label>
                <input 
                  type="number" 
                  value={flashLoanAmount}
                  onChange={(e) => setFlashLoanAmount(e.target.value)}
                  disabled={trialDetails?.isActive}
                  min="100"
                  max="10000"
                />
              </div>
              
              <div className="form-group">
                <label>USDT Deposit Amount:</label>
                <input 
                  type="number" 
                  value={usdtDepositAmount}
                  onChange={(e) => setUsdtDepositAmount(e.target.value)}
                  disabled={trialDetails?.isActive}
                  min="10"
                  max="1000"
                />
              </div>
              
              <div className="form-group">
                <label>ETH Fee Amount:</label>
                <input 
                  type="number" 
                  value={bnbFeeAmount}
                  onChange={(e) => setbnbFeeAmount(e.target.value)}
                  disabled={trialDetails?.isActive}
                  min="0.001"
                  max="0.1"
                  step="0.001"
                />
              </div>
              
              <div className="action-buttons">
                <button 
                  onClick={approveUSDT} 
                  disabled={loading || trialDetails?.isActive}
                  className="action-button approve-btn"
                >
                  {loading ? 'Processing...' : 'Approve USDT'}
                </button>
                
                <button 
                  onClick={startArbitrageTrial} 
                  // disabled={loading || trialDetails?.isActive || parseFloat(usdtBalance) < parseFloat(usdtDepositAmount) || parseFloat(bnbBalance) < parseFloat(bnbFeeAmount)}
                  className="action-button start-btn"
                >
                  {loading ? 'Processing...' : 'Start Trial'}
                </button>
              </div>
              
              {(parseFloat(usdtBalance) < parseFloat(usdtDepositAmount) || parseFloat(bnbBalance) < parseFloat(bnbFeeAmount)) && (
                <div className="warning-message">
                  {parseFloat(usdtBalance) < parseFloat(usdtDepositAmount) && (
                    <p>Insufficient USDT balance. You need at least {usdtDepositAmount} USDT.</p>
                  )}
                  {parseFloat(bnbBalance) < parseFloat(bnbFeeAmount) && (
                    <p>Insufficient ETH balance. You need at least {bnbFeeAmount} ETH.</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Trial Info */}
            <div className="trial-info">
              <h3>How It Works</h3>
              <div className="info-steps">
                <div className="info-step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Approve USDT</h4>
                    <p>Approve the contract to use your USDT for the trial deposit.</p>
                  </div>
                </div>
                <div className="info-step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Start Trial</h4>
                    <p>Deposit USDT and ETH to start your arbitrage trial.</p>
                  </div>
                </div>
                <div className="info-step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Wait for Execution</h4>
                    <p>The arbitrage bot will execute your trial within 24 hours.</p>
                  </div>
                </div>
                <div className="info-step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h4>Receive Results</h4>
                    <p>Upon successful execution, rewards will be automatically sent to your wallet.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Executer Interface Tab */}
        {currentTab === 'executer' && account && isExecuter && (
          <div className="executer-interface">
            <h2>Arbitrage Executer Panel</h2>
            
            <div className="execution-form">
              <h3>Execute Arbitrage Operation</h3>
              
              <div className="form-group">
                <label>User Address:</label>
                <input 
                  type="text" 
                  value={executionData.userAddress}
                  onChange={(e) => setExecutionData({...executionData, userAddress: e.target.value})}
                  placeholder="0x..."
                />
              </div>
              
              <div className="form-group">
                <label>Flash Loan Amount (USDT):</label>
                <input 
                  type="number" 
                  value={executionData.loanAmount}
                  onChange={(e) => setExecutionData({...executionData, loanAmount: e.target.value})}
                  min="100"
                />
              </div>
              
              <div className="form-group">
                <label>USDT Amount to Return:</label>
                <input 
                  type="number" 
                  value={executionData.usdtAmount}
                  onChange={(e) => setExecutionData({...executionData, usdtAmount: e.target.value})}
                  min="0"
                />
              </div>
              
              <button 
                onClick={executeArbitrage} 
                disabled={loading || !executionData.userAddress}
                className="action-button execute-btn"
              >
                {loading ? 'Processing...' : 'Execute Arbitrage'}
              </button>
            </div>
            
            <div className="refund-section">
              <h3>Process Refunds</h3>
              
              <div className="form-group">
                <label>User Address:</label>
                <input 
                  type="text" 
                  value={executionData.userAddress}
                  onChange={(e) => setExecutionData({...executionData, userAddress: e.target.value})}
                  placeholder="0x..."
                />
              </div>
              
              <div className="form-group">
                <label>Trial Number:</label>
                <select 
                  onChange={(e) => setExecutionData({...executionData, trialNumber: e.target.value})}
                  defaultValue=""
                >
                  <option value="" disabled>Select trial number</option>
                  <option value="0">Trial 0</option>
                  <option value="1">Trial 1</option>
                  <option value="2">Trial 2</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Refund Amount (USDT):</label>
                <input 
                  type="number" 
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  min="0"
                />
              </div>
              
              <button 
                onClick={() => processRefund(executionData.userAddress, executionData.trialNumber || 0)} 
                disabled={loading || !executionData.userAddress || !executionData.trialNumber}
                className="action-button refund-btn"
              >
                {loading ? 'Processing...' : 'Process Refund'}
              </button>
            </div>
          </div>
        )}
        
        {/* Owner Interface Tab */}
        {currentTab === 'owner' && account && isOwner && (
          <div className="owner-interface">
            <h2>Contract Owner Panel</h2>
            
            <div className="contract-info-box">
              <h3>Current Contract Settings</h3>
              <div className="contract-info-grid">
                <div className="info-item">
                  <span className="label">Executer Wallet:</span>
                  <span className="value">{contractInfo.executerWallet.slice(0, 8)}...{contractInfo.executerWallet.slice(-6)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Fee Collector:</span>
                  <span className="value">{contractInfo.feeCollector.slice(0, 8)}...{contractInfo.feeCollector.slice(-6)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Min Reward:</span>
                  <span className="value">{parseFloat(contractInfo.minimumReward).toFixed(2)} USDT</span>
                </div>
                <div className="info-item">
                  <span className="label">Max Reward:</span>
                  <span className="value">{parseFloat(contractInfo.maximumReward).toFixed(2)} USDT</span>
                </div>
              </div>
            </div>
            
            <div className="owner-controls">
              <div className="control-section">
                <h3>Update Executer Wallet</h3>
                <div className="form-group">
                  <input 
                    type="text" 
                    value={newExecuterWallet}
                    onChange={(e) => setNewExecuterWallet(e.target.value)}
                    placeholder="New executer wallet address (0x...)"
                  />
                  <button 
                    onClick={updateExecuter} 
                    disabled={loading || !newExecuterWallet}
                    className="action-button update-btn"
                  >
                    {loading ? 'Processing...' : 'Update Executer'}
                  </button>
                </div>
              </div>
              
              <div className="control-section">
                <h3>Update Fee Collector</h3>
                <div className="form-group">
                  <input 
                    type="text" 
                    value={newFeeCollector}
                    onChange={(e) => setNewFeeCollector(e.target.value)}
                    placeholder="New fee collector address (0x...)"
                  />
                  <button 
                    onClick={updateFeeCollector} 
                    disabled={loading || !newFeeCollector}
                    className="action-button update-btn"
                  >
                    {loading ? 'Processing...' : 'Update Fee Collector'}
                  </button>
                </div>
              </div>
              
              <div className="control-section">
                <h3>Update Reward Range</h3>
                <div className="form-group reward-range">
                  <div className="range-input">
                    <label>Min Reward (USDT):</label>
                    <input 
                      type="number" 
                      value={minRewardAmount}
                      onChange={(e) => setMinRewardAmount(e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="range-input">
                    <label>Max Reward (USDT):</label>
                    <input 
                      type="number" 
                      value={maxRewardAmount}
                      onChange={(e) => setMaxRewardAmount(e.target.value)}
                      min="0"
                    />
                  </div>
                  <button 
                    onClick={updateRewardRange} 
                    disabled={loading || parseFloat(minRewardAmount) >= parseFloat(maxRewardAmount)}
                    className="action-button update-btn"
                  >
                    {loading ? 'Processing...' : 'Update Reward Range'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="funds-management">
              <h3>Funds Management</h3>
              
              <div className="funds-actions">
                <div className="action-card">
                  <h4>Deposit USDT to Contract</h4>
                  <div className="form-group">
                    <input 
                      type="number" 
                      value={usdtDepositAmount}
                      onChange={(e) => setUsdtDepositAmount(e.target.value)}
                      min="0"
                    />
                    <button 
                      onClick={depositContractUSDT} 
                      disabled={loading || parseFloat(usdtBalance) < parseFloat(usdtDepositAmount)}
                      className="action-button deposit-btn"
                    >
                      {loading ? 'Processing...' : 'Deposit USDT'}
                    </button>
                  </div>
                </div>
                
                <div className="action-card">
                  <h4>Withdraw Contract Funds</h4>
                  <div className="action-buttons">
                    <button 
                      onClick={withdrawContractUSDT} 
                      disabled={loading}
                      className="action-button withdraw-btn"
                    >
                      {loading ? 'Processing...' : 'Withdraw USDT'}
                    </button>
                    <button 
                      onClick={withdrawContractBNB} 
                      disabled={loading}
                      className="action-button withdraw-btn"
                    >
                      {loading ? 'Processing...' : 'Withdraw ETH'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="refund-management">
              <h3>Process Refunds</h3>
              
              <div className="form-group">
                <label>User Address:</label>
                <input 
                  type="text" 
                  value={executionData.userAddress}
                  onChange={(e) => setExecutionData({...executionData, userAddress: e.target.value})}
                  placeholder="0x..."
                />
              </div>
              
              <div className="form-group">
                <label>Trial Number:</label>
                <select 
                  onChange={(e) => setExecutionData({...executionData, trialNumber: e.target.value})}
                  defaultValue=""
                >
                  <option value="" disabled>Select trial number</option>
                  <option value="0">Trial 0</option>
                  <option value="1">Trial 1</option>
                  <option value="2">Trial 2</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Refund Amount (USDT):</label>
                <input 
                  type="number" 
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  min="0"
                />
              </div>
              
              <button 
                onClick={() => processRefund(executionData.userAddress, executionData.trialNumber || 0)} 
                disabled={loading || !executionData.userAddress || !executionData.trialNumber}
                className="action-button refund-btn"
              >
                {loading ? 'Processing...' : 'Process Refund'}
              </button>
            </div>
          </div>
        )}
        
        {/* Not Connected Message */}
        {!account && (
          <div className="not-connected">
            <h2>Connect your wallet to use the Arbitrage Trial system</h2>
            <p>This application requires a web3 wallet like MetaMask to interact with the Sepolia Testnet.</p>
            <button 
              onClick={connectWallet} 
              disabled={loading}
              className="connect-btn large"
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="arbitrage-footer">
        <p>© 2025 Secure Arbitrage Trial | Running on Sepolia Testnet</p>
        <div className="disclaimer">
          <p>This is a testnet application. Do not use real funds. All transactions are for demonstration purposes only.</p>
        </div>
      </div>
    </div>
  );
};

export default ArbitrageUI;