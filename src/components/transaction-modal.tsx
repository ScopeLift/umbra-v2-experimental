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

const TransactionModal = () => {
  const {
    approveSessionRequest,
    rejectSessionRequest,
    sessionRequest,
    stealthAddress
  } = useWalletConnect();

  const { getStealthAddressWalletClient } = useAuth();

  const handleApprove = () => {
    if (!stealthAddress) {
      console.error('Stealth address not found during handle approve');
      return;
    }

    const walletClient = getStealthAddressWalletClient(stealthAddress);
    if (!walletClient) {
      console.error('Wallet client not found during handle approve');
      return;
    }

    approveSessionRequest(walletClient);
  };

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
            onClick={() => rejectSessionRequest(sessionRequest)}
            variant="destructive"
          >
            Reject
          </Button>
          <Button onClick={handleApprove}>Approve</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;
