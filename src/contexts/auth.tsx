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
import { type WalletClient, createWalletClient, custom, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { useAccount, useChainId, useSignMessage } from 'wagmi';

type AuthContextType = {
  keys: Keys | undefined;
  stealthMetaAddress: HexString | undefined;
  handleSignMessage: () => Promise<void>;
  stealthAddressDetails: StealthAddressDetails[];
  needsAuth: boolean;
  getStealthAddressWalletClient: (
    stealthAddress: HexString
  ) => WalletClient | undefined;
  getStealthAddressDetails: (
    stealthAddress: HexString
  ) => StealthAddressDetails | undefined;
  isLoadingStealthAddresses: boolean;
  generateMultipleStealthAddresses: () => Promise<void>;
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
  const MESSAGE_TO_SIGN = `Generate Stealth Meta-Address on ${chainId} chain`;

  const [stealthAddressDetails, setStealthAddressDetails] = useState<
    StealthAddressDetails[]
  >([]);
  const [stealthMetaAddress, setStealthMetaAddress] = useState<HexString>();
  const [keys, setKeys] = useState<Keys>();
  const [isLoadingStealthAddresses, setIsLoadingStealthAddresses] =
    useState(false);

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
    }: { ephemeralPublicKey: HexString; keys: Keys }) =>
      computeStealthKey({
        schemeId: VALID_SCHEME_ID.SCHEME_ID_1,
        ephemeralPublicKey,
        spendingPrivateKey: keys.spendingPrivateKey,
        viewingPrivateKey: keys.viewingPrivateKey
      }),
    []
  );

  const getStealthAddressWalletClient = useCallback(
    (stealthAddress: HexString) => {
      const stealthAddressDetail = stealthAddressDetails.find(
        detail =>
          detail.stealthAddress.toLowerCase() === stealthAddress.toLowerCase()
      );

      if (!stealthAddressDetail) {
        console.error('Stealth Address not found', stealthAddress);
        return undefined;
      }

      const { stealthAddressPrivateKey } = stealthAddressDetail;
      return createWalletClient({
        account: privateKeyToAccount(stealthAddressPrivateKey),
        chain: sepolia,
        transport: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL)
      });
    },
    [stealthAddressDetails]
  );

  const generateMultipleStealthAddresses = useCallback(async () => {
    const STEALTH_ADDRESS_COUNT = 5;

    if (!stealthMetaAddress) {
      console.error('Stealth Meta-Address is not set');
      return;
    }

    if (!keys) {
      console.error('Keys are not set');
      return;
    }

    setIsLoadingStealthAddresses(true);

    const generatedAddressesDetails = await Array.from({
      length: STEALTH_ADDRESS_COUNT
    }).reduce(async (accPromise: Promise<StealthAddressDetails[]>, _value) => {
      const acc = await accPromise;

      const stealthAddressResults = generateStealthAddress({
        stealthMetaAddressURI: stealthMetaAddress
      });

      if (!keys) {
        console.error('Keys not set');
        return acc;
      }

      const privateKey = getStealthAddressPrivateKey({
        ephemeralPublicKey: stealthAddressResults.ephemeralPublicKey,
        keys
      });

      if (!privateKey) {
        console.error('Private key not found');
        return acc;
      }

      const addressDetail = {
        stealthAddressPrivateKey: privateKey,
        stealthAddressWalletClient: createWalletClient({
          account: privateKeyToAccount(privateKey),
          chain: sepolia,
          transport: custom(window.ethereum)
        }),
        ...stealthAddressResults
      };

      return [...acc, addressDetail];
    }, Promise.resolve([]));

    setStealthAddressDetails(generatedAddressesDetails);
    setIsLoadingStealthAddresses(false);
  }, [stealthMetaAddress, keys, getStealthAddressPrivateKey]);

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
        stealthAddressDetails,
        needsAuth,
        getStealthAddressWalletClient,
        getStealthAddressDetails,
        isLoadingStealthAddresses,
        generateMultipleStealthAddresses
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
