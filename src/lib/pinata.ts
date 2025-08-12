import axios from 'axios';

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

export const uploadToPinata = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    // Add metadata if needed
    const metadata = JSON.stringify({
      name: file.name,
    });
    formData.append('pinataMetadata', metadata);

    // Add options if needed
    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${PINATA_JWT}`
      },
    });

    return {
      success: true,
      pinataUrl: `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`
    };
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    return {
      success: false,
      message: 'Error uploading to Pinata'
    };
  }
};