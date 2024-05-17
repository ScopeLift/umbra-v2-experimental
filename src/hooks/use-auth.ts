import {
  generateKeysFromSignature,
  generateStealthMetaAddressFromSignature
} from '@scopelift/stealth-address-sdk';
import type { HexString } from '@scopelift/stealth-address-sdk/dist/utils/crypto/types';
import { useCallback, useState } from 'react';
import { useChainId, useSignMessage } from 'wagmi';

/**
 * "Authenticates" by making the user sign a message to generate a stealth meta-address.
 * Returns the stealth meta-address and the associated keys.
 */
const useAuth = () => {
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const MESSAGE_TO_SIGN = `Generate Stealth Meta-Address on ${chainId} chain`;

  const [stealthMetaAddress, setStealthMetaAddress] = useState<HexString>();
  const [keys, setKeys] = useState<{
    spendingPublicKey: HexString;
    spendingPrivateKey: HexString;
    viewingPublicKey: HexString;
    viewingPrivateKey: HexString;
  }>();

  const handleSignMessage = useCallback(async () => {
    const signature = await signMessageAsync({ message: MESSAGE_TO_SIGN });

    const stealthMetaAddress =
      generateStealthMetaAddressFromSignature(signature);
    setStealthMetaAddress(stealthMetaAddress);

    const keys = generateKeysFromSignature(signature);
    setKeys(keys);
  }, [signMessageAsync, MESSAGE_TO_SIGN]);

  return {
    stealthMetaAddress,
    handleSignMessage,
    keys
  };
};

export default useAuth;
