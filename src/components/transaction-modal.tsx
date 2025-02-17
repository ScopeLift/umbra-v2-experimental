import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWalletConnect } from '@/contexts/walletconnect';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import useEtherscanTxUrl from '@/hooks/use-etherscan-tx-url';
import { getStealthAddressFromSessionRequest } from '@/contexts/helpers/walletconnect-helpers';
import type { Address } from 'viem';
import { useEffect, useState } from 'react';
import { useBalance } from 'wagmi';

const TransactionModal = () => {
  const {
    approveSessionRequest,
    rejectSessionRequest,
    sessionRequest,
    sessionResponse,
    isApproveSessionRequestPending
  } = useWalletConnect();
  const etherscanTxLink = useEtherscanTxUrl(sessionResponse?.result);

  const { getStealthAddressWalletClient } = useAuth();
  const { toast } = useToast();

  const [stealthAddress, setStealthAddress] = useState<Address>();

  const { refetch } = useBalance({
    address: stealthAddress
  });

  const handleApprove = async (stealthAddress: `0x${string}`) => {
    const walletClient = getStealthAddressWalletClient(stealthAddress);

    if (!walletClient) {
      console.error('Wallet client not found during handle approve');
      return;
    }

    try {
      await approveSessionRequest(walletClient);
      refetch();
      toast({
        title: 'Transaction Success',
        description: 'Your transaction was successfull.',
        duration: 10000,
        variant: 'default',
        action: (
          <ToastAction
            altText="View on Explorer"
            onClick={() => {
              window.open(etherscanTxLink, '_blank');
            }}
          >
            View on Explorer
          </ToastAction>
        )
      });
    } catch (error) {
      toast({
        title: 'Transaction Error',
        description: (error as Error).message,
        duration: 5000,
        variant: 'destructive'
      });
    }
  };

  const handleReject = async () => {
    if (!sessionRequest) {
      console.error('Session request not found during handle reject');
      return;
    }
    await rejectSessionRequest(sessionRequest);
    toast({
      title: 'Approval Rejected',
      description: 'The transaction has been rejected.',
      duration: 5000,
      variant: 'destructive'
    });
  };

  useEffect(() => {
    if (sessionRequest) {
      setStealthAddress(getStealthAddressFromSessionRequest(sessionRequest));
    }
  }, [sessionRequest]);

  if (!sessionRequest) return null;

  return (
    <Dialog open={!!sessionRequest}>
      <DialogContent className="max-w-lg mx-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Approve Transaction
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Please review and approve the transaction below:
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 p-4 border rounded bg-gray-100">
          <p className="font-semibold text-gray-700">Transaction Details</p>
          <pre className="text-xs text-gray-600 overflow-auto mt-2">
            {JSON.stringify(sessionRequest.params.request, null, 2)}
          </pre>
        </div>
        <DialogFooter className="flex justify-end space-x-2">
          <Button
            onClick={handleReject}
            variant="destructive"
            disabled={isApproveSessionRequestPending}
          >
            Reject
          </Button>
          <Button
            onClick={() =>
              stealthAddress ? handleApprove(stealthAddress) : null
            }
            disabled={isApproveSessionRequestPending || !stealthAddress}
          >
            {isApproveSessionRequestPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;
