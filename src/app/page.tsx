'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BellIcon } from 'lucide-react';
import TransactionModal from '@/components/transaction-modal';
import { useAuth } from '@/contexts/auth';
import StealthAddressManager from '@/components/stealth-address-manager';

export default function Home() {
  const { handleSignMessage, stealthMetaAddress, needsAuth } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-10 gap-8">
      <nav className="mb-8 w-full">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <ConnectButton chainStatus="icon" />
          {needsAuth && (
            <Button onClick={handleSignMessage} className="w-full md:w-auto">
              Auth
            </Button>
          )}
        </div>
        {needsAuth && (
          <div className="mt-4 flex justify-center">
            <Alert className="max-w-md flex items-start space-x-4 p-4">
              <BellIcon className="h-6 w-6 text-yellow-500" />
              <div>
                <AlertTitle className="text-lg font-bold">
                  Authenticate
                </AlertTitle>
                <AlertDescription>
                  Please authenticate to view your stealth addresses.
                </AlertDescription>
              </div>
            </Alert>
          </div>
        )}
      </nav>
      <div className="flex flex-col lg:flex-row lg:justify-between lg:gap-8 w-full">
        {stealthMetaAddress && <StealthAddressManager />}
      </div>
      <TransactionModal />
    </main>
  );
}
