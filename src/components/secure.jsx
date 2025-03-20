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
    minimumReward: "0",
    maximumReward: "0",
    arbitrageBotMinimumBalance: "0",
    minDeposit: "0",
    maxFlashLoanAmount: "0",
    trialLimit: 0,
    timeLimit: 0,
  });
  const [executionData, setExecutionData] = useState({
    loanAmount: "1000",
    usdtAmount: "100",
    userAddress: "",
  });
  const [refundUserAddress, setRefundUserAddress] = useState("");
  const [newExecuterWallet, setNewExecuterWallet] = useState("");
  const [newAavePool, setNewAavePool] = useState("");
  const [contractUsdtBalance, setContractUsdtBalance] = useState("0");
  const [contractBnbBalance, setContractBnbBalance] = useState("0");
  const [functionToggleData, setFunctionToggleData] = useState({
    functionSelector: "",
    allowed: true,
  });

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

  // Contract constants (from the contract)
  const CONTRACT_CONSTANTS = {
    TRIAL_LIMIT: 3,
    TIME_LIMIT: 3600, // 1 hour in seconds
    MIN_REWARD: ethers.parseEther("0.1"), // 0.1 BNB in wei (1e17)
    MAX_REWARD: ethers.parseEther("1.0"), // 1 BNB in wei (1e18)
    MINIMUM_DEPOSIT: ethers.parseEther("0.008"), // 0.008 BNB in wei (8e15)
    ARBITRAGE_BOT_MINIMUM_BALANCE: ethers.parseEther("6.0"), // 6 BNB in wei (6e18)
    MAX_FLASH_LOAN_AMOUNT: ethers.parseUnits("1000", 18), // 1000 USDT
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

      await loadBalances(connectedAccount, ethersProvider, usdtContractInstance, contractInstance);
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

      setContractInfo({
        executerWallet,
        minimumReward: ethers.formatEther(CONTRACT_CONSTANTS.MIN_REWARD),
        maximumReward: ethers.formatEther(CONTRACT_CONSTANTS.MAX_REWARD),
        arbitrageBotMinimumBalance: ethers.formatEther(CONTRACT_CONSTANTS.ARBITRAGE_BOT_MINIMUM_BALANCE),
        minDeposit: ethers.formatEther(CONTRACT_CONSTANTS.MINIMUM_DEPOSIT),
        maxFlashLoanAmount: ethers.formatUnits(CONTRACT_CONSTANTS.MAX_FLASH_LOAN_AMOUNT, 18),
        trialLimit: CONTRACT_CONSTANTS.TRIAL_LIMIT,
        timeLimit: CONTRACT_CONSTANTS.TIME_LIMIT / 3600, // Convert to hours
      });
    } catch (error) {
      console.error("Error loading contract info:", error);
    }
  };

  // Function to load user balances
  const loadBalances = async (userAccount, ethersProvider, tokenContract, contractInstance) => {
    if (!userAccount || !ethersProvider || !tokenContract) return;

    try {
      // Load user BNB balance
      const ethBalanceWei = await ethersProvider.getBalance(userAccount);
      const ethBalanceEth = ethers.formatEther(ethBalanceWei);
      setBnbBalance(ethBalanceEth);

      // Load user USDT balance
      const usdtBalanceWei = await tokenContract.balanceOf(userAccount);
      const usdtBalanceFormated = ethers.formatUnits(usdtBalanceWei, 18);
      setUsdtBalance(usdtBalanceFormated);

      // If contract instance is available, load contract balances
      if (contractInstance) {
        const contractAddress = await contractInstance.getAddress();

        // Load contract BNB balance
        const contractBnbBalanceWei = await ethersProvider.getBalance(contractAddress);
        const contractBnbBalanceFormatted = ethers.formatEther(contractBnbBalanceWei);
        setContractBnbBalance(contractBnbBalanceFormatted);

        // Load contract USDT balance
        const contractUsdtBalanceWei = await tokenContract.balanceOf(contractAddress);
        const contractUsdtBalanceFormatted = ethers.formatUnits(contractUsdtBalanceWei, 18);
        setContractUsdtBalance(contractUsdtBalanceFormatted);
      }
    } catch (error) {
      console.error("Balance Loading Error:", error);
    }
  };

  // Function to load user trial details
  const loadTrialDetails = async (userAccount, contractInstance) => {
    if (!userAccount || !contractInstance) return;

    try {
      const trial = await contractInstance.getUserTrial(userAccount);
      const isTrialCompleted = await contractInstance.isTrialCompleted(userAccount);

      setTrialDetails({
        trialsCompleted: Number(trial.trialsCompleted),
        timestamp: Number(trial.timestamp),
        active: trial.active,
        bnbDeposited: ethers.formatEther(trial.bnbDeposited),
        usdtDeposited: ethers.formatUnits(trial.usdtDeposited, 18),
        loanAmount: ethers.formatUnits(trial.loanAmount, 18),
        refundsProcessed: Number(trial.refundsProcessed),
        payoutsReceived: Number(trial.payoutsReceived),
        completed: isTrialCompleted,
      });
    } catch (error) {
      console.error("Trial Details Loading Error:", error);
    }
  };

  // UseEffect to track balances and trial details periodically
  useEffect(() => {
    if (!account || !provider || !usdtContract || !contract) return;

    loadBalances(account, provider, usdtContract, contract);
    loadTrialDetails(account, contract);

    const interval = setInterval(() => {
      loadBalances(account, provider, usdtContract, contract);
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
      const depositAmountWei = ethers.parseUnits(usdtDepositAmount);

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

  const startTrial = async () => {
    if (!contract) return;

    const isBSCConnected = await ensureBSCNetwork();
    if (!isBSCConnected) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Ensure flash loan amount doesn't exceed maximum
      if (parseFloat(flashLoanAmount) > parseFloat(contractInfo.maxFlashLoanAmount)) {
        throw new Error(`Flash loan amount cannot exceed ${contractInfo.maxFlashLoanAmount}`);
      }

      const flashLoanAmountWei = ethers.parseUnits(flashLoanAmount);
      const depositAmountWei = ethers.parseUnits(usdtDepositAmount);
      const bnbFeeAmountWei = ethers.parseEther(bnbFeeAmount);

      // Check if BNB amount is at least the minimum required
      if (bnbFeeAmountWei < CONTRACT_CONSTANTS.MINIMUM_DEPOSIT) {
        throw new Error(`BNB fee must be at least ${ethers.formatEther(CONTRACT_CONSTANTS.MINIMUM_DEPOSIT)} BNB`);
      }

      const tx = await contract.startTrial(flashLoanAmountWei, depositAmountWei, { value: bnbFeeAmountWei });

      setSuccess("Transaction sent. Please wait for confirmation...");

      await tx.wait();
      await loadBalances(account, provider, usdtContract, contract);
      await loadTrialDetails(account, contract);

      setSuccess("Arbitrage trial started successfully!");
    } catch (error) {
      console.error("Starting Trial Error:", error);

      let errorMessage = "Failed to start arbitrage trial";

      if (error.data) {
        try {
          const decodedError = contract.interface.parseError(error.data);

          if (decodedError && decodedError.name) {
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
              case "MaxInputExceeded":
                errorMessage = "Flash loan amount exceeds maximum";
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
    console.log("Contract address:", contract.target);
    console.log("Contract interface:", contract.interface);
    try {
      const loanAmountWei = ethers.parseUnits(executionData.loanAmount);
      const usdtAmountWei = ethers.parseUnits(executionData.usdtAmount);
      const userAddress = executionData.userAddress;

      console.log("Loan Amount:", loanAmountWei.toString());
      console.log("USDT Amount:", usdtAmountWei.toString());
      console.log("User Address:", userAddress);

      const trialStatus = await contract.getUserTrial(userAddress);
      console.log("Trial Status:", {
        active: trialStatus.active,
        trialsCompleted: trialStatus.trialsCompleted.toString(),
        payoutsReceived: trialStatus.payoutsReceived.toString(),
        refundsProcessed: trialStatus.refundsProcessed.toString(),
      });

      // Input validation
      if (!ethers.isAddress(userAddress)) {
        throw new Error("Invalid user address");
      }

      if (parseFloat(executionData.loanAmount) > parseFloat(contractInfo.maxFlashLoanAmount)) {
        throw new Error(`Flash loan amount cannot exceed ${contractInfo.maxFlashLoanAmount}`);
      }

      const tx = await contract.executeArbitrage(loanAmountWei, usdtAmountWei, userAddress);

      setSuccess("Arbitrage execution transaction sent. Please wait for confirmation...");

      await tx.wait();
      await loadTrialDetails(userAddress, contract);

      setSuccess("Arbitrage operation executed successfully!");
    } catch (error) {
      console.error("Arbitrage Execution Error:", error);

      let errorMessage = "Failed to execute arbitrage";

      if (error.data) {
        try {
          const decodedError = contract.interface.parseError(error.data);

          if (decodedError && decodedError.name) {
            const errorName = decodedError.name;

            switch (errorName) {
              case "UnauthorizedCaller":
                errorMessage = "Unauthorized to execute arbitrage";
                break;
              case "ArbitrageBotAtCapacity":
                errorMessage = "Arbitrage bot is at capacity";
                break;
              case "TrialAlreadyStarted":
                errorMessage = "Invalid trial state";
                break;
              case "TrialLimitExceeded":
                errorMessage = "Trial limit exceeded";
                break;
              case "TrialNotActive":
                errorMessage = "Trial is not active";
                break;
              case "MaxInputExceeded":
                errorMessage = "Flash loan amount exceeds maximum";
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

  // Process refund for a user (executer only)
  const processRefund = async () => {
    if (!contract || !isExecuter) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const userAddress = refundUserAddress;

      if (!ethers.isAddress(userAddress)) {
        throw new Error("Invalid user address");
      }

      // Get user trial data to calculate required BNB amount
      const userTrialData = await contract.getUserTrial(userAddress);

      // Send the transaction with calculated ETH value
      const tx = await contract.processRefund(userAddress, {
        value: ethers.parseEther("0.004"),
      });

      setSuccess("Refund processing transaction sent. Please wait for confirmation...");

      await tx.wait();
      await loadTrialDetails(userAddress, contract);

      setSuccess("Refund processed successfully!");
    } catch (error) {
      console.error("Refund Processing Error:", error);

      let errorMessage = "Failed to process refund";

      if (error.data) {
        try {
          const decodedError = contract.interface.parseError(error.data);

          if (decodedError && decodedError.name) {
            const errorName = decodedError.name;

            switch (errorName) {
              case "NoActiveTrialToRefund":
                errorMessage = "No active trial to refund";
                break;
              case "RefundLimitExceeded":
                errorMessage = "Refund limit exceeded";
                break;
              case "TrialLimitExceeded":
                errorMessage = "Trial limit exceeded";
                break;
              case "InsufficientBNB":
                errorMessage = "Insufficient BNB for refund";
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
  const updateExecuter = async () => {
    if (!contract || !isOwner) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!ethers.isAddress(newExecuterWallet)) {
        throw new Error("Invalid executor address");
      }

      const tx = await contract.updateExecuter(newExecuterWallet);

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

          if (decodedError && decodedError.name) {
            const errorName = decodedError.name;

            switch (errorName) {
              case "ZeroAddressNotAllowed":
                errorMessage = "Zero address not allowed";
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

  const updateAavePool = async () => {
    if (!contract || !isOwner) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!ethers.isAddress(newAavePool)) {
        throw new Error("Invalid Aave pool address");
      }

      const tx = await contract.updatePool(newAavePool);

      setSuccess("Aave pool update transaction sent. Please wait for confirmation...");

      await tx.wait();
      await loadContractInfo(contract);

      setSuccess("Aave pool updated successfully!");
      setNewAavePool("");
    } catch (error) {
      console.error("Aave Pool Update Error:", error);

      let errorMessage = "Failed to update Aave pool";

      if (error.data) {
        try {
          const decodedError = contract.interface.parseError(error.data);

          if (decodedError && decodedError.name) {
            const errorName = decodedError.name;

            switch (errorName) {
              case "ZeroAddressNotAllowed":
                errorMessage = "Zero address not allowed";
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

  // Function to toggle contract function permission
  const toggleFunction = async () => {
    if (!contract || !isOwner) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { functionSelector, allowed } = functionToggleData;

      if (!functionSelector || functionSelector.length !== 10 || !functionSelector.startsWith("0x")) {
        throw new Error("Invalid function selector (must be 10 characters starting with 0x)");
      }

      const tx = await contract.toggleFunction(functionSelector, allowed);

      setSuccess("Function toggle transaction sent. Please wait for confirmation...");

      await tx.wait();

      setSuccess(`Function ${functionSelector} permissions updated successfully!`);
      setFunctionToggleData({ functionSelector: "", allowed: true });
    } catch (error) {
      console.error("Function Toggle Error:", error);
      setError("Failed to toggle function: " + (error.reason || error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Function to retrieve USDT from contract
  const retrieveUSDT = async () => {
    if (!contract || !isOwner) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const tx = await contract.retrieveUSDT();
      setSuccess("USDT retrieval transaction sent. Please wait for confirmation...");

      await tx.wait();

      // Reload balances to reflect the changes
      await loadBalances(account, provider, usdtContract, contract);

      setSuccess("USDT retrieved successfully!");
    } catch (error) {
      console.error("USDT Retrieval Error:", error);

      let errorMessage = "Failed to retrieve USDT";

      if (error.data) {
        try {
          const decodedError = contract.interface.parseError(error.data);

          if (decodedError && decodedError.name) {
            errorMessage = `Contract error: ${decodedError.name}`;
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

  // Function to retrieve BNB from contract
  const retrieveBNB = async () => {
    if (!contract || !isOwner) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const tx = await contract.retrieveBNB();
      setSuccess("BNB retrieval transaction sent. Please wait for confirmation...");

      await tx.wait();

      // Reload balances to reflect the changes
      await loadBalances(account, provider, usdtContract, contract);

      setSuccess("BNB retrieved successfully!");
    } catch (error) {
      console.error("BNB Retrieval Error:", error);

      let errorMessage = "Failed to retrieve BNB";

      if (error.data) {
        try {
          const decodedError = contract.interface.parseError(error.data);

          if (decodedError && decodedError.name) {
            errorMessage = `Contract error: ${decodedError.name}`;
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

  // Function to deposit USDT into the contract
  const depositUSDT = async () => {
    if (!contract || !isOwner || !usdtContract) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const depositAmount = prompt("Enter USDT amount to deposit:", "10");

      if (!depositAmount) {
        setLoading(false);
        return; // User canceled
      }

      const depositAmountWei = ethers.parseUnits(depositAmount);

      // First, approve the contract to spend USDT
      const currentAllowance = await usdtContract.allowance(account, contractAddress);

      if (currentAllowance < depositAmountWei) {
        const approveTx = await usdtContract.approve(contractAddress, depositAmountWei);
        setSuccess("Approval transaction sent. Please wait for confirmation...");
        await approveTx.wait();
      }

      // Then call the deposit function
      const tx = await contract.depositUSDT(depositAmountWei);
      setSuccess("USDT deposit transaction sent. Please wait for confirmation...");

      await tx.wait();

      // Reload balances to reflect the changes
      await loadBalances(account, provider, usdtContract, contract);

      setSuccess("USDT deposited successfully!");
    } catch (error) {
      console.error("USDT Deposit Error:", error);

      let errorMessage = "Failed to deposit USDT";

      if (error.data) {
        try {
          const decodedError = contract.interface.parseError(error.data);

          if (decodedError && decodedError.signature) {
            errorMessage = `Contract error: ${decodedError.name}`;
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
    contractUsdtBalance,
    contractBnbBalance,
    refundUserAddress,
    functionToggleData,
    newAavePool,

    // Form update handlers
    setNewAavePool,
    setFlashLoanAmount,
    setUsdtDepositAmount,
    setbnbFeeAmount,
    setExecutionData,
    setCurrentTab,
    setNewExecuterWallet,
    setRefundUserAddress,
    setFunctionToggleData,
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
  };

  return <ArbitrageUI {...uiProps} />;
};

export default SecureArbitrageComponent;
