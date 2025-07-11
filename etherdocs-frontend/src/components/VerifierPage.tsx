
import { useState } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageContainer from './PageContainer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './Card';
import { FileSearch, CheckCircle, AlertCircle } from 'lucide-react';
import { CONTRACT_ADDRESS } from '../constants/contractAddress';

const CONTRACT_ABI = [
  {
    "inputs": [{ "internalType": "bytes32", "name": "documentHash", "type": "bytes32" }],
    "name": "verifyDocument",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const VerifierPage = () => {
  const [documentHash, setDocumentHash] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'failed' | 'pending'>('idle');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setVerificationStatus('idle');
      setError('');
    }
  };

  const handleVerifyByHash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentHash) {
      setError('Please enter a document hash');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        const isValid = await contract.verifyDocument(documentHash);
        setVerificationStatus(isValid ? 'success' : 'failed');
        if (!isValid) {
          setError('Document hash not found on the blockchain');
        }
      } else {
        setError('MetaMask is not installed. Please install it first.');
        setVerificationStatus('failed');
      }
    } catch (err) {
      console.error('Error verifying document:', err);
      setError('Error verifying document on blockchain');
      setVerificationStatus('failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyByFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to verify');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const hexString = ethers.hexlify(bytes);
      const fileHash = ethers.keccak256(hexString);
      
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        const isValid = await contract.verifyDocument(fileHash);
        setVerificationStatus(isValid ? 'success' : 'failed');
        if (!isValid) {
          setError('Document not found on the blockchain');
        }
      } else {
        setError('MetaMask is not installed. Please install it first.');
        setVerificationStatus('failed');
      }
    } catch (err) {
      console.error('Error verifying document:', err);
      setError('Error verifying document on blockchain');
      setVerificationStatus('failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const renderVerificationStatus = () => {
    switch (verificationStatus) {
      case 'success':
        return (
          <div className="bg-green-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Verification Successful</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>This document is authentic and has been verified on the blockchain.</p>
                  <div className="mt-3 border-t border-green-200 pt-3">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs text-green-500 font-medium">Issuer</dt>
                        <dd className="text-xs text-green-800">0xB2c...4e8F</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-green-500 font-medium">Issued On</dt>
                        <dd className="text-xs text-green-800">May 15, 2025</dd>
                      </div>
                      <div className="sm:col-span-2 mt-1">
                        <dt className="text-xs text-green-500 font-medium">Document Hash</dt>
                        <dd className="text-xs text-green-800 font-mono break-all">
                          {documentHash || 'Document hash verified'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'failed':
        return (
          <div className="bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Verification Failed</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error || "The document could not be verified on the blockchain."}</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <PageContainer
      title="Verify Document"
      subtitle="Verify document authenticity using blockchain technology"
    >
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Verify by Hash */}
          <Card>
            <form onSubmit={handleVerifyByHash}>
              <CardHeader>
                <CardTitle>Verify by Hash</CardTitle>
                <CardDescription>
                  Enter the document hash to verify its authenticity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="documentHash">Document Hash</Label>
                    <Input
                      id="documentHash"
                      value={documentHash}
                      onChange={(e) => setDocumentHash(e.target.value)}
                      placeholder="Enter document hash"
                      className="mt-1"
                      disabled={isVerifying}
                    />
                  </div>
                  {verificationStatus !== 'idle' && renderVerificationStatus()}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isVerifying || !documentHash}
                >
                  {isVerifying ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </div>
                  ) : (
                    'Verify Document'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Verify by File */}
          <Card>
            <form onSubmit={handleVerifyByFile}>
              <CardHeader>
                <CardTitle>Verify by File</CardTitle>
                <CardDescription>
                  Upload a document to verify if it exists on the blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file-verify">Upload Document</Label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <FileSearch className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-verify"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                          >
                            <span>Upload a file</span>
                            <Input
                              id="file-verify"
                              name="file-verify"
                              type="file"
                              className="sr-only"
                              onChange={handleFileChange}
                              disabled={isVerifying}
                              accept=".png,.jpg,.jpeg,.pdf"
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
                      </div>
                    </div>
                  </div>
                  {verificationStatus !== 'idle' && renderVerificationStatus()}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isVerifying || !file}
                >
                  {isVerifying ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </div>
                  ) : (
                    'Verify File'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default VerifierPage;
