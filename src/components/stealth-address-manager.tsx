import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import ConnectViaWalletConnect from '@/components/connect-via-walletconnect';

const StealthAddressManager = () => {
  const {
    stealthAddressDetails,
    generateMultipleStealthAddresses,
    isLoadingStealthAddresses,
    needsAuth
  } = useAuth();

  useEffect(() => {
    if (!needsAuth) {
      generateMultipleStealthAddresses();
    }
  }, [needsAuth, generateMultipleStealthAddresses]);

  if (isLoadingStealthAddresses) {
    return <div>Loading stealth addresses...</div>;
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <ConnectViaWalletConnect />
      {stealthAddressDetails.map((detail, index) => (
        <Card key={detail.stealthAddress} className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold">Stealth Address {index + 1}</div>
              <div className="text-sm break-all">{detail.stealthAddress}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StealthAddressManager;
