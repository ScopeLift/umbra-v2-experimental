import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback
} from 'react';
import { Core } from '@walletconnect/core';
import type Client from '@walletconnect/web3wallet';
import { Web3Wallet, type Web3WalletTypes } from '@walletconnect/web3wallet';
import type { SessionTypes } from '@walletconnect/types';
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';
import { useChainId } from 'wagmi';
import type { Address } from 'viem';

enum WC_SDK_EVENTS {
  SESSION_PROPOSAL = 'session_proposal'
}

enum WC_SDK_ERRORS {
  USER_REJECTED = 'USER_REJECTED'
}

export const EIP155 = 'eip155';

export const getEip155ChainId = (chainId: number): string => {
  return `${EIP155}:${chainId}`;
};

export const stripEip155Prefix = (eip155Address: string): string => {
  return eip155Address.split(':').pop() ?? '';
};

type WalletConnectContextType = {
  connect: ({
    uri,
    stealthAddress
  }: {
    uri: string;
    stealthAddress: Address;
  }) => Promise<void>;
  sessions: SessionTypes.Struct[];
  setStealthAddress: (stealthAddress: Address) => void;
};

const WalletConnectContext = createContext<
  WalletConnectContextType | undefined
>(undefined);

const WALLETCONNECT_APP_METADATA = {
  name: 'Demo Umbra V2',
  description: 'Demo Umbra V2',
  url: 'https://demo-umbra-v2.vercel.app',
  icons: []
};

export const WalletConnectProvider = ({
  children
}: { children: ReactNode }) => {
  const chainId = useChainId();
  const [web3Wallet, setWeb3Wallet] = useState<Client>();
  const [sessions, setSessions] = useState<SessionTypes.Struct[]>([]);
  const [stealthAddress, setStealthAddress] = useState<Address>();

  const getActiveSessions = useCallback((): SessionTypes.Struct[] => {
    const sessionsMap = web3Wallet?.getActiveSessions() || {};
    return Object.values(sessionsMap);
  }, [web3Wallet]);

  const getNamespaces = ({
    proposalParams,
    chainId,
    stealthAddress
  }: {
    proposalParams: Web3WalletTypes.SessionProposal['params'];
    chainId: number;
    stealthAddress: Address;
  }) => {
    const eip155ChainIds = [chainId].map(getEip155ChainId);
    const eip155Accounts = eip155ChainIds.map(
      eip155ChainId => `${eip155ChainId}:${stealthAddress}`
    );

    const methods = proposalParams.requiredNamespaces[EIP155]?.methods || [];
    const events = proposalParams.requiredNamespaces[EIP155]?.events || [];

    return buildApprovedNamespaces({
      proposal: proposalParams,
      supportedNamespaces: {
        [EIP155]: {
          chains: eip155ChainIds,
          accounts: eip155Accounts,
          methods,
          events
        }
      }
    });
  };

  const handleSessionProposal = useCallback(
    async ({
      id,
      params
    }: {
      id: Web3WalletTypes.SessionProposal['id'];
      params: Web3WalletTypes.SessionProposal['params'];
    }) => {
      if (!web3Wallet) throw new Error('Web3Wallet not initialized');
      if (!chainId) throw new Error('ChainId not initialized');
      if (!stealthAddress) throw new Error('StealthAddress not initialized');

      try {
        const namespaces = getNamespaces({
          proposalParams: params,
          chainId,
          stealthAddress
        });

        await web3Wallet.approveSession({
          id,
          namespaces
        });
      } catch (error) {
        console.error('Failed to approve session:', error);
        await web3Wallet.rejectSession({
          id,
          reason: getSdkError(WC_SDK_ERRORS.USER_REJECTED)
        });
      } finally {
        setSessions(getActiveSessions());
      }
    },
    [web3Wallet, chainId, getActiveSessions, getNamespaces, stealthAddress]
  );

  const initWalletConnect = useCallback(async () => {
    try {
      const core = new Core({
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
      });

      const wallet = await Web3Wallet.init({
        core,
        metadata: WALLETCONNECT_APP_METADATA
      });

      if (wallet.core.relayer.connected) {
        console.warn('Relay socket is open');
        setWeb3Wallet(wallet);
        setSessions(Object.values(wallet.getActiveSessions() || {}));
        return;
      }

      setWeb3Wallet(wallet);
      setSessions(Object.values(wallet.getActiveSessions() || {}));
      console.log('WalletConnect initialized');
    } catch (error) {
      console.error('Failed to initialize WalletConnect:', error);
    }
  }, []);

  // Handle init
  useEffect(() => {
    initWalletConnect();
  }, [initWalletConnect]);

  // Handle clean up
  useEffect(() => {
    if (!web3Wallet) {
      console.log('No web3Wallet');
      return;
    }

    web3Wallet.on(WC_SDK_EVENTS.SESSION_PROPOSAL, handleSessionProposal);

    return () => {
      if (web3Wallet) {
        web3Wallet.off(WC_SDK_EVENTS.SESSION_PROPOSAL, handleSessionProposal);
      }
    };
  }, [web3Wallet, handleSessionProposal]);

  const connect = useCallback(
    async ({ uri }: { uri: string; stealthAddress: Address }) => {
      if (!web3Wallet) throw new Error('Web3Wallet not initialized in connect');

      try {
        await web3Wallet.pair({ uri });
      } catch (error) {
        console.log('pairing error', error);
      }
      setSessions(getActiveSessions());
    },
    [web3Wallet, getActiveSessions]
  );

  return (
    <WalletConnectContext.Provider
      value={{ connect, sessions, setStealthAddress }}
    >
      {children}
    </WalletConnectContext.Provider>
  );
};

export const useWalletConnect = () => {
  const context = useContext(WalletConnectContext);
  if (!context) {
    throw new Error(
      'useWalletConnect must be used within a WalletConnectProvider'
    );
  }
  return context;
};
