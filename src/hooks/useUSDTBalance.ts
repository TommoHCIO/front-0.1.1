import { useState, useEffect, useCallback, useRef } from 'react';
import { getUSDTBalance } from '../utils/solana';
import { SOLANA_CONSTANTS } from '../utils/constants';

export function useUSDTBalance() {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef<boolean>(true);
  const intervalRef = useRef<NodeJS.Timeout>();
  const fetchingRef = useRef<boolean>(false);

  const fetchBalance = useCallback(async () => {
    if (!mountedRef.current || fetchingRef.current) return;

    fetchingRef.current = true;
    try {
      const newBalance = await getUSDTBalance();
      
      if (mountedRef.current) {
        setBalance(newBalance);
        setError(null);
        setIsLoading(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError('Unable to fetch balance');
        setIsLoading(false);
      }
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchBalance();

    intervalRef.current = setInterval(() => {
      if (!fetchingRef.current) {
        fetchBalance();
      }
    }, SOLANA_CONSTANTS.BALANCE_REFRESH_INTERVAL);

    return () => {
      mountedRef.current = false;
      fetchingRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchBalance]);

  const refetch = useCallback(() => {
    return fetchBalance();
  }, [fetchBalance]);

  return { balance, isLoading, error, refetch };
}