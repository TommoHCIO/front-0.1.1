import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { useWallet } from '../context/WalletContext';
import { useUSDTBalance } from '../hooks/useUSDTBalance';
import { createUSDTTransferTransaction, sendAndConfirmTransaction } from '../services/transactions';

export const Incubator = () => {
  const [usdtAmount, setUsdtAmount] = useState<string>('100');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const { isConnected, wallet } = useWallet();
  const { balance: totalDeposited, isLoading: isBalanceLoading, error: balanceError, refetch: refetchBalance } = useUSDTBalance();

  const goalAmount = 33_000;
  const rewardRate = 2.5;
  const expectedRewards = parseFloat(usdtAmount || '0') * rewardRate;
  const progressPercentage = (totalDeposited / goalAmount) * 100;

  const handleDeposit = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    const amount = parseFloat(usdtAmount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setError(null);
    setIsLoading(true);
    setIsConfirming(false);

    try {
      setError('Creating USDT account...');
      const transaction = await createUSDTTransferTransaction(wallet, amount);
      
      setError('Please confirm the transaction in your wallet...');
      setIsConfirming(true);
      
      const signature = await sendAndConfirmTransaction(wallet, transaction);
      console.log('Transaction successful:', signature);
      
      setError('Transaction successful! Updating balance...');
      await refetchBalance();
      
      setError(null);
    } catch (err: any) {
      let errorMessage = 'Failed to process deposit. Please try again.';
      
      if (err.message.includes('insufficient')) {
        errorMessage = 'Insufficient USDT balance';
      } else if (err.message.includes('cancelled')) {
        errorMessage = 'Transaction cancelled';
      } else if (err.message.includes('Invalid')) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsConfirming(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setUsdtAmount(value);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 text-white relative overflow-hidden border border-white/10">
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1 }}
      />

      <div className="relative max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2 gradient-text">CTE Incubator</h2>
          <p className="text-gray-400">Participate in the initial token distribution</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-sm text-primary-200 mb-1">Total USDT Deposited</div>
              <div className="flex items-baseline gap-1">
                {isBalanceLoading ? (
                  <span className="text-2xl font-bold text-accent animate-pulse">Loading...</span>
                ) : balanceError ? (
                  <span className="text-2xl font-bold text-red-400">Error loading balance</span>
                ) : (
                  <span className="text-2xl font-bold text-accent">
                    {totalDeposited.toLocaleString()}
                  </span>
                )}
                <span className="text-sm text-primary-400">USDT</span>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-sm text-primary-200 mb-1">Goal Amount</div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-accent">
                  {goalAmount.toLocaleString()}
                </span>
                <span className="text-sm text-primary-400">USDT</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm text-primary-200">
              <span>Progress</span>
              <span className="font-medium">
                {progressPercentage.toFixed(2)}%
              </span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-accent to-accent/60"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-1">
              <div className="relative">
                <input
                  type="text"
                  value={usdtAmount}
                  onChange={handleAmountChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Enter USDT amount"
                  disabled={isLoading}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  USDT
                </span>
              </div>
            </div>

            <Button 
              variant="primary" 
              icon={Wallet} 
              className="md:col-span-1"
              onClick={handleDeposit}
              disabled={isLoading || !isConnected}
            >
              {isLoading ? (
                isConfirming ? 'Confirming...' : 'Processing...'
              ) : (
                'Deposit'
              )}
            </Button>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10 md:col-span-1">
              <div className="text-xs text-gray-400">Expected Rewards</div>
              <div className="text-lg font-semibold text-accent">
                {expectedRewards.toFixed(2)} $CTE
              </div>
            </div>
          </div>

          {error && (
            <div className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
              error.includes('successful') 
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};