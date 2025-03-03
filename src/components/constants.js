export const contractAddress = "0xE1b5c57bee405eAF94A16bDBd4d58a1bD45C87F1";

// Contract ABI copied from your artifact or compilation output
export const abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "usdtTokenAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "aavePoolAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "ownerAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "executerAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "ArbitrageBotCapacityReached",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "required",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "actual",
        type: "uint256",
      },
    ],
    name: "InsufficientBNBForGasFees",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "required",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "actual",
        type: "uint256",
      },
    ],
    name: "InsufficientExecutorBalance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "required",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "actual",
        type: "uint256",
      },
    ],
    name: "InsufficientUSDTBalance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "expected",
        type: "address",
      },
      {
        internalType: "address",
        name: "received",
        type: "address",
      },
    ],
    name: "InvalidAssetForFlashLoan",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "min",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "max",
        type: "uint256",
      },
    ],
    name: "InvalidRewardRange",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "trialNumber",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxTrials",
        type: "uint256",
      },
    ],
    name: "InvalidTrialNumber",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidZeroAddress",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [],
    name: "PayoutTransferFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  },
  {
    inputs: [],
    name: "RefundNotAuthorized",
    type: "error",
  },
  {
    inputs: [],
    name: "RefundPeriodExpired",
    type: "error",
  },
  {
    inputs: [],
    name: "RefundTransferFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "TrialAlreadyInProgress",
    type: "error",
  },
  {
    inputs: [],
    name: "TrialInactive",
    type: "error",
  },
  {
    inputs: [],
    name: "TrialLimitReached",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "trialNumber",
        type: "uint256",
      },
    ],
    name: "TrialNotMarkedForRefund",
    type: "error",
  },
  {
    inputs: [],
    name: "TrialPeriodEnded",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
      {
        internalType: "address",
        name: "expectedPool",
        type: "address",
      },
    ],
    name: "UnapprovedPoolCaller",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
      {
        internalType: "address",
        name: "requiredExecuter",
        type: "address",
      },
    ],
    name: "UnauthorizedExecuter",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "trialNumber",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "rewardAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "ArbitrageExecutionCompleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "trialNumber",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "reason",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "ArbitrageExecutionFailed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "loanAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "trialNumber",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "ArbitrageExecutionStarted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "BNBFundsWithdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousExecuter",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newExecuter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "ExecuterWalletUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousCollector",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newCollector",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "FeeCollectorUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "previousMinimum",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "previousMaximum",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newMinimum",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newMaximum",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "RewardRangeConfigured",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "flashLoanAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "usdtDepositAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "bnbFeeAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "TrialInitiated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "trialNumber",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "refundAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "TrialRefundProcessed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "depositor",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "USDTFundsDeposited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "USDTFundsWithdrawn",
    type: "event",
  },
  {
    inputs: [],
    name: "aavePool",
    outputs: [
      {
        internalType: "contract IPool",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "newMinimum",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "newMaximum",
        type: "uint256",
      },
    ],
    name: "configureRewardRange",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "depositUSDT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "loanAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "usdtAmount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
    ],
    name: "executeArbitrageOperation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "premium",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "params",
        type: "bytes",
      },
    ],
    name: "executeOperation",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "executerWallet",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "feeCollector",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
    ],
    name: "getUserTrialDetails",
    outputs: [
      {
        internalType: "uint256",
        name: "completedTrials",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "startTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "depositedAmount",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isActive",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "isCompleted",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
    ],
    name: "isTrialCompleted",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "trialNumber",
        type: "uint256",
      },
    ],
    name: "isTrialPendingRefund",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maximumRewardAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "minimumRewardAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "trialNumber",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "refundAmount",
        type: "uint256",
      },
    ],
    name: "processFailedTrialRefund",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "flashLoanAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "usdtDepositAmount",
        type: "uint256",
      },
    ],
    name: "startArbitrageTrial",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newExecuterWallet",
        type: "address",
      },
    ],
    name: "updateExecuterWallet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newFeeCollector",
        type: "address",
      },
    ],
    name: "updateFeeCollector",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "usdtToken",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawBNB",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawUSDT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];