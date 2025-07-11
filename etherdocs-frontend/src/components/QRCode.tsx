
import { useState } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageContainer from './PageContainer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './Card';
import { QrCode, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { CONTRACT_ADDRESS } from '../constants/contractAddress';
import jsQR from 'jsqr';

const CONTRACT_ABI = [
  {
    "inputs": [{ "internalType": "bytes32", "name": "documentHash", "type": "bytes32" }],
    "name": "verifyDocument",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const QRCode = () => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<null | { success: boolean; message: string; hash?: string }>(null);
  const [documentId, setDocumentId] = useState('');
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setScanResult(null);
    setScanning(true);
    
    const file = event.target.files?.[0];
    if (!file) {
      setScanning(false);
      return;
    }

    try {
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = () => {
        img.src = reader.result as string;
      };
      
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qrCode = jsQR(imageData.data, canvas.width, canvas.height);
          
          if (qrCode) {
            const decodedText = qrCode.data;
            if (ethers.isHexString(decodedText)) {
              await verifyOnChain(decodedText);
            } else {
              setScanResult({
                success: false,
                message: "QR code does not contain a valid hash."
              });
              setScanning(false);
            }
          } else {
            setScanResult({
              success: false,
              message: "Could not detect a QR code."
            });
            setScanning(false);
          }
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing QR code:', error);
      setScanResult({
        success: false,
        message: "Error processing QR code image."
      });
      setScanning(false);
    }
  };
  
  const verifyOnChain = async (hash: string) => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        const isValid = await contract.verifyDocument(hash);
        setScanResult({
          success: isValid,
          message: isValid
            ? "Document is verified and authentic!"
            : "Hash not found on blockchain.",
          hash: hash
        });
      } else {
        setScanResult({
          success: false,
          message: "MetaMask not installed."
        });
      }
    } catch (err) {
      console.error('Error verifying on blockchain:', err);
      setScanResult({
        success: false,
        message: "Error verifying document."
      });
    } finally {
      setScanning(false);
    }
  };
  
  const handleManualCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentId) return;
    
    setScanning(true);
    setScanResult(null);
    
    try {
      if (ethers.isHexString(documentId)) {
        await verifyOnChain(documentId);
      } else {
        setScanResult({
          success: false,
          message: "Invalid hash format."
        });
        setScanning(false);
      }
    } catch (error) {
      console.error('Error processing manual entry:', error);
      setScanResult({
        success: false,
        message: "Error processing document ID."
      });
      setScanning(false);
    }
  };
  
  return (
    <PageContainer
      title="QR Code Verification"
      subtitle="Quickly verify documents using QR codes"
    >
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Scan QR Code */}
          <Card>
            <CardHeader>
              <CardTitle>Scan QR Code</CardTitle>
              <CardDescription>
                Use your camera to scan a document QR code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="aspect-w-1 aspect-h-1 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  {scanning ? (
                    <div className="text-center">
                      <div className="animate-ping inline-flex h-24 w-24 rounded-full bg-primary opacity-50"></div>
                      <p className="mt-4 text-sm text-gray-500">Scanning QR code...</p>
                    </div>
                  ) : scanResult ? (
                    <div className="text-center p-4">
                      {scanResult.success ? (
                        <div className="space-y-2">
                          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                          <h3 className="text-lg font-medium text-green-800">Verification Successful</h3>
                          <p className="text-sm text-green-600">{scanResult.message}</p>
                          <div className="mt-4 border-t border-green-200 pt-4">
                            <dl className="grid grid-cols-1 gap-y-2">
                              <div>
                                <dt className="text-xs text-green-500 font-medium">Document Hash</dt>
                                <dd className="text-sm text-green-800 font-mono break-all">{scanResult.hash}</dd>
                              </div>
                              <div>
                                <dt className="text-xs text-green-500 font-medium">Issued By</dt>
                                <dd className="text-sm text-green-800">0xB2c...4e8F</dd>
                              </div>
                              <div>
                                <dt className="text-xs text-green-500 font-medium">Issue Date</dt>
                                <dd className="text-sm text-green-800">May 16, 2025</dd>
                              </div>
                            </dl>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
                          <h3 className="text-lg font-medium text-red-800">Verification Failed</h3>
                          <p className="text-sm text-red-600">{scanResult.message}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <QrCode className="h-16 w-16 text-gray-400 mx-auto" />
                      <p className="mt-2 text-sm text-gray-500">QR scanner ready</p>
                    </div>
                  )}
                </div>
                <label className="block w-full">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-primary
                      hover:file:bg-blue-100"
                    disabled={scanning}
                  />
                </label>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => setScanResult(null)}
                className="w-full"
                disabled={scanning || !scanResult}
              >
                {scanResult ? 'Scan Another Code' : (
                  <div className="flex items-center">
                    <Camera className="mr-2 h-5 w-5" /> Scan QR Code
                  </div>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Manual QR Code Entry */}
          <Card>
            <form onSubmit={handleManualCheck}>
              <CardHeader>
                <CardTitle>Manual Verification</CardTitle>
                <CardDescription>
                  Enter document ID or QR code text manually
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="mb-2 flex items-center">
                      <QrCode className="h-5 w-5 text-gray-400 mr-2" />
                      <label htmlFor="qrcode-text" className="block text-sm font-medium text-gray-700">
                        Document Hash
                      </label>
                    </div>
                    <Input
                      id="qrcode-text"
                      value={documentId}
                      onChange={(e) => setDocumentId(e.target.value)}
                      placeholder="Enter document hash"
                      className="font-mono"
                      disabled={scanning}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Enter the document hash or text from the QR code
                    </p>
                  </div>

                  {scanResult && (
                    <div className={`p-4 rounded-md ${scanResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                      <div className="flex">
                        <div className="flex-shrink-0">
                          {scanResult.success ? (
                            <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                          )}
                        </div>
                        <div className="ml-3">
                          <h3 className={`text-sm font-medium ${scanResult.success ? 'text-green-800' : 'text-red-800'}`}>
                            {scanResult.success ? 'Verification Successful' : 'Verification Failed'}
                          </h3>
                          <div className={`mt-2 text-sm ${scanResult.success ? 'text-green-700' : 'text-red-700'}`}>
                            <p>{scanResult.message}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={scanning || !documentId}
                >
                  {scanning ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </div>
                  ) : (
                    'Verify'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* QR Code Information Section */}
        <div className="mt-10 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-medium text-gray-900">About QR Code Verification</h2>
          <p className="mt-2 text-sm text-gray-600">
            QR codes provide a quick and reliable way to verify document authenticity. When a document is issued through
            our blockchain platform, a unique QR code is generated that contains verification information. By scanning this code,
            you can instantly check if the document is genuine and retrieve its metadata from the blockchain.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h3 className="text-sm font-medium text-gray-900">Easy Verification</h3>
              <p className="mt-1 text-xs text-gray-500">
                Scan QR codes on physical documents to instantly verify their authenticity without manual input.
              </p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h3 className="text-sm font-medium text-gray-900">Tamper-Proof</h3>
              <p className="mt-1 text-xs text-gray-500">
                QR codes linked to blockchain records cannot be forged or altered, ensuring document security.
              </p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h3 className="text-sm font-medium text-gray-900">Real-Time Status</h3>
              <p className="mt-1 text-xs text-gray-500">
                Get up-to-date information about document status, including any revocations or updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default QRCode;
