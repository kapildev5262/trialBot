import React, { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { Token, SupportedChainId } from '@uniswap/sdk-core';
import { FeeAmount, computePoolAddress } from '@uniswap/v3-sdk';
import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json';
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';

import './UniswapQuote.css'; // Import your CSS file for styling

// Constants
const POOL_FACTORY_CONTRACT_ADDRESS = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
const QUOTER_CONTRACT_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6';
const READABLE_FORM_LEN = 4;

// Token Definitions
const TOKENS = {
  WETH: new Token(
    SupportedChainId.MAINNET,
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    18,
    'WETH',
    'Wrapped Ether'
  ),
  USDC: new Token(
    SupportedChainId.MAINNET,
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    6,
    'USDC',
    'USD//C'
  ),
  USDT: new Token(
    SupportedChainId.MAINNET,
    '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    6,
    'USDT',
    'Tether USD'
  ),
  DAI: new Token(
    SupportedChainId.MAINNET,
    '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    18,
    'DAI',
    'Dai Stablecoin'
  ),
  LINK: new Token(
    SupportedChainId.MAINNET,
    '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    18,
    'LINK',
    'ChainLink Token'
  ),
  UNI: new Token(
    SupportedChainId.MAINNET,
    '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    18,
    'UNI',
    'Uniswap'
  )
};

// Fee options
const FEE_OPTIONS = [
  { value: FeeAmount.LOWEST, label: '0.01% (Lowest)' },
  { value: FeeAmount.LOW, label: '0.05% (Low)' },
  { value: FeeAmount.MEDIUM, label: '0.3% (Medium)' },
  { value: FeeAmount.HIGH, label: '1% (High)' }
];

// Helper functions
function fromReadableAmount(amount, decimals) {
  return ethers.utils.parseUnits(amount.toString(), decimals);
}

function toReadableAmount(rawAmount, decimals) {
  return ethers.utils.formatUnits(rawAmount, decimals).slice(0, READABLE_FORM_LEN);
}

function getProvider() {
  return new ethers.providers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/iIks_aShfkGOF8-Nl658iTVe9kxC62jM');
}

const UniswapQuote = () => {
  // State variables
  const [tokenIn, setTokenIn] = useState(TOKENS.USDC);
  const [tokenOut, setTokenOut] = useState(TOKENS.WETH);
  const [amountIn, setAmountIn] = useState(1000);
  const [poolFee, setPoolFee] = useState(FeeAmount.MEDIUM);
  const [outputAmount, setOutputAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Get pool constants
  const getPoolConstants = async () => {
    try {
      const currentPoolAddress = computePoolAddress({
        factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
        tokenA: tokenIn,
        tokenB: tokenOut,
        fee: poolFee,
      });

      const poolContract = new ethers.Contract(
        currentPoolAddress,
        IUniswapV3PoolABI.abi,
        getProvider()
      );

      const [token0, token1, fee] = await Promise.all([
        poolContract.token0(),
        poolContract.token1(),
        poolContract.fee(),
      ]);

      return {
        token0,
        token1,
        fee,
      };
    } catch (err) {
      console.error('Error getting pool constants:', err);
      throw err;
    }
  };

  // Quote function
  const getQuote = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const quoterContract = new ethers.Contract(
        QUOTER_CONTRACT_ADDRESS,
        Quoter.abi,
        getProvider()
      );
      
      const poolConstants = await getPoolConstants();

      const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
        poolConstants.token0,
        poolConstants.token1,
        poolConstants.fee,
        fromReadableAmount(amountIn, tokenIn.decimals).toString(),
        0
      );

      const readableAmount = toReadableAmount(quotedAmountOut, tokenOut.decimals);
      setOutputAmount(readableAmount);
    } catch (err) {
      console.error('Error getting quote:', err);
      setError('Failed to get quote. The selected pool might not exist or there was an RPC error.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle token swap
  const handleSwapTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setOutputAmount('');
  };

  return (
    <div className="uniswap-quote-container">
      <h2>Uniswap V3 Quote</h2>
      
      {/* Input token selection */}
      <div className="input-group">
        <label>Input Token:</label>
        <select 
          value={tokenIn.symbol} 
          onChange={(e) => {
            setTokenIn(TOKENS[e.target.value]);
            setOutputAmount('');
          }}
        >
          {Object.keys(TOKENS).map((symbol) => (
            <option 
              key={`in-${symbol}`} 
              value={symbol}
              disabled={symbol === tokenOut.symbol}
            >
              {TOKENS[symbol].symbol}
            </option>
          ))}
        </select>
      </div>
      
      {/* Amount input */}
      <div className="input-group">
        <label>Amount:</label>
        <input 
          type="number" 
          value={amountIn} 
          onChange={(e) => {
            setAmountIn(e.target.value > 0 ? e.target.value : 0);
            setOutputAmount('');
          }}
          min="0"
          step="1"
        />
      </div>
      
      {/* Swap button */}
      <button className="swap-button" onClick={handleSwapTokens}>
        ↓↑ Swap Tokens
      </button>
      
      {/* Output token selection */}
      <div className="input-group">
        <label>Output Token:</label>
        <select 
          value={tokenOut.symbol} 
          onChange={(e) => {
            setTokenOut(TOKENS[e.target.value]);
            setOutputAmount('');
          }}
        >
          {Object.keys(TOKENS).map((symbol) => (
            <option 
              key={`out-${symbol}`} 
              value={symbol}
              disabled={symbol === tokenIn.symbol}
            >
              {TOKENS[symbol].symbol}
            </option>
          ))}
        </select>
      </div>
      
      {/* Fee selection */}
      <div className="input-group">
        <label>Fee Tier:</label>
        <select 
          value={poolFee} 
          onChange={(e) => {
            setPoolFee(Number(e.target.value));
            setOutputAmount('');
          }}
        >
          {FEE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* Quote button */}
      <button 
        className="quote-button" 
        onClick={getQuote} 
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Get Quote'}
      </button>
      
      {/* Output display */}
      {outputAmount && (
        <div className="quote-result">
          <h3>Quote Result:</h3>
          <div className="quote-details">
            <p>Input: {amountIn} {tokenIn.symbol}</p>
            <p>Output: {outputAmount} {tokenOut.symbol}</p>
            <p>Price per {tokenIn.symbol}: {(outputAmount / amountIn).toFixed(6)} {tokenOut.symbol}</p>
          </div>
        </div>
      )}
      
      {/* Error display */}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default UniswapQuote;