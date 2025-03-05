import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { abi, contractAddress } from "./constants.js";
import ArbitrageUI from "./ArbitrageUI.jsx";
import "./ArbitrageStyles.css";

const SecureArbitrageComponent = () => {
  // State variables
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [usdtContract, setUsdtContract] = useState(null);
  const [usdtAddress, setUsdtAddress] = useState("");
  const [usdtBalance, setUsdtBalance] = useState("0");
  const [bnbBalance, setBnbBalance] = useState("0");
  const [flashLoanAmount, setFlashLoanAmount] = useState("1000");
  const [usdtDepositAmount, setUsdtDepositAmount] = useState("100");
  const [bnbFeeAmount, setbnbFeeAmount] = useState("0.008");
  const [trialDetails, setTrialDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [networkName, setNetworkName] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [isExecuter, setIsExecuter] = useState(false);
  const [currentTab, setCurrentTab] = useState("user");
  const [contractInfo, setContractInfo] = useState({
    executerWallet: "",
    feeCollector: "",
    minimumReward: "0",
    maximumReward: "0",
  });
  const [executionData, setExecutionData] = useState({
    loanAmount: "1000",
    usdtAmount: "100",
    userAddress: "",
  });
  const [newExecuterWallet, setNewExecuterWallet] = useState("");

  // BSC Mainnet network parameters
  const BSC_CHAIN_ID = "0x38"; // Chain ID for BSC Mainnet in hex
  const BSC_NETWORK = {
    chainId: BSC_CHAIN_ID,
    chainName: "Binance Smart Chain Mainnet",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: ["https://bsc-dataseed.binance.org/"],
    blockExplorerUrls: ["https://bscscan.com"],
  };

  // Function to ensure the wallet is connected to BSC Mainnet
  const ensureBSCNetwork = async () => {
    if (!window.ethereum) return false;

    try {
      const currentChainId = await window.ethereum.request({ method: "eth_chainId" });

      if (currentChainId !== BSC_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: BSC_CHAIN_ID }],
          });
          return true;
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [BSC_NETWORK],
              });
              return true;
            } catch (addError) {
              console.error("Failed to add BSC network:", addError);
              setError("Failed to add BSC network. Please add it manually in MetaMask.");
              return false;
            }
          } else {
            console.error("Failed to switch to BSC network:", switchError);
            setError("Failed to switch to BSC network. Please switch manually in MetaMask.");
            return false;
          }
        }
      }
      return true;
    } catch (error) {
      console.error("Network check error:", error);
      setError("Failed to check current network. Please ensure you're connected to BSC Mainnet.");
      return false;
    }
  };

  // Function to connect wallet
  const connectWallet = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!window.ethereum) {
        setError("Ethereum wallet not detected. Please install MetaMask.");
        setLoading(false);
        return;
      }

      const isBSCConnected = await ensureBSCNetwork();
      if (!isBSCConnected) {
        setLoading(false);
        return;
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

      const ethersProvider = new ethers.BrowserProvider(window.ethereum);

      const network = await ethersProvider.getNetwork();
      setNetworkName(network.name);

      const ethersSigner = await ethersProvider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, abi, ethersSigner);

      const usdtTokenAddress = await contractInstance.usdt();

      const erc20Abi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)",
      ];

      const usdtContractInstance = new ethers.Contract(usdtTokenAddress, erc20Abi, ethersSigner);

      const connectedAccount = accounts[0];
      setAccount(connectedAccount);
      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setContract(contractInstance);
      setUsdtContract(usdtContractInstance);
      setUsdtAddress(usdtTokenAddress);
      setExecutionData((prev) => ({ ...prev, userAddress: connectedAccount }));

      const ownerAddress = await contractInstance.owner();
      setIsOwner(ownerAddress.toLowerCase() === connectedAccount.toLowerCase());

      const executerAddress = await contractInstance.executer();
      setIsExecuter(executerAddress.toLowerCase() === connectedAccount.toLowerCase());

      await loadContractInfo(contractInstance);

      window.ethereum.on("accountsChanged", (newAccounts) => {
        window.location.reload();
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });

      await loadBalances(connectedAccount, ethersProvider, usdtContractInstance);
      await loadTrialDetails(connectedAccount, contractInstance);

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
      window.ethereum.removeAllListeners("accountsChanged");
      window.ethereum.removeAllListeners("chainChanged");
    }

    setAccount("");
    setProvider(null);
    setSigner(null);
    setContract(null);
    setUsdtContract(null);
    setUsdtAddress("");
    setUsdtBalance("0");
    setBnbBalance("0");
    setTrialDetails(null);
    setNetworkName("");
    setIsOwner(false);
    setIsExecuter(false);
    setSuccess("Wallet disconnected");
  };

  // Function to load contract info
  const loadContractInfo = async (contractInstance) => {
    if (!contractInstance) return;

    try {
      const executerWallet = await contractInstance.executer();
      const feeCollector = await contractInstance.feeCollector();

      setContractInfo({
        executerWallet,
        feeCollector,
        // Note: Removed specific reward amount retrieval as it's not in the current contract
      });
    } catch (error) {
      console.error("Error loading contract info:", error);
    }
  };

  // Function to load user balances
  const loadBalances = async (userAccount, ethersProvider, tokenContract) => {
    if (!userAccount || !ethersProvider || !tokenContract) return;

    try {
      const ethBalanceWei = await ethersProvider.getBalance(userAccount);
      const ethBalanceEth = ethers.formatEther(ethBalanceWei);
      setBnbBalance(ethBalanceEth);

      const usdtBalanceWei = await tokenContract.balanceOf(userAccount);
      const usdtBalanceFormated = ethers.formatUnits(usdtBalanceWei, 18);
      setUsdtBalance(usdtBalanceFormated);
    } catch (error) {
      console.error("Balance Loading Error:", error);
    }
  };

  // Function to load user trial details
  const loadTrialDetails = async (userAccount, contractInstance) => {
    if (!userAccount || !contractInstance) return;

    try {
      const trial = await contractInstance.userTrials(userAccount);

      setTrialDetails({
        completedTrials: Number(trial.trialsCompleted),
        startTime: Number(trial.lastTrialStart) > 0 ? new Date(Number(trial.lastTrialStart) * 1000).toLocaleString() : "Not started",
        isActive: trial.isActive,
      });
    } catch (error) {
      console.error("Trial Details Loading Error:", error);
    }
  };

  // UseEffect to track balances and trial details periodically
  useEffect(() => {
    if (!account || !provider || !usdtContract || !contract) return;

    loadBalances(account, provider, usdtContract);
    loadTrialDetails(account, contract);

    const interval = setInterval(() => {
      loadBalances(account, provider, usdtContract);
      loadTrialDetails(account, contract);
    }, 10000);

    return () => clearInterval(interval);
  }, [account, provider, usdtContract, contract]);

  // Function to approve USDT spending
  const approveUSDT = async () => {
    if (!usdtContract || !contract) return;

    const isBSCConnected = await ensureBSCNetwork();
    if (!isBSCConnected) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const depositAmountWei = ethers.parseUnits(usdtDepositAmount, 18);

      const currentAllowance = await usdtContract.allowance(account, contractAddress);

      if (currentAllowance < depositAmountWei) {
        const approveTx = await usdtContract.approve(contractAddress, depositAmountWei);
        setSuccess("Approval transaction sent. Please wait for confirmation...");

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
  const startTrial = async () => {
    if (!contract) return;

    const isBSCConnected = await ensureBSCNetwork();
    if (!isBSCConnected) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const flashLoanAmountWei = ethers.parseUnits(flashLoanAmount, 18);
      const depositAmountWei = ethers.parseUnits(usdtDepositAmount, 18);
      const bnbFeeAmountWei = ethers.parseEther(bnbFeeAmount);

      const tx = await contract.startTrial(flashLoanAmountWei, depositAmountWei, { value: bnbFeeAmountWei });

      setSuccess("Transaction sent. Please wait for confirmation...");

      await tx.wait();
      await loadBalances(account, provider, usdtContract);
      await loadTrialDetails(account, contract);

      setSuccess("Arbitrage trial started successfully!");
    } catch (error) {
      console.error("Starting Trial Error:", error);

      let errorMessage = "Failed to start arbitrage trial";

      if (error.data) {
        try {
          const decodedError = contract.interface.parseError(error.data);

          if (decodedError && decodedError.signature) {
            const errorName = decodedError.name;

            // Handle specific known errors from the contract
            switch (errorName) {
              case "InsufficientUSDT":
                errorMessage = "Insufficient USDT balance";
                break;
              case "ArbitrageBotAtCapacity":
                errorMessage = "Arbitrage bot is at capacity";
                break;
              case "InsufficientBNB":
                errorMessage = "Insufficient BNB for fees";
                break;
              case "TrialAlreadyStarted":
                errorMessage = "A trial is already in progress";
                break;
              default:
                errorMessage = `Contract error: ${errorName}`;
            }
          }
        } catch (parseError) {
          errorMessage += ": " + (error.reason || error.message || "Unknown custom error");
        }
      } else {
        errorMessage += ": " + (error.reason || error.message || "Unknown error");
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Executer function to execute arbitrage
  const executeArbitrage = async () => {
    if (!contract || !isExecuter) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const loanAmountWei = ethers.parseUnits(executionData.loanAmount, 18);
      const usdtAmountWei = ethers.parseUnits(executionData.usdtAmount, 18);
      const userAddress = executionData.userAddress;

      if (!ethers.isAddress(userAddress)) {
        throw new Error("Invalid user address");
      }

      const tx = await contract.executeArbitrage(loanAmountWei, usdtAmountWei, userAddress);

      setSuccess("Arbitrage execution transaction sent. Please wait for confirmation...");

      await tx.wait();

      setSuccess("Arbitrage operation executed successfully!");
    } catch (error) {
      console.error("Arbitrage Execution Error:", error);

      let errorMessage = "Failed to execute arbitrage";

      if (error.data) {
        try {
          const decodedError = contract.interface.parseError(error.data);

          if (decodedError && decodedError.signature) {
            const errorName = decodedError.name;

            switch (errorName) {
              case "UnauthorizedCaller":
                errorMessage = "Unauthorized to execute arbitrage";
                break;
              case "ArbitrageBotAtCapacity":
                errorMessage = "Arbitrage bot is at capacity";
                break;
              case "TrialAlreadyStarted":
                errorMessage = "Trial is already in progress";
                break;
              default:
                errorMessage = `Contract error: ${errorName}`;
            }
          }
        } catch (parseError) {
          errorMessage += ": " + (error.reason || error.message || "Unknown custom error");
        }
      } else {
        errorMessage += ": " + (error.reason || error.message || "Unknown error");
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Owner function to update executor wallet
  const updateExecutorWallet = async () => {
    if (!contract || !isOwner) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!ethers.isAddress(newExecuterWallet)) {
        throw new Error("Invalid executor address");
      }

      const tx = await contract.updateExecutorWallet(newExecuterWallet);

      setSuccess("Executor update transaction sent. Please wait for confirmation...");

      await tx.wait();
      await loadContractInfo(contract);

      setSuccess("Executor wallet updated successfully!");
      setNewExecuterWallet("");
    } catch (error) {
      console.error("Executor Update Error:", error);

      let errorMessage = "Failed to update executor";

      if (error.data) {
        try {
          const decodedError = contract.interface.parseError(error.data);

          if (decodedError && decodedError.signature) {
            const errorName = decodedError.name;

            switch (errorName) {
              case "InvalidParameters":
                errorMessage = "Invalid executor address";
                break;
              default:
                errorMessage = `Contract error: ${errorName}`;
            }
          }
        } catch (parseError) {
          errorMessage += ": " + (error.reason || error.message || "Unknown custom error");
        }
      } else {
        errorMessage += ": " + (error.reason || error.message || "Unknown error");
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Prepare props for UI component
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
    currentTab,
    executionData,
    newExecuterWallet,
    // Form update handlers
    setFlashLoanAmount,
    setUsdtDepositAmount,
    setbnbFeeAmount,
    setExecutionData,
    setCurrentTab,
    setNewExecuterWallet,
    // Functions
    connectWallet,
    disconnectWallet,
    approveUSDT,
    startTrial,
    executeArbitrage,
    updateExecutorWallet,
  };

  // Render the UI component with all the props
  return <ArbitrageUI {...uiProps} />;
};

export default SecureArbitrageComponent;
