import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWalletConnect } from '@/contexts/walletconnect';

interface ConnectModalProps {
  stealthAddress: string;
  onClose: () => void;
}

const ConnectModal = ({ stealthAddress, onClose }: ConnectModalProps) => {
  const { connect, setStealthAddress, sessions } = useWalletConnect();

  useEffect(() => {
    setStealthAddress(stealthAddress);
  }, [stealthAddress, setStealthAddress]);

  const handleConnect = async () => {
    const uri = await getWalletConnectUri(); // Implement this function to get WalletConnect URI
    await connect({ uri, stealthAddress });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto p-6">
        <DialogHeader>
          <DialogTitle>Connect to Dapps</DialogTitle>
        </DialogHeader>
        <div className
