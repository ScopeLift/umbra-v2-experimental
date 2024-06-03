import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode
} from 'react';
import {
  generateStealthAddress,
  generateStealthMetaAddressFromSignature,
  generateKeysFromSignature,
  computeStealthKey,
  VALID_SCHEME_ID
} from '@scopelift/stealth-address-sdk';
import type {
  GenerateStealthAddressReturnType,
  HexString
} from '@scopelift/stealth-address-sdk/dist/utils/crypto/types';
import { type WalletClient, createWalletClient, custom } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { useAccount, useChainId, useSignMessage } from 'wagmi';
import { useWalletConnect } from './walletconnect';

type AuthContextType = {
  keys: Keys | undefined;
  stealthMetaAddress: HexString | undefined;
  handleSignMessage: () => Promise<void>;
  handleGenerateStealthAddress: () => Promise<void>;
  stealthAddressDetails: StealthAddressDetails[];
  needsAuth: boolean;
  getStealthAddressWalletClient: (
    stealthAddress: HexString
  ) => WalletClient | undefined;
  getStealthAddressDetails: (
    stealthAddress: HexString
  ) => StealthAddressDetails | undefined;
};

type Keys = {
  spendingPrivateKey: HexString;
  viewingPrivateKey: HexString;
  spendingPublicKey: HexString;
  viewingPublicKey: HexString;
};

type StealthAddressDetails = GenerateStealthAddressReturnType & {
  stealthAddressPrivateKey: HexString;
  stealthAddressWalletClient: WalletClient;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const { setStealthAddress: setStealthAddressForWalletConnect } =
    useWalletConnect();
  const MESSAGE_TO_SIGN = `Generate Stealth Meta-Address on ${chainId} chain`;

  const [stealthAddressDetails, setStealthAddressDetails] = useState<
    StealthAddressDetails[]
  >([]);
  const [stealthMetaAddress, setStealthMetaAddress] = useState<HexString>();
  const [keys, setKeys] = useState<Keys>();

  const handleSignMessage = useCallback(async () => {
    const signature = await signMessageAsync({ message: MESSAGE_TO_SIGN });

    const stealthMetaAddress =
      generateStealthMetaAddressFromSignature(signature);
    setStealthMetaAddress(stealthMetaAddress);

    const keys = generateKeysFromSignature(signature);
    setKeys(keys);
  }, [signMessageAsync, MESSAGE_TO_SIGN]);

  const getStealthAddressPrivateKey = useCallback(
    ({
      ephemeralPublicKey,
      keys
    }: { ephemeralPublicKey: HexString; keys: Keys }) => {
      if (!keys) {
        console.error('Keys not set');
        return undefined;
      }

      return computeStealthKey({
        schemeId: VALID_SCHEME_ID.SCHEME_ID_1,
        ephemeralPublicKey,
        spendingPrivateKey: keys.spendingPrivateKey,
        viewingPrivateKey: keys.viewingPrivateKey
      });
    },
    []
  );

  const getStealthAddressWalletClient = useCallback(
    (stealthAddress: HexString) => {
      const stealthAddressDetail = stealthAddressDetails.find(
        detail => detail.stealthAddress === stealthAddress
      );

      if (!stealthAddressDetail) {
        console.error('Stealth Address not found', stealthAddress);
        return undefined;
      }

      const { stealthAddressPrivateKey } = stealthAddressDetail;
      return createWalletClient({
        account: privateKeyToAccount(stealthAddressPrivateKey),
        chain: sepolia,
        transport: custom(window.ethereum)
      });
    },
    [stealthAddressDetails]
  );

  const handleGenerateStealthAddress = useCallback(async () => {
    if (!stealthMetaAddress) {
      console.error('Stealth Meta-Address is not set');
      return;
    }
    const stealthAddressResults = generateStealthAddress({
      stealthMetaAddressURI: stealthMetaAddress
    });

    if (!keys) {
      console.error('Keys not set');
      return;
    }

    const privateKey = getStealthAddressPrivateKey({
      ephemeralPublicKey: stealthAddressResults.ephemeralPublicKey,
      keys
    });

    if (!privateKey) {
      console.error('Private key not found');
      return;
    }

    const stealthAddressDetails = {
      stealthAddressPrivateKey: privateKey,
      stealthAddressWalletClient: createWalletClient({
        account: privateKeyToAccount(privateKey),
        chain: sepolia,
        transport: custom(window.ethereum)
      }),
      ...stealthAddressResults
    };

    setStealthAddressDetails(prev => [...prev, stealthAddressDetails]);
    setStealthAddressForWalletConnect(stealthAddressResults.stealthAddress);
  }, [
    stealthMetaAddress,
    keys,
    getStealthAddressPrivateKey,
    setStealthAddressForWalletConnect
  ]);

  const getStealthAddressDetails = useCallback(
    (stealthAddress: HexString) =>
      stealthAddressDetails.find(
        detail => detail.stealthAddress === stealthAddress
      ),
    [stealthAddressDetails]
  );

  const needsAuth = !stealthMetaAddress && isConnected;

  return (
    <AuthContext.Provider
      value={{
        keys,
        stealthMetaAddress,
        handleSignMessage,
        handleGenerateStealthAddress,
        stealthAddressDetails,
        needsAuth,
        getStealthAddressWalletClient,
        getStealthAddressDetails
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};
