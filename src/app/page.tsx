'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState } from 'react';
import { generateStealthAddress } from '@scopelift/stealth-address-sdk';
import { Button } from '@/components/ui';
import ConnectViaWalletConnect from '@/components/connect-via-walletconnect';
import { useWalletConnect } from '@/contexts/walletconnect';
import WalletConnectSessions from '@/components/walletconnect-sessions';
import useAuth from '@/hooks/use-auth';
import type { Address } from 'viem';

export default function Home() {
  const { sessions: walletconnectSessions } = useWalletConnect();
  const { setStealthAddress: setStealthAddressForWalletConnect } =
    useWalletConnect();
  const { handleSignMessage, stealthMetaAddress } = useAuth();

  const [stealthAddress, setStealthAddress] = useState<Address>();

  const handleGenerateStealthAddress = async () => {
    if (!stealthMetaAddress) {
      console.error('Stealth Meta-Address is not set');
      return;
    }
    const { stealthAddress } = generateStealthAddress({
      stealthMetaAddressURI: stealthMetaAddress
    });
    setStealthAddress(stealthAddress);
    setStealthAddressForWalletConnect(stealthAddress);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-8">
      <nav className="mb-32 w-full">
        <div className="flex justify-between items-center">
          <ConnectButton chainStatus="icon" />
          {!stealthMetaAddress && (
            <Button onClick={handleSignMessage}>Auth</Button>
          )}
        </div>
        <div className="mt-8">
          {stealthMetaAddress ? (
            <div className="flex flex-col gap-4">
              <div>
                <div className="text-lg font-bold">Stealth Meta-Address:</div>
                <div className="text-sm">{stealthMetaAddress}</div>
              </div>
              {stealthAddress && (
                <div className="mt-4">
                  <div className="text-lg font-bold">Stealth Address:</div>
                  <div className="text-sm">{stealthAddress}</div>
                </div>
              )}
              <Button
                className="mt-4 lg:max-w-80"
                onClick={handleGenerateStealthAddress}
              >
                Generate Stealth Address
              </Button>
            </div>
          ) : (
            <div>Click Auth to generate Stealth Meta-Address</div>
          )}
        </div>
      </nav>
      {stealthAddress && (
        <ConnectViaWalletConnect stealthAddress={stealthAddress} />
      )}
      {walletconnectSessions.length ? (
        <WalletConnectSessions sessions={walletconnectSessions} />
      ) : null}
    </main>
  );
}
