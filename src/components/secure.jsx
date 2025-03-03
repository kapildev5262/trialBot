import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { abi, contractAddress } from './constants.js';
import ArbitrageUI from './ArbitrageUI.jsx';
import './ArbitrageStyles.css';

const SecureArbitrageComponent = () => {
  // State variables
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [usdtContract, setUsdtContract] = useState(null);
  const [usdtAddress, setUsdtAddress] = useState('');
  const [usdtBalance, setUsdtBalance] = useState('0');
  const [bnbBalance, setBnbBalance] = useState('0');
  const [flashLoanAmount, setFlashLoanAmount] = useState('1000');
  const [usdtDepositAmount, setUsdtDepositAmount] = useState('100');
  const [bnbFeeAmount, setbnbFeeAmount] = useState('0.008');
  const [trialDetails, setTrialDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [networkName, setNetworkName] = useState('');
  const [pendingRefunds, setPendingRefunds] = useState([]);
  const [refundAmount, setRefundAmount] = useState('50');
  const [isOwner, setIsOwner] = useState(false);
  const [isExecuter, setIsExecuter] = useState(false);
  const [newExecuterWallet, setNewExecuterWallet] = useState('');
  const [newFeeCollector, setNewFeeCollector] = useState('');
  const [minRewardAmount, setMinRewardAmount] = useState('');
  const [maxRewardAmount, setMaxRewardAmount] = useState('');
  const [executionData, setExecutionData] = useState({
    loanAmount: '1000',
    usdtAmount: '100',
    userAddress: ''
  });
  const [currentTab, setCurrentTab] = useState('user'); // 'user', 'executer', 'owner'
  const [contractInfo, setContractInfo] = useState({
    executerWallet: '',
    feeCollector: '',
    minimumReward: '0',
    maximumReward: '0'
  });

  // Sepolia network parameters
  const SEPOLIA_CHAIN_ID = '0xaa36a7'; // Chain ID for Sepolia in hex
  const SEPOLIA_NETWORK = {
    chainId: SEPOLIA_CHAIN_ID,
    chainName: 'Sepolia',
    nativeCurrency: {
      name: 'Sepolia ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://sepolia.infura.io/v3/'],
    blockExplorerUrls: ['https://sepolia.etherscan.io']
  };

  // Function to ensure the wallet is connected to Sepolia
  const ensureSepoliaNetwork = async () => {
    if (!window.ethereum) return false;
    
    try {
      // Get current chain ID
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (currentChainId !== SEPOLIA_CHAIN_ID) {
        try {
          // Try to switch to Sepolia
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          });
          return true;
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              // Try to add Sepolia network to MetaMask
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [SEPOLIA_NETWORK],
              });
              return true;
            } catch (addError) {
              console.error("Failed to add Sepolia network:", addError);
              setError("Failed to add Sepolia network. Please add it manually in MetaMask.");
              return false;
            }
          } else {
            console.error("Failed to switch to Sepolia network:", switchError);
            setError("Failed to switch to Sepolia network. Please switch manually in MetaMask.");
            return false;
          }
        }
      }
      return true;
    } catch (error) {
      console.error("Network check error:", error);
      setError("Failed to check current network. Please ensure you're connected to Sepolia testnet.");
      return false;
    }
  };

  // Function to connect wallet
  const connectWallet = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (!window.ethereum) {
        setError("Ethereum wallet not detected. Please install MetaMask.");
        setLoading(false);
        return;
      }
      
      // Ensure connected to Sepolia network
      const isSepoliaConnected = await ensureSepoliaNetwork();
      if (!isSepoliaConnected) {
        setLoading(false);
        return;
      }
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create ethers provider
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      
      // Get network name
      const network = await ethersProvider.getNetwork();
      setNetworkName(network.name);
      
      const ethersSigner = await ethersProvider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, abi, ethersSigner);
      
      // Get USDT token address from contract
      const usdtTokenAddress = await contractInstance.usdtToken();
      
      // ERC20 ABI for token interactions
      const erc20Abi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)"
      ];
      
      const usdtContractInstance = new ethers.Contract(usdtTokenAddress, erc20Abi, ethersSigner);
      
      // Set state with contract instances and account
      const connectedAccount = accounts[0];
      setAccount(connectedAccount);
      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setContract(contractInstance);
      setUsdtContract(usdtContractInstance);
      setUsdtAddress(usdtTokenAddress);
      setExecutionData(prev => ({...prev, userAddress: connectedAccount}));
      
      // Check if the connected account is the owner
      const ownerAddress = await contractInstance.owner();
      setIsOwner(ownerAddress.toLowerCase() === connectedAccount.toLowerCase());
      
      // Check if the connected account is the executer
      const executerAddress = await contractInstance.executerWallet();
      setIsExecuter(executerAddress.toLowerCase() === connectedAccount.toLowerCase());
      
      // Get contract configuration
      await loadContractInfo(contractInstance);
      
      // Add event listener for account changes
      window.ethereum.on('accountsChanged', (newAccounts) => {
        window.location.reload(); // Reload page on account change for simplicity
      });
      
      // Add event listener for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload(); // Reload page on chain change as recommended by MetaMask
      });
      
      // Load initial data
      await loadBalances(connectedAccount, ethersProvider, usdtContractInstance);
      await loadTrialDetails(connectedAccount, contractInstance);
      await checkPendingRefunds(connectedAccount, contractInstance);
      
      setSuccess("Wallet connected successfully!");
    } catch (error) {
      console.error("Connection Error:", error);
      setError("Failed to connect wallet: " + (error.reason || error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };
  
  // Function to disconnect wallet
  const disconnectWallet = () => {
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
    
    setAccount('');
    setProvider(null);
    setSigner(null);
    setContract(null);
    setUsdtContract(null);
    setUsdtAddress('');
    setUsdtBalance('0');
    setBnbBalance('0');
    setTrialDetails(null);
    setNetworkName('');
    setIsOwner(false);
    setIsExecuter(false);
    setPendingRefunds([]);
    setSuccess("Wallet disconnected");
  };
  
  // Function to load contract info
  const loadContractInfo = async (contractInstance) => {
    if (!contractInstance) return;
    
    try {
      const executerWallet = await contractInstance.executerWallet();
      const feeCollector = await contractInstance.feeCollector();
      const minReward = await contractInstance.minimumRewardAmount();
      const maxReward = await contractInstance.maximumRewardAmount();
      
      setContractInfo({
        executerWallet,
        feeCollector,
        minimumReward: ethers.formatUnits(minReward, 18),
        maximumReward: ethers.formatUnits(maxReward, 18)
      });
      
      setMinRewardAmount(ethers.formatUnits(minReward, 18));
      setMaxRewardAmount(ethers.formatUnits(maxReward, 18));
    } catch (error) {
      console.error("Error loading contract info:", error);
    }
  };
  
  // Function to load user balances
  const loadBalances = async (userAccount, ethersProvider, tokenContract) => {
    if (!userAccount || !ethersProvider || !tokenContract) return;
    
    try {
      // Get ETH balance (not BNB since we're on Sepolia)
      const ethBalanceWei = await ethersProvider.getBalance(userAccount);
      const ethBalanceEth = ethers.formatEther(ethBalanceWei);
      setBnbBalance(ethBalanceEth); // Keeping the same state variable
      
      // Get USDT balance
      const usdtBalanceWei = await tokenContract.balanceOf(userAccount);
      const usdtBalanceFormated = ethers.formatUnits(usdtBalanceWei, 18); // Assuming USDT has 18 decimals on Sepolia
      setUsdtBalance(usdtBalanceFormated);
    } catch (error) {
      console.error("Balance Loading Error:", error);
      // Don't set error here to avoid constant error messages during polling
    }
  };
  
  // Function to load user trial details
  const loadTrialDetails = async (userAccount, contractInstance) => {
    if (!userAccount || !contractInstance) return;
    
    try {
      const details = await contractInstance.getUserTrialDetails(userAccount);
      
      setTrialDetails({
        completedTrials: Number(details[0]),
        startTime: Number(details[1]) > 0 ? new Date(Number(details[1]) * 1000).toLocaleString() : 'Not started',
        depositedAmount: ethers.formatUnits(details[2], 18), // Assuming USDT has 18 decimals on Sepolia
        isActive: details[3],
        isCompleted: details[4]
      });
    } catch (error) {
      console.error("Trial Details Loading Error:", error);
      // Don't set error here to avoid constant error messages during polling
    }
  };
  
  // Function to check for pending refunds
  const checkPendingRefunds = async (userAccount, contractInstance) => {
    if (!userAccount || !contractInstance) return;
    
    try {
      const pendingRefundsArray = [];
      
      // Check all possible trial numbers (0, 1, 2) for pending refunds
      for (let i = 0; i < 3; i++) {
        const isPending = await contractInstance.isTrialPendingRefund(userAccount, i);
        if (isPending) {
          pendingRefundsArray.push(i);
        }
      }
      
      setPendingRefunds(pendingRefundsArray);
    } catch (error) {
      console.error("Pending Refunds Check Error:", error);
    }
  };
  
  // UseEffect to track balances and trial details periodically
  useEffect(() => {
    // Only run if we're connected
    if (!account || !provider || !usdtContract || !contract) return;
    
    // Initial load
    loadBalances(account, provider, usdtContract);
    loadTrialDetails(account, contract);
    checkPendingRefunds(account, contract);
    
    // Set up interval for polling
    const interval = setInterval(() => {
      loadBalances(account, provider, usdtContract);
      loadTrialDetails(account, contract);
      checkPendingRefunds(account, contract);
    }, 10000); // Poll every 10 seconds
    
    // Cleanup interval on component unmount or if dependencies change
    return () => clearInterval(interval);
  }, [account, provider, usdtContract, contract]);
  
  // Function to approve USDT spending
  const approveUSDT = async () => {
    if (!usdtContract || !contract) return;
    
    // Ensure connected to Sepolia
    const isSepoliaConnected = await ensureSepoliaNetwork();
    if (!isSepoliaConnected) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const depositAmountWei = ethers.parseUnits(usdtDepositAmount, 18); // Assuming USDT has 18 decimals on Sepolia
      
      // Check current allowance
      const currentAllowance = await usdtContract.allowance(account, contractAddress);
      
      if (currentAllowance < depositAmountWei) {
        // Approve contract to spend USDT
        const approveTx = await usdtContract.approve(contractAddress, depositAmountWei);
        setSuccess("Approval transaction sent. Please wait for confirmation...");
        
        // Wait for transaction confirmation
        await approveTx.wait();
        setSuccess("USDT approved successfully! Now you can start the arbitrage trial.");
      } else {
        setSuccess("USDT already approved for this amount!");
      }
    } catch (error) {
      console.error("USDT Approval Error:", error);
      setError("Failed to approve USDT: " + (error.reason || error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };
  
  // Function to start arbitrage trial
  const startArbitrageTrial = async () => {
    if (!contract) return;
    
    // Ensure connected to Sepolia
    const isSepoliaConnected = await ensureSepoliaNetwork();
    if (!isSepoliaConnected) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const flashLoanAmountWei = ethers.parseUnits(flashLoanAmount, 18);
      const depositAmountWei = ethers.parseUnits(usdtDepositAmount, 18);
      const bnbFeeAmountWei = ethers.parseEther(bnbFeeAmount);
      
      // Start arbitrage trial
      const tx = await contract.startArbitrageTrial(
        flashLoanAmountWei,
        depositAmountWei,
        { value: bnbFeeAmountWei }
      );
      
      setSuccess("Transaction sent. Please wait for confirmation...");
      
      await tx.wait();
      await loadBalances(account, provider, usdtContract);
      await loadTrialDetails(account, contract);
      
      setSuccess("Arbitrage trial started successfully!");
    } catch (error) {
      console.error("Starting Trial Error:", error);
      
      let errorMessage = "Failed to start arbitrage trial";
      
      // Better error handling for custom errors
      if (error.data) {
        try {
          // Try to decode the custom error
          const decodedError = contract.interface.parseError(error.data);
          
          if (decodedError && decodedError.signature) {
            const errorName = decodedError.name;
            
            // Handle specific known errors
            if (errorName === 'InsufficientUSDTBalance') {
              const required = ethers.formatUnits(decodedError.args[0], 18);
              const actual = ethers.formatUnits(decodedError.args[1], 18);
              errorMessage = `Insufficient USDT balance. Required: ${required} USDT, Available: ${actual} USDT`;
            } else if (errorName === 'InsufficientBNBForGasFees') {
              const required = ethers.formatEther(decodedError.args[0]);
              const actual = ethers.formatEther(decodedError.args[1]);
              errorMessage = `Insufficient ETH for gas fees. Required: ${required} ETH, Available: ${actual} ETH`;
            } else if (errorName === 'TrialAlreadyInProgress') {
              errorMessage = `You already have an active trial in progress`;
            } else if (errorName === 'ArbitrageBotCapacityReached') {
              errorMessage = `The arbitrage bot has reached its capacity. Please try again later`;
            } else {
              // For other custom errors
              errorMessage = `Contract error: ${errorName}`;
            }
          }
        } catch (parseError) {
          // If we can't parse the custom error
          errorMessage += ": " + (error.reason || error.message || "Unknown custom error");
        }
      } else {
        // For regular errors
        errorMessage += ": " + (error.reason || error.message || "Unknown error");
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Executer functions
  const executeArbitrage = async () => {
    if (!contract || !isExecuter) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const loanAmountWei = ethers.parseUnits(executionData.loanAmount, 18);
      const usdtAmountWei = ethers.parseUnits(executionData.usdtAmount, 18);
      const userAddress = executionData.userAddress;
      
      if (!ethers.isAddress(userAddress)) {
        throw new Error("Invalid user address");
      }
      
      // Execute arbitrage operation
      const tx = await contract.executeArbitrageOperation(
        loanAmountWei,
        usdtAmountWei,
        userAddress
      );
      
      setSuccess("Arbitrage execution transaction sent. Please wait for confirmation...");
      
      await tx.wait();
      
      setSuccess("Arbitrage operation executed successfully!");
    } catch (error) {
      console.error("Arbitrage Execution Error:", error);
      setError("Failed to execute arbitrage: " + (error.reason || error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };
  
  const processRefund = async (userAddress, trialNumber) => {
    if (!contract || (!isExecuter && !isOwner)) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const refundAmountWei = ethers.parseUnits(refundAmount, 18);
      
      // Approve USDT for refund (if executer)
      if (isExecuter) {
        const approveTx = await usdtContract.approve(contractAddress, refundAmountWei);
        await approveTx.wait();
      }
      
      // Process refund
      const tx = await contract.processFailedTrialRefund(
        userAddress,
        trialNumber,
        refundAmountWei
      );
      
      setSuccess("Refund transaction sent. Please wait for confirmation...");
      
      await tx.wait();
      
      setSuccess(`Refund processed successfully for trial ${trialNumber}!`);
      
      // Refresh pending refunds
      await checkPendingRefunds(account, contract);
    } catch (error) {
      console.error("Refund Processing Error:", error);
      setError("Failed to process refund: " + (error.reason || error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };
  
  // Owner functions
  const updateExecuter = async () => {
    if (!contract || !isOwner) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (!ethers.isAddress(newExecuterWallet)) {
        throw new Error("Invalid executer address");
      }
      
      const tx = await contract.updateExecuterWallet(newExecuterWallet);
      
      setSuccess("Executer update transaction sent. Please wait for confirmation...");
      
      await tx.wait();
      await loadContractInfo(contract);
      
      setSuccess("Executer wallet updated successfully!");
      setNewExecuterWallet('');
    } catch (error) {
      console.error("Executer Update Error:", error);
      setError("Failed to update executer: " + (error.reason || error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };
  
  const updateFeeCollector = async () => {
    if (!contract || !isOwner) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (!ethers.isAddress(newFeeCollector)) {
        throw new Error("Invalid fee collector address");
      }
      
      const tx = await contract.updateFeeCollector(newFeeCollector);
      
      setSuccess("Fee collector update transaction sent. Please wait for confirmation...");
      
      await tx.wait();
      await loadContractInfo(contract);
      
      setSuccess("Fee collector updated successfully!");
      setNewFeeCollector('');
    } catch (error) {
      console.error("Fee Collector Update Error:", error);
      setError("Failed to update fee collector: " + (error.reason || error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };
  
  const updateRewardRange = async () => {
    if (!contract || !isOwner) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const minRewardWei = ethers.parseUnits(minRewardAmount, 18);
      const maxRewardWei = ethers.parseUnits(maxRewardAmount, 18);
      
      if (parseFloat(minRewardAmount) >= parseFloat(maxRewardAmount)) {
        throw new Error("Minimum reward must be less than maximum reward");
      }
      
      const tx = await contract.configureRewardRange(minRewardWei, maxRewardWei);
      
      setSuccess("Reward range update transaction sent. Please wait for confirmation...");
      
      await tx.wait();
      await loadContractInfo(contract);
      
      setSuccess("Reward range updated successfully!");
    } catch (error) {
      console.error("Reward Range Update Error:", error);
      setError("Failed to update reward range: " + (error.reason || error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };
  
  const depositContractUSDT = async () => {
    if (!contract || !usdtContract || !isOwner) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const depositAmountWei = ethers.parseUnits(usdtDepositAmount, 18);
      
      // First approve the contract to spend USDT
      const approveTx = await usdtContract.approve(contractAddress, depositAmountWei);
      await approveTx.wait();
      
      // Now deposit USDT
      const tx = await contract.depositUSDT(depositAmountWei);
      
      setSuccess("USDT deposit transaction sent. Please wait for confirmation...");
      
      await tx.wait();
      await loadBalances(account, provider, usdtContract);
      
      setSuccess("USDT deposited to contract successfully!");
    } catch (error) {
      console.error("USDT Deposit Error:", error);
      setError("Failed to deposit USDT: " + (error.reason || error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };
  
  const withdrawContractUSDT = async () => {
    if (!contract || !isOwner) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const tx = await contract.withdrawUSDT();
      
      setSuccess("USDT withdrawal transaction sent. Please wait for confirmation...");
      
      await tx.wait();
      await loadBalances(account, provider, usdtContract);
      
      setSuccess("USDT withdrawn from contract successfully!");
    } catch (error) {
      console.error("USDT Withdrawal Error:", error);
      setError("Failed to withdraw USDT: " + (error.reason || error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };
  
  const withdrawContractBNB = async () => {
    if (!contract || !isOwner) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const tx = await contract.withdrawBNB();
      
      setSuccess("ETH withdrawal transaction sent. Please wait for confirmation...");
      
      await tx.wait();
      await loadBalances(account, provider, usdtContract);
      
      setSuccess("ETH withdrawn from contract successfully!");
    } catch (error) {
      console.error("ETH Withdrawal Error:", error);
      setError("Failed to withdraw ETH: " + (error.reason || error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };
  
  // Prepare all props for the UI component
  const uiProps = {
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
  };
  
  // Render the UI component with all the props
  return <ArbitrageUI {...uiProps} />;
};

export default SecureArbitrageComponent;