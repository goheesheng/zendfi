'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useThetanuts } from '@/context/ThetanutsContext';
import { useLoanContext } from '@/context/LoanContext';
import { LOAN_ASSETS, USDC_ADDRESS, DEFAULT_MARKET_MAKER, type AssetKey } from '@/services/constants';
import { ethers } from 'ethers';

export function useBalances() {
  const { address } = useAccount();
  const { service } = useThetanuts();
  const { state } = useLoanContext();
  const [collateralBalance, setCollateralBalance] = useState('--');
  const [mmLiquidity, setMmLiquidity] = useState('--');

  const asset = LOAN_ASSETS[state.selectedCollateral as AssetKey];

  const fetchCollateralBalance = useCallback(async () => {
    if (!address || !asset) return;
    try {
      const bal = await service.getBalance(asset.collateral);
      setCollateralBalance(parseFloat(ethers.formatUnits(bal, asset.decimals)).toFixed(6));
    } catch {
      setCollateralBalance('--');
    }
  }, [address, asset, service]);

  const fetchMmLiquidity = useCallback(async () => {
    try {
      const bal = await service.getBalance(USDC_ADDRESS, DEFAULT_MARKET_MAKER);
      setMmLiquidity(parseInt(ethers.formatUnits(bal, 6)).toLocaleString());
    } catch {
      setMmLiquidity('--');
    }
  }, [service]);

  useEffect(() => {
    fetchCollateralBalance();
    fetchMmLiquidity();
    const interval = setInterval(() => {
      fetchCollateralBalance();
      fetchMmLiquidity();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchCollateralBalance, fetchMmLiquidity]);

  return { collateralBalance, mmLiquidity, refreshBalances: fetchCollateralBalance };
}
