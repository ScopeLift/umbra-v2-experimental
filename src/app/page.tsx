'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui';
import ConnectViaWalletConnect from '@/components/connect-via-walletconnect';
import { useWalletConnect } from '@/contexts/walletconnect';
import WalletConnectSessions from '@/components/walletconnect-sessions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BellIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import TransactionModal from '@/components/transaction-modal';
import { useAuth } from '@/contexts/auth';

export default function Home() {
  const {
    handleSignMessage,
    handleGenerateStealthAddress,
    stealthMetaAddress,
    needsAuth
  } = useAuth();
  const { sessions: walletconnectSessions, stealthAddress } =
    useWalletConnect();

  return (
    <main className="flex min-h-screen flex-col items-center p-4 lg:p-20 gap-8">
      <nav className="mb-8 lg:mb-16 w-full">
        <div className="flex justify-between items-center">
          <ConnectButton chainStatus="icon" />
        </div>
      </nav>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        <div className="lg:col-span-1 flex flex-col gap-8">
          <Card className="p-6">
            {needsAuth && (
              <Alert className="mb-4">
                <BellIcon className="h-6 w-6 text-yellow-500" />
                <div>
                  <AlertTitle className="text-lg font-bold">
                    Authenticate
                  </AlertTitle>
                  <AlertDescription>
                    Please authenticate to be able to generate a stealth
                    address.
                  </AlertDescription>
                </div>
                <Button onClick={handleSignMessage} className="w-full mt-4">
                  Auth
                </Button>
              </Alert>
            )}
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
                disabled={!stealthMetaAddress}
              >
                Generate Stealth Address
              </Button>
            )}
          </Card>
          {stealthAddress && (
            <ConnectViaWalletConnect stealthAddress={stealthAddress} />
          )}
        </div>
        {walletconnectSessions.length > 0 && (
          <div className="lg:col-span-2 flex-grow">
            <WalletConnectSessions sessions={walletconnectSessions} />
          </div>
        )}
      </div>
      <TransactionModal />
    </main>
  );
}
