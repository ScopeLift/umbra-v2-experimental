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
import useStealthAddressWalletClient from '@/hooks/use-stealth-address-wallet-client';
import {
  approveTransactionRequest,
  rejectTransactionRequest
} from './helpers/walletconnect-helpers';
import { useAuth } from './auth';

enum WC_SDK_EVENTS {
  SESSION_PROPOSAL = 'session_proposal',
  SESSION_REQUEST = 'session_request'
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
  stealthAddress: Address | undefined;
  approveSessionRequest: () => Promise<void>;
  rejectSessionRequest: (
    request: Web3WalletTypes.SessionRequest
  ) => Promise<void>;
  sessionRequest: Web3WalletTypes.SessionRequest | undefined;

  // biome-ignore lint/suspicious/noExplicitAny: TODO figure out better way
  sessionResponse: any;
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
  const { stealthAddressWalletClient } = useAuth();

  const [web3Wallet, setWeb3Wallet] = useState<Client>();
  const [sessions, setSessions] = useState<SessionTypes.Struct[]>([]);
  const [sessionRequest, setSessionRequest] =
    useState<Web3WalletTypes.SessionRequest>();
  const [sessionResponse, setSessionResponse] = useState();

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

    const methods = ['eth_sendTransaction', 'personal_sign'];
    const events = ['accountsChanged', 'chainChanged'];

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

  const handleSessionRequest = useCallback(
    async (requestEvent: Web3WalletTypes.SessionRequest) => {
      setSessionRequest(requestEvent);
    },
    []
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

  useEffect(() => {
    if (web3Wallet) {
      web3Wallet.on(WC_SDK_EVENTS.SESSION_PROPOSAL, handleSessionProposal);
      web3Wallet.on(WC_SDK_EVENTS.SESSION_REQUEST, handleSessionRequest);
    }

    // Handle clean up
    return () => {
      if (web3Wallet) {
        web3Wallet.off(WC_SDK_EVENTS.SESSION_PROPOSAL, handleSessionProposal);
        web3Wallet.off(WC_SDK_EVENTS.SESSION_REQUEST, handleSessionRequest);
      }
    };
  }, [web3Wallet, handleSessionProposal, handleSessionRequest]);

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

  const approveSessionRequest = useCallback(async () => {
    if (!web3Wallet)
      throw new Error('Web3Wallet not initialized in approveTransaction');

    if (!stealthAddressWalletClient)
      throw new Error(
        'Stealth Address Wallet Client not initialized in approveTransaction'
      );

    if (!stealthAddressWalletClient.account)
      throw new Error(
        'Stealth Address Wallet Client account not initialized in approveTransaction'
      );

    if (!sessionRequest)
      throw new Error('Session Request not initialized in approveTransaction');

    const response = await approveTransactionRequest({
      request: sessionRequest,
      stealthAddress: stealthAddressWalletClient.account.address,
      walletClient: stealthAddressWalletClient
    });

    setSessionResponse(response);
    setSessionRequest(undefined);
  }, [sessionRequest, web3Wallet, stealthAddressWalletClient]);

  const rejectSessionRequest = useCallback(async () => {
    if (!web3Wallet) throw new Error('Web3Wallet not initialized');
    if (!sessionRequest) throw new Error('Session Request not initialized');

    const errorResponse = rejectTransactionRequest(sessionRequest);
    await web3Wallet.respondSessionRequest({
      topic: sessionRequest.topic,
      response: errorResponse
    });
    setSessionRequest(undefined);
  }, [web3Wallet, sessionRequest]);

  return (
    <WalletConnectContext.Provider
      value={{
        connect,
        sessions,
        setStealthAddress,
        stealthAddress,
        approveSessionRequest,
        rejectSessionRequest,
        sessionRequest,
        sessionResponse
      }}
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
