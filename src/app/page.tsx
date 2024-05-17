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
import { BellIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

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
    <main className="flex min-h-screen flex-col items-center p-20 gap-8">
      <nav className="mb-16 w-full">
        <div className="flex justify-between items-center">
          <ConnectButton chainStatus="icon" />
          {!stealthMetaAddress && (
            <Button onClick={handleSignMessage}>Auth</Button>
          )}
        </div>
        <div className="mt-4 flex justify-center">
          {!stealthMetaAddress && (
            <Alert className="max-w-md flex items-start space-x-4 p-4">
              <BellIcon className="h-6 w-6 text-yellow-500" />
              <div>
                <AlertTitle className="text-lg font-bold">
                  Authenticate
                </AlertTitle>
                <AlertDescription>
                  Please authenticate to be able to generate a stealth address.
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>
      </nav>
      <div className="flex flex-col lg:flex-row lg:justify-between lg:gap-28">
        {stealthMetaAddress && (
          <div className="lg:w-1/3 flex flex-col gap-8">
            <Card className="p-6">
              <div className="text-lg font-bold mb-2">Stealth Address</div>
              {stealthAddress ? (
                <>
                  <div className="text-sm break-all mb-4">{stealthAddress}</div>
                  <Button
                    onClick={handleGenerateStealthAddress}
                    className="w-full"
                  >
                    Generate New Stealth Address
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleGenerateStealthAddress}
                  className="w-full"
                >
                  Generate Stealth Address
                </Button>
              )}
            </Card>
            {stealthAddress && (
              <ConnectViaWalletConnect stealthAddress={stealthAddress} />
            )}
          </div>
        )}
        {walletconnectSessions.length > 0 && (
          <div className="lg:w-2/3 mt-8 lg:mt-0 flex-grow">
            <WalletConnectSessions sessions={walletconnectSessions} />
          </div>
        )}
      </div>
    </main>
  );
}
