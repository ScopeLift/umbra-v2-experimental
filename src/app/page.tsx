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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BellIcon, TerminalIcon } from 'lucide-react';

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
          {!stealthMetaAddress && (
            <Alert>
              <BellIcon className="h-4 w-4" />
              <AlertTitle>Authenticate</AlertTitle>
              <AlertDescription>
                Please authenticate to be able to generate a stealth address
              </AlertDescription>
            </Alert>
          )}

          {stealthAddress && (
            <div className="mt-4">
              <div className="text-lg font-bold">Stealth Address:</div>
              <div className="text-sm">{stealthAddress}</div>
            </div>
          )}
          {stealthMetaAddress && (
            <Button
              className="mt-4 lg:max-w-80"
              onClick={handleGenerateStealthAddress}
            >
              Generate Stealth Address
            </Button>
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
