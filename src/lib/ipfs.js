import { create } from 'ipfs-http-client';

// Connect to Filebase IPFS API
const ipfs = create({ url: 'https://api.filebase.io/v1/ipfs' });

export async function uploadToIPFS(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('https://api.filebase.io/v1/ipfs', {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer TON_API_KEY_FILEBASE`
    }
  });

  const data = await response.json();
  return `https://ipfs.io/ipfs/${data.cid}`;
}
