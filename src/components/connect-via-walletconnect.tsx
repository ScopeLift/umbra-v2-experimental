import { useEffect, useState, type ChangeEvent } from 'react';
import { Button, Input } from '@/components/ui';
import { useWalletConnect } from '@/contexts/walletconnect';
import type { Address } from 'viem';

interface ConnectViaWalletConnectProps {
  stealthAddress: Address;
}

const ConnectViaWalletConnect = ({
  stealthAddress
}: ConnectViaWalletConnectProps) => {
  const { connect, sessions } = useWalletConnect();
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

  useEffect(() => {
    if (!walletConnectURI) return;
    connect({ uri: walletConnectURI, stealthAddress });
  }, [connect, walletConnectURI, stealthAddress]);

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
      <div>Sessions</div>
      <ul>
        {sessions.map(session => (
          <li key={session.topic}>
            <div>Topic: {session.topic}</div>
            <div>Name: {session.peer.metadata.name}</div>
            <div>ChainId: {session.peer.metadata.url}</div>
            <div>Account: {session.peer.publicKey}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConnectViaWalletConnect;
