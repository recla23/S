import { uploadToIPFS } from '../lib/ipfs';

async function handleUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const ipfsUrl = await uploadToIPFS(file);
  console.log('Uploaded to IPFS:', ipfsUrl);
}

<input type='file' onChange={handleUpload} />;
