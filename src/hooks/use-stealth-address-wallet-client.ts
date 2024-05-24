import { createWalletClient, custom } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import useAuth from './use-auth';

const useStealthAddressWalletClient = () => {
  const { keys } = useAuth();

  const client = keys?.spendingPrivateKey
    ? createWalletClient({
        account: privateKeyToAccount(keys.spendingPrivateKey),
        chain: sepolia,
        transport: custom(window.ethereum)
      })
    : undefined;

  return client;
};

export default useStealthAddressWalletClient;
