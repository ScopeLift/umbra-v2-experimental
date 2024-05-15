'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState } from 'react';
import { useChainId, useSignMessage } from 'wagmi';
import {
  generateStealthMetaAddressFromSignature,
  generateStealthAddress
} from '@scopelift/stealth-address-sdk';
import { Button } from '@/components/ui';
import type {
  EthAddress,
  HexString
} from '@scopelift/stealth-address-sdk/dist/utils/crypto/types';
import ConnectViaWalletConnect from '@/components/connect-via-walletconnect';

export default function Home() {
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const MESSAGE_TO_SIGN = `Generate Stealth Meta-Address on ${chainId} chain`;

  const [stealthMetaAddress, setStealthMetaAddress] = useState<HexString>();
  const [stealthAddress, setStealthAddress] = useState<EthAddress>();

  const handleSignMessage = async () => {
    const signature = await signMessageAsync({ message: MESSAGE_TO_SIGN });
    const newStealthMetaAddress =
      generateStealthMetaAddressFromSignature(signature);
    setStealthMetaAddress(newStealthMetaAddress);
  };

  const handleGenerateStealthAddress = async () => {
    if (!stealthMetaAddress) {
      console.error('Stealth Meta-Address is not set');
      return;
    }
    const { stealthAddress } = generateStealthAddress({
      stealthMetaAddressURI: stealthMetaAddress
    });
    setStealthAddress(stealthAddress);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <nav className="mb-32 w-full">
        <div className="flex justify-between">
          <ConnectButton chainStatus="icon" />
          <Button onClick={handleSignMessage}>Auth</Button>
        </div>
        <div>
          {stealthMetaAddress ? (
            <>
              <div className="mt-8">
                <div className="text-lg font-bold">Stealth Meta-Address:</div>
                <div className="text-sm">{stealthMetaAddress}</div>
              </div>
              <div className="mt-8">
                <Button onClick={handleGenerateStealthAddress}>
                  Generate Stealth Address
                </Button>
              </div>
              {stealthAddress && (
                <div className="mt-8">
                  <div className="text-lg font-bold">Stealth Address:</div>
                  <div className="text-sm">{stealthAddress}</div>
                </div>
              )}
            </>
          ) : (
            <div className="mt-8">
              Click Auth to generate Stealth Meta-Address
            </div>
          )}

          {stealthAddress && (
            <div className="mt-8">
              <ConnectViaWalletConnect />
            </div>
          )}
        </div>
      </nav>
    </main>
  );
}
