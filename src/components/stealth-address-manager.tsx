import { useEffect, useState } from 'react';
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
import EthBalance from './eth-balance';
import useSendEthWithFunder from '@/hooks/use-send-eth';

const StealthAddressManager = () => {
  const { setSelectedStealthAddress: setSelectedStealthAddressForWC } =
    useWalletConnect();
  const {
    stealthAddressDetails,
    generateMultipleStealthAddresses,
    isLoadingStealthAddresses,
    needsAuth
  } = useAuth();
  const {
    batchSendEthUsingFunder,
    isBatchFunding,
    hasAttemptedFunding,
    isFunded
  } = useSendEthWithFunder();

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

  // fund all stealth addresses with .001 ETH on load
  useEffect(() => {
    (async () => {
      if (
        stealthAddressDetails.length > 0 &&
        !isBatchFunding &&
        !hasAttemptedFunding
      ) {
        const fundingData = stealthAddressDetails.map(detail => ({
          to: detail.stealthAddress,
          formattedValue: '0.001'
        }));

        await batchSendEthUsingFunder(fundingData);
      }
    })();
  }, [
    stealthAddressDetails,
    batchSendEthUsingFunder,
    isBatchFunding,
    hasAttemptedFunding
  ]);

  if (isLoadingStealthAddresses) {
    return <div>Loading stealth addresses...</div>;
  }

  return (
    <div className="w-full lg:w-1/2">
      <Accordion type="multiple" className="flex flex-col gap-2 w-full">
        {stealthAddressDetails.map((detail, index) => (
          <AccordionItem
            key={detail.stealthAddress}
            value={`item-${index}`}
            className="border-none hover:ring-1 ring-gray-500 rounded-md bg-gray-100 hover:cursor-pointer"
          >
            <AccordionTrigger className="hover:no-underline p-4 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full">
                <div className="flex flex-col gap-2 text-left w-full md:w-auto">
                  <div className="flex gap-2 items-center">
                    <div className="font-bold">Stealth Address {index + 1}</div>
                    <EthBalance
                      address={detail.stealthAddress}
                      isLoading={isBatchFunding}
                      shouldRefetch={isFunded}
                    />
                  </div>
                  <div className="text-sm break-words">
                    <code>{detail.stealthAddress}</code>
                  </div>
                </div>
                <Button
                  className="mt-2 md:mt-0 md:mr-2"
                  onClick={() => handleConnectClick(detail.stealthAddress)}
                >
                  Connect to Apps
                </Button>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="p-4 md:p-8">
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
    </div>
  );
};

export default StealthAddressManager;
