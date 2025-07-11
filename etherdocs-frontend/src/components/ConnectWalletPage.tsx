
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import PageContainer from './PageContainer';
import { Wallet, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './Card';
import { Link } from 'react-router-dom';

const ConnectWalletPage = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setIsConnected(true);
      } catch (error) {
        console.error('User rejected connection:', error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert('MetaMask is not installed. Please install it!');
      setIsConnecting(false);
    }
  };

  return (
    <PageContainer
      title="Connect Your Wallet"
      subtitle="Securely connect your blockchain wallet to use the document verification platform"
    >
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Blockchain Authentication</CardTitle>
            <CardDescription>
              Connect your wallet to access document issuance and verification features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              {!isConnected ? (
                <Button
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  className="w-full"
                >
                  {isConnecting ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connecting...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Wallet className="mr-2 h-5 w-5" /> Connect Wallet
                    </div>
                  )}
                </Button>
              ) : (
                <>
                  <div className="p-4 bg-green-50 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">Wallet Connected</h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>Your wallet is now connected to the platform.</p>
                          <p className="font-mono mt-1 text-xs break-all">{walletAddress}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setIsConnected(false)}>
                    Disconnect
                  </Button>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <span className="text-sm text-gray-500">Secure blockchain connection</span>
            {isConnected && (
              <Button variant="link" className="p-0">
                <Link to="/issuer" className="flex items-center text-primary">
                  Go to Issuer <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </CardFooter>
        </Card>
        
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Supported Wallets</h2>
          <div className="grid grid-cols-2 gap-4">
            {['MetaMask', 'WalletConnect', 'Coinbase Wallet', 'Trust Wallet'].map((wallet) => (
              <div key={wallet} className="p-4 bg-white rounded-lg border border-gray-200 flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                  <Wallet className="h-4 w-4 text-gray-500" />
                </div>
                <span className="text-sm font-medium">{wallet}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default ConnectWalletPage;
