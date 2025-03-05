import React from 'react';
import './ArbitrageStyles.css';

const ArbitrageUI = ({
  // Account and network info
  account,
  networkName,
  bnbBalance,
  usdtBalance,
  loading,
  error,
  success,

  // Trial details
  trialDetails,
  flashLoanAmount,
  usdtDepositAmount,
  bnbFeeAmount,
  isOwner,
  isExecuter,
  currentTab,
  contractInfo,
  executionData,
  newExecuterWallet,

  // Form update handlers
  setFlashLoanAmount,
  setUsdtDepositAmount,
  setbnbFeeAmount,
  setCurrentTab,
  setExecutionData,
  setNewExecuterWallet,

  // Connection functions
  connectWallet,
  disconnectWallet,

  // User operations
  approveUSDT,
  startTrial,
  executeArbitrage,
  updateExecutorWallet,
}) => {
  return (
    <div className="arbitrage-container">
      {/* Header Section */}
      <div className="arbitrage-header">
        <h1>Secure Arbitrage Trial (Sepolia Testnet)</h1>
        {account ? (
          <div className="account-info">
            <p>Network: {networkName || "Not connected"}</p>
            <p>Account: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Not connected"}</p>
            <p>ETH Balance: {parseFloat(bnbBalance).toFixed(4)} ETH</p>
            <p>USDT Balance: {parseFloat(usdtBalance).toFixed(2)} USDT</p>
            <div className="account-actions">
              <button onClick={disconnectWallet} className="disconnect-btn">
                Disconnect Wallet
              </button>
            </div>
          </div>
        ) : (
          <div className="connect-wallet-container">
            <button onClick={connectWallet} disabled={loading} className="connect-btn">
              {loading ? "Connecting..." : "Connect Wallet"}
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
          <button className={`tab-button ${currentTab === "user" ? "active" : ""}`} onClick={() => setCurrentTab("user")}>
            User
          </button>
          {isOwner && (
            <button className={`tab-button ${currentTab === "owner" ? "active" : ""}`} onClick={() => setCurrentTab("owner")}>
              Owner
            </button>
          )}
          {isExecuter && (
            <button className={`tab-button ${currentTab === "executer" ? "active" : ""}`} onClick={() => setCurrentTab("executer")}>
              Executer
            </button>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="main-content">
        {/* User Interface Tab */}
        {currentTab === "user" && account && (
          <div className="user-interface">
            <h2>Arbitrage Trial</h2>

            {/* Trial Details */}
            {trialDetails && (
              <div className="trial-details-box">
                <h3>Your Trial Details</h3>
                <div className="trial-grid">
                  <div className="trial-item">
                    <span className="label">Completed Trials:</span>
                    <span className="value">{trialDetails.completedTrials}</span>
                  </div>
                  <div className="trial-item">
                    <span className="label">Last Trial Start:</span>
                    <span className="value">{trialDetails.startTime}</span>
                  </div>
                  <div className="trial-item">
                    <span className="label">Status:</span>
                    <span className={`value ${trialDetails.isActive ? "status-active" : "status-inactive"}`}>{trialDetails.isActive ? "Active" : "Not Started"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Trial Configuration */}
            <div className="trial-config">
              <h3>Configure Trial</h3>

              <div className="form-group">
                <label>Flash Loan Amount (USDT):</label>
                <input type="number" value={flashLoanAmount} onChange={(e) => setFlashLoanAmount(e.target.value)} disabled={trialDetails?.isActive} min="100" max="10000" />
              </div>

              <div className="form-group">
                <label>USDT Deposit Amount:</label>
                <input type="number" value={usdtDepositAmount} onChange={(e) => setUsdtDepositAmount(e.target.value)} disabled={trialDetails?.isActive} min="10" max="1000" />
              </div>

              <div className="form-group">
                <label>ETH Fee Amount:</label>
                <input type="number" value={bnbFeeAmount} onChange={(e) => setbnbFeeAmount(e.target.value)} disabled={trialDetails?.isActive} min="0.001" max="0.1" step="0.001" />
              </div>

              <div className="action-buttons">
                <button onClick={approveUSDT} disabled={loading || trialDetails?.isActive} className="action-button approve-btn">
                  {loading ? "Processing..." : "Approve USDT"}
                </button>

                <button onClick={startTrial} className="action-button start-btn" disabled={loading || trialDetails?.isActive}>
                  {loading ? "Processing..." : "Start Trial"}
                </button>
              </div>

              {(parseFloat(usdtBalance) < parseFloat(usdtDepositAmount) || parseFloat(bnbBalance) < parseFloat(bnbFeeAmount)) && (
                <div className="warning-message">
                  {parseFloat(usdtBalance) < parseFloat(usdtDepositAmount) && <p>Insufficient USDT balance. You need at least {usdtDepositAmount} USDT.</p>}
                  {parseFloat(bnbBalance) < parseFloat(bnbFeeAmount) && <p>Insufficient ETH balance. You need at least {bnbFeeAmount} ETH.</p>}
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

        {/* Executer Tab */}
        {currentTab === "executer" && isExecuter && (
          <div className="executer-interface">
            <h2>Arbitrage Execution</h2>
            <div className="execution-form">
              <div className="form-group">
                <label>Loan Amount (USDT):</label>
                <input type="number" value={executionData.loanAmount} onChange={(e) => setExecutionData((prev) => ({ ...prev, loanAmount: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>USDT Amount:</label>
                <input type="number" value={executionData.usdtAmount} onChange={(e) => setExecutionData((prev) => ({ ...prev, usdtAmount: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>User Address:</label>
                <input type="text" value={executionData.userAddress} onChange={(e) => setExecutionData((prev) => ({ ...prev, userAddress: e.target.value }))} />
              </div>
              <button onClick={executeArbitrage} className="action-button execute-btn" disabled={loading}>
                {loading ? "Processing..." : "Execute Arbitrage"}
              </button>
            </div>
          </div>
        )}

        {/* Owner Tab */}
        {currentTab === "owner" && isOwner && (
          <div className="owner-interface">
            <h2>Contract Management</h2>
            <div className="contract-info">
              <h3>Current Contract Details</h3>
              <p>Executer Wallet: {contractInfo.executerWallet}</p>
              <p>Fee Collector: {contractInfo.feeCollector}</p>
            </div>
            <div className="update-executer-form">
              <h3>Update Executer Wallet</h3>
              <div className="form-group">
                <label>New Executer Wallet Address:</label>
                <input type="text" value={newExecuterWallet} onChange={(e) => setNewExecuterWallet(e.target.value)} />
              </div>
              <button onClick={updateExecutorWallet} className="action-button update-btn" disabled={loading}>
                {loading ? "Processing..." : "Update Executer Wallet"}
              </button>
            </div>
          </div>
        )}

        {/* Not Connected Message */}
        {!account && (
          <div className="not-connected">
            <h2>Connect your wallet to use the Arbitrage Trial system</h2>
            <p>This application requires a web3 wallet like MetaMask to interact with the Sepolia Testnet.</p>
            <button onClick={connectWallet} disabled={loading} className="connect-btn large">
              {loading ? "Connecting..." : "Connect Wallet"}
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