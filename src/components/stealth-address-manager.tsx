import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import ConnectViaWalletConnect from '@/components/connect-via-walletconnect';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@/components/ui/accordion';
import type { Address } from 'viem';
import WalletConnectSessions from './walletconnect-sessions';
import { useWalletConnect } from '@/contexts/walletconnect';

const StealthAddressManager = () => {
  const { setSelectedStealthAddress: setSelectedStealthAddressForWC } =
    useWalletConnect();
  const {
    stealthAddressDetails,
    generateMultipleStealthAddresses,
    isLoadingStealthAddresses,
    needsAuth
  } = useAuth();

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!needsAuth) {
      generateMultipleStealthAddresses();
    }
  }, [needsAuth, generateMultipleStealthAddresses]);

  const handleConnectClick = (address: Address) => {
    setSelectedAddress(address);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAddress(null);
  };

  useEffect(() => {
    if (selectedAddress) {
      setSelectedStealthAddressForWC(selectedAddress);
    }
  }, [selectedAddress, setSelectedStealthAddressForWC]);

  if (isLoadingStealthAddresses) {
    return <div>Loading stealth addresses...</div>;
  }

  return (
    <>
      <Accordion type="multiple" className="flex flex-col gap-4 w-full">
        {stealthAddressDetails.map((detail, index) => (
          <AccordionItem
            key={detail.stealthAddress}
            value={`item-${index}`}
            className="border-none hover:ring-1 ring-gray-500 rounded-md bg-gray-100 hover:cursor-pointer"
          >
            <AccordionTrigger className="hover:no-underline p-8">
              <div className="flex justify-between items-center w-full">
                <div className="flex flex-col gap-2 text-left">
                  <div className="font-bold">Stealth Address {index + 1}</div>
                  <div className="text-sm break-all">
                    {detail.stealthAddress}
                  </div>
                </div>
                <Button
                  className="mr-2"
                  onClick={() => handleConnectClick(detail.stealthAddress)}
                >
                  Connect to Apps
                </Button>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="p-8">
                <WalletConnectSessions stealthAddress={detail.stealthAddress} />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {selectedAddress && (
        <Dialog open={isModalOpen} onOpenChange={closeModal}>
          <DialogContent className="max-w-lg mx-auto p-6">
            <ConnectViaWalletConnect />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default StealthAddressManager;
