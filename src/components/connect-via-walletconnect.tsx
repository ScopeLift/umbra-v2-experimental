import { useEffect, useState, type ChangeEvent } from 'react';
import { Button, Input } from '@/components/ui';
import { useWalletConnect } from '@/contexts/walletconnect';
import type { Address } from 'viem';
import { useToast } from './ui/use-toast';
import { Card } from './ui/card';

interface ConnectViaWalletConnectProps {
  stealthAddress: Address;
}

const ConnectViaWalletConnect = ({
  stealthAddress
}: ConnectViaWalletConnectProps) => {
  const { toast } = useToast();
  const { connect } = useWalletConnect();
  const [walletConnectURI, setWalletConnectURI] = useState('');
  const [inputIsFocused, setInputIsFocused] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement> | undefined) => {
    if (!e) return;
    setWalletConnectURI(e.target.value);
  };

  const handlePasteClick = async () => {
    try {
      if (!navigator.clipboard) {
        console.error('Clipboard access is not available.');
        return;
      }
      const text = await navigator.clipboard.readText();
      setWalletConnectURI(text);
    } catch (error) {
      console.error('Failed to read from clipboard:', error);
    }
  };

  useEffect(() => {
    if (!walletConnectURI) return;

    const connectToAddressViaWalletConnect = async () => {
      toast({
        title: 'Connecting to Stealth Address Via WalletConnect...',
        description: 'Please wait while the connection is established.'
      });
      try {
        await connect({ uri: walletConnectURI, stealthAddress });
        setWalletConnectURI('');
        toast({
          title: 'Connected to Stealth Address Via WalletConnect',
          description: 'Please go to app to start using your Stealth Address.',
          duration: 5000
        });
      } catch (error) {
        setWalletConnectURI('');
        toast({
          title: 'Failed to connect',
          description: `Error: ${error}`,
          variant: 'destructive',
          duration: 5000
        });
      }
    };

    connectToAddressViaWalletConnect();
  }, [connect, walletConnectURI, stealthAddress, toast]);

  const handleInputFocus = () => setInputIsFocused(true);
  const handleInputBlur = () => setInputIsFocused(false);

  return (
    <Card className="flex flex-col gap-4 p-4">
      <div className="text-lg font-bold">
        Connect dApps to Your Stealth Address
      </div>
      <p className="text-sm">
        Paste the pairing code below to connect to your Stealth Address via
        WalletConnect
      </p>
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          placeholder={inputIsFocused ? 'wc:' : 'Pairing code'}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onChange={handleInputChange}
          value={walletConnectURI}
        />
        <Button onClick={handlePasteClick}>Paste</Button>
      </div>
    </Card>
  );
};

export default ConnectViaWalletConnect;
