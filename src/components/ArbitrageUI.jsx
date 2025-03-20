import React from "react";
import "./ArbitrageStyles.css";

const ArbitrageUI = ({
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
  currentTab,
  executionData,
  newExecuterWallet,
  contractUsdtBalance,
  contractBnbBalance,
  refundUserAddress,
  functionToggleData,
  newAavePool,
  // Form update handlers
  setFlashLoanAmount,
  setUsdtDepositAmount,
  setbnbFeeAmount,
  setExecutionData,
  setCurrentTab,
  setNewExecuterWallet,
  setRefundUserAddress,
  setFunctionToggleData,
  setnewAavePol,
  // Functions
  connectWallet,
  disconnectWallet,
  approveUSDT,
  startTrial,
  executeArbitrage,
  updateExecuter,
  retrieveUSDT,
  retrieveBNB,
  depositUSDT,
  processRefund,
  toggleFunction,
  updateAavePool,
}) => {
  return (
    <div className="arbitrage-container">
      {/* Header Section */}
      <div className="arbitrage-header">
        <h1>Secure Arbitrage Trial (BSC Mainnet)</h1>
        {account ? (
          <div className="account-info">
            <p>Network: {networkName || "Not connected"}</p>
            <p>Account: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Not connected"}</p>
            <p>BNB Balance: {parseFloat(bnbBalance).toFixed(4)} BNB</p>
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
                    <span className="value">{trialDetails.trialsCompleted}</span>
                  </div>
                  <div className="trial-item">
                    <span className="label">Last Trial Start:</span>
                    <span className="value">{new Date(trialDetails.timestamp * 1000).toLocaleString()}</span>
                  </div>
                  <div className="trial-item">
                    <span className="label">Status:</span>
                    <span className={`value ${trialDetails.active ? "status-active" : "status-inactive"}`}>{trialDetails.active ? "Active" : "Not Started"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Trial Configuration */}
            <div className="trial-config">
              <h3>Configure Trial</h3>

              <div className="form-group">
                <label>Flash Loan Amount (USDT):</label>
                <input type="number" value={flashLoanAmount} onChange={(e) => setFlashLoanAmount(e.target.value)} disabled={trialDetails?.active} min="100" max="10000" />
              </div>

              <div className="form-group">
                <label>USDT Deposit Amount:</label>
                <input type="number" value={usdtDepositAmount} onChange={(e) => setUsdtDepositAmount(e.target.value)} disabled={trialDetails?.active} min="10" max="1000" />
              </div>

              <div className="form-group">
                <label>BNB Fee Amount:</label>
                <input type="number" value={bnbFeeAmount} onChange={(e) => setbnbFeeAmount(e.target.value)} disabled={trialDetails?.active} min="0.001" max="0.1" step="0.001" />
              </div>

              <div className="action-buttons">
                <button onClick={approveUSDT} disabled={loading || trialDetails?.active} className="action-button approve-btn">
                  {loading ? "Processing..." : "Approve USDT"}
                </button>

                <button onClick={startTrial} className="action-button start-btn" disabled={loading || trialDetails?.active}>
                  {loading ? "Processing..." : "Start Trial"}
                </button>
              </div>

              {(parseFloat(usdtBalance) < parseFloat(usdtDepositAmount) || parseFloat(bnbBalance) < parseFloat(bnbFeeAmount)) && (
                <div className="warning-message">
                  {parseFloat(usdtBalance) < parseFloat(usdtDepositAmount) && <p>Insufficient USDT balance. You need at least {usdtDepositAmount} USDT.</p>}
                  {parseFloat(bnbBalance) < parseFloat(bnbFeeAmount) && <p>Insufficient BNB balance. You need at least {bnbFeeAmount} BNB.</p>}
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
                    <p>Deposit USDT and BNB to start your arbitrage trial.</p>
                  </div>
                </div>
                <div className="info-step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Wait for Execution</h4>
                    <p>The arbitrage bot will execute your trial within the time limit.</p>
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

            {/* Refund Processing Section */}
            <div className="refund-section">
              <h3>Process Refund</h3>
              <div className="form-group">
                <label>User Address:</label>
                <input type="text" placeholder="Enter user address" value={refundUserAddress || ""} onChange={(e) => setRefundUserAddress(e.target.value)} />
              </div>
              <button onClick={processRefund} className="action-button refund-btn" disabled={loading || !refundUserAddress}>
                {loading ? "Processing..." : "Process Refund"}
              </button>
              <div className="refund-info">
                <p>Process a refund for users with active trials</p>
                <p>Note: This will require a small BNB fee to cover transaction costs</p>
              </div>
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
              <div className="contract-balances">
                <h4>Contract Balances:</h4>
                <p>BNB Balance: {parseFloat(contractBnbBalance).toFixed(4)} BNB</p>
                <p>USDT Balance: {parseFloat(contractUsdtBalance).toFixed(2)} USDT</p>
              </div>
            </div>

            <div className="management-section">
              <h3>Update Executer Wallet</h3>
              <div className="form-group">
                <label>New Executer Wallet Address:</label>
                <input type="text" value={newExecuterWallet} onChange={(e) => setNewExecuterWallet(e.target.value)} />
              </div>
              <button onClick={updateExecuter} className="action-button update-btn" disabled={loading}>
                {loading ? "Processing..." : "Update Executer Wallet"}
              </button>
            </div>

            <div className="management-section">
              <h3>Update Aave Pool Address</h3>
              <div className="form-group">
                <label>New Aave Pool Address:</label>
                <input type="text" value={newAavePool} onChange={(e) => setnewAavePol(e.target.value)} />
              </div>
              <button onClick={updateAavePool} className="action-button update-btn" disabled={loading}>
                {loading ? "Processing..." : "Update Aave Pool"}
              </button>
            </div>

            <div className="management-section">
              <h3>Function Permissions</h3>
              <div className="form-group">
                <label>Function Selector:</label>
                <input
                  type="text"
                  placeholder="0x12345678"
                  value={functionToggleData.functionSelector}
                  onChange={(e) => setFunctionToggleData({ ...functionToggleData, functionSelector: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Allowed:</label>
                <input type="checkbox" checked={functionToggleData.allowed} onChange={(e) => setFunctionToggleData({ ...functionToggleData, allowed: e.target.checked })} />
              </div>
              <button onClick={toggleFunction} className="action-button toggle-btn" disabled={loading}>
                {loading ? "Processing..." : "Toggle Function"}
              </button>
            </div>

            <div className="management-section">
              <h3>Manage Assets</h3>
              <div className="asset-management-buttons">
                <button onClick={retrieveUSDT} className="action-button retrieve-btn" disabled={loading}>
                  {loading ? "Processing..." : "Retrieve USDT"}
                </button>
                <button onClick={retrieveBNB} className="action-button retrieve-btn" disabled={loading}>
                  {loading ? "Processing..." : "Retrieve BNB"}
                </button>
                <button onClick={depositUSDT} className="action-button deposit-btn" disabled={loading}>
                  {loading ? "Processing..." : "Deposit USDT"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Not Connected Message */}
        {!account && (
          <div className="not-connected">
            <h2>Connect your wallet to use the Arbitrage Trial system</h2>
            <p>This application requires a web3 wallet like MetaMask to interact with the BSC Mainnet.</p>
            <button onClick={connectWallet} disabled={loading} className="connect-btn large">
              {loading ? "Connecting..." : "Connect Wallet"}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="arbitrage-footer">
        <p>© 2025 Secure Arbitrage Trial | Running on BSC Mainnet</p>
        <div className="disclaimer">
          <p>All transactions involve real funds. Please use caution when interacting with smart contracts.</p>
        </div>
      </div>
    </div>
  );
};

export default ArbitrageUI;
