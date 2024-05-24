import {
  generateKeysFromSignature,
  generateStealthMetaAddressFromSignature
} from '@scopelift/stealth-address-sdk';
import type { HexString } from '@scopelift/stealth-address-sdk/dist/utils/crypto/types';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { type WalletClient, createWalletClient, custom } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { useChainId, useSignMessage } from 'wagmi';

type AuthContextType = {
  keys: { spendingPrivateKey: string } | undefined;
  stealthMetaAddress: HexString | undefined;
  handleSignMessage: () => Promise<void>;
  stealthAddressWalletClient: WalletClient | undefined;
};

type Keys = {
  spendingPrivateKey: HexString;
  viewingPrivateKey: HexString;
  spendingPublicKey: HexString;
  viewingPublicKey: HexString;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const MESSAGE_TO_SIGN = `Generate Stealth Meta-Address on ${chainId} chain`;

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

  const stealthAddressWalletClient = useMemo(
    () =>
      keys?.spendingPrivateKey
        ? createWalletClient({
            account: privateKeyToAccount(keys.spendingPrivateKey),
            chain: sepolia,
            transport: custom(window.ethereum)
          })
        : undefined,
    [keys]
  );

  return (
    <AuthContext.Provider
      value={{
        keys,
        stealthMetaAddress,
        handleSignMessage,
        stealthAddressWalletClient
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
