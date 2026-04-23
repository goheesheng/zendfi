// Wallet connection service using ethers v6 + browser wallet (MetaMask etc.)

import { ethers, BrowserProvider, JsonRpcSigner, JsonRpcProvider } from 'ethers';
import { CHAIN_ID } from './constants';

const BASE_CHAIN_CONFIG = {
  chainId: '0x' + CHAIN_ID.toString(16),
  chainName: 'Base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://mainnet.base.org'],
  blockExplorerUrls: ['https://basescan.org'],
};

export interface WalletState {
  address: string | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  chainId: number | null;
}

type WalletListener = (state: WalletState) => void;

class WalletService {
  private state: WalletState = {
    address: null,
    provider: null,
    signer: null,
    chainId: null,
  };
  private listeners: WalletListener[] = [];
  private readProvider: JsonRpcProvider;

  constructor() {
    this.readProvider = new JsonRpcProvider('https://mainnet.base.org', CHAIN_ID);
  }

  /** Read-only provider for querying chain data without a wallet */
  getReadProvider(): JsonRpcProvider {
    return this.readProvider;
  }

  getState(): WalletState {
    return { ...this.state };
  }

  onChange(listener: WalletListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    const snapshot = { ...this.state };
    this.listeners.forEach((l) => l(snapshot));
  }

  async connect(): Promise<WalletState> {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      throw new Error('No wallet detected. Please install MetaMask or another Web3 wallet.');
    }

    const provider = new BrowserProvider(ethereum);
    await provider.send('eth_requestAccounts', []);

    // Switch to Base if needed
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== CHAIN_ID) {
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BASE_CHAIN_CONFIG.chainId }],
        });
      } catch (switchError: any) {
        // Chain not added, try adding it
        if (switchError.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BASE_CHAIN_CONFIG],
          });
        } else {
          throw switchError;
        }
      }
      // Re-initialize provider after chain switch
      const freshProvider = new BrowserProvider(ethereum);
      return this.initState(freshProvider, ethereum);
    }

    return this.initState(provider, ethereum);
  }

  private async initState(provider: BrowserProvider, ethereum: any): Promise<WalletState> {
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();

    this.state = {
      address,
      provider,
      signer,
      chainId: Number(network.chainId),
    };

    // Listen for account/chain changes
    ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnect();
      } else {
        this.state.address = accounts[0];
        this.notify();
      }
    });

    ethereum.on('chainChanged', () => {
      // Reload on chain change for simplicity
      window.location.reload();
    });

    this.notify();
    return this.getState();
  }

  disconnect() {
    this.state = { address: null, provider: null, signer: null, chainId: null };
    this.notify();
  }

  isConnected(): boolean {
    return this.state.address !== null;
  }
}

export const walletService = new WalletService();
