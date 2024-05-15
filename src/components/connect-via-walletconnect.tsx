import { useState, type ChangeEvent } from 'react';
import { Button, Input } from '@/components/ui';

const ConnectViaWalletConnect = () => {
  const [walletConnectURI, setWalletConnectURI] = useState('');
  const [inputIsFocused, setInputIsFocused] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement> | undefined) => {
    if (!e) return;
    setWalletConnectURI(e.target.value);
  };

  const handlePasteClick = async () => {
    try {
      // Check if the navigator.clipboard API is available
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

  const handleConnect = () => {
    console.log('Connecting with URI:', walletConnectURI);
  };

  const handleInputFocus = () => setInputIsFocused(true);
  const handleInputBlur = () => setInputIsFocused(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="text-lg font-bold">
        Connect dApps to Your Stealth Address
      </div>
      <p>
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
    </div>
  );
};

export default ConnectViaWalletConnect;
