import { useEffect, useState, type ChangeEvent } from 'react';
import { Button, Input } from '@/components/ui';
import { useWalletConnect } from '@/contexts/walletconnect';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';

const ConnectViaWalletConnect = () => {
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
        title: 'Connecting to Stealth Addresses Via WalletConnect...',
        description: 'Please wait while the connection is established.'
      });
      try {
        await connect({ uri: walletConnectURI });
        setWalletConnectURI('');
        toast({
          title: 'Connected to Stealth Addresses Via WalletConnect',
          description: 'Please go to app to start using your Stealth Address.',
          duration: 10000
        });
      } catch (error) {
        setWalletConnectURI('');
        toast({
          title: 'Failed to connect',
          description: `Error: ${error}`,
          variant: 'destructive',
          duration: 10000
        });
      }
    };

    connectToAddressViaWalletConnect();
  }, [connect, walletConnectURI, toast]);

  const handleInputFocus = () => setInputIsFocused(true);
  const handleInputBlur = () => setInputIsFocused(false);

  return (
    <div className="p-4">
      <Card className="flex flex-col gap-4 p-4">
        <div className="text-lg font-bold">
          Connect Apps to Your Stealth Address
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
    </div>
  );
};

export default ConnectViaWalletConnect;
