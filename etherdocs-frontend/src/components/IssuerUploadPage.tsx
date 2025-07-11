
import { useState, useRef } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageContainer from './PageContainer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './Card';
import { FileUp, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { CONTRACT_ADDRESS } from '../constants/contractAddress';
import { QRCodeCanvas } from 'qrcode.react';

const CONTRACT_ABI = [
  {
    inputs: [{ internalType: 'bytes32', name: 'documentHash', type: 'bytes32' }],
    name: 'registerDocument',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

const IssuerUploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentDesc, setDocumentDesc] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [hash, setHash] = useState('');
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Reset states when selecting a new file
      setIsSuccess(false);
      setError('');
      
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const hexString = ethers.hexlify(bytes);
        const fileHash = ethers.keccak256(hexString);
        
        setHash(fileHash);
        setShowQR(false);
      } catch (err) {
        console.error('Error generating hash:', err);
        setError('Failed to generate document hash');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    if (!documentTitle) {
      setError('Please enter a document title');
      return;
    }
    if (!hash) {
      setError('Document hash could not be generated');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        const tx = await contract.registerDocument(hash);
        await tx.wait();
        setIsSuccess(true);
        setShowQR(true);
      } else {
        setError('MetaMask is not installed. Please install it first.');
      }
    } catch (err) {
      console.error('Error registering document:', err);
      setError('Failed to register document on blockchain');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadQRCode = () => {
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector('canvas');
      if (canvas) {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'document-hash-qr.png';
        link.href = url;
        link.click();
      }
    }
  };

  return (
    <PageContainer
      title="Issue Document"
      subtitle="Upload and issue documents with blockchain verification"
    >
      <div className="max-w-3xl mx-auto">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Document Issuance</CardTitle>
              <CardDescription>
                Upload a document to issue it with blockchain verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {isSuccess ? (
                  <div className="bg-green-50 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">Document issued successfully</h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>Your document has been successfully issued on the blockchain.</p>
                          <p className="mt-2 font-mono text-xs">Hash: {hash}</p>
                        </div>
                      </div>
                    </div>
                    
                    {showQR && (
                      <div className="mt-4 flex flex-col items-center">
                        <h3 className="text-sm font-medium text-green-800 mb-2">Document QR Code</h3>
                        <div ref={qrRef} className="bg-white p-3 rounded">
                          <QRCodeCanvas value={hash} size={180} bgColor="#ffffff" fgColor="#000000" />
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={downloadQRCode}
                          className="mt-3 flex items-center"
                        >
                          <Download className="mr-2 h-4 w-4" /> Download QR Code
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="documentTitle">Document Title</Label>
                        <Input
                          id="documentTitle"
                          value={documentTitle}
                          onChange={(e) => setDocumentTitle(e.target.value)}
                          placeholder="Enter document title"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="documentDesc">Document Description (Optional)</Label>
                        <Input
                          id="documentDesc"
                          value={documentDesc}
                          onChange={(e) => setDocumentDesc(e.target.value)}
                          placeholder="Enter document description"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="file-upload">Upload Document</Label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                          <div className="space-y-1 text-center">
                            <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                              >
                                <span>Upload a file</span>
                                <Input
                                  id="file-upload"
                                  name="file-upload"
                                  type="file"
                                  className="sr-only"
                                  accept=".png,.jpg,.jpeg,.pdf"
                                  onChange={handleFileChange}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                            {file && (
                              <p className="text-sm text-gray-700 mt-2">
                                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                              </p>
                            )}
                            {hash && (
                              <p className="text-xs font-mono break-all mt-2 text-gray-600">
                                Hash: {hash}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {error && (
                      <div className="bg-red-50 p-4 rounded-md">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <div className="mt-2 text-sm text-red-700">
                              <p>{error}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              {isSuccess ? (
                <Button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setDocumentTitle('');
                    setDocumentDesc('');
                    setHash('');
                    setIsSuccess(false);
                    setShowQR(false);
                  }}
                >
                  Issue Another Document
                </Button>
              ) : (
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Issuing...
                    </div>
                  ) : (
                    'Issue Document'
                  )}
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </PageContainer>
  );
};

export default IssuerUploadPage;
