import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Cek content-type
    if (!req.headers['content-type']?.startsWith('image/')) {
      return res.status(400).json({ error: 'Invalid content type' });
    }

    // Generate unique filename
    const fileExtension = req.headers['content-type'].split('/')[1];
    const filename = `${uuidv4()}.${fileExtension}`;
    const filePath = `/tmp/${filename}`; // Gunakan /tmp di Vercel

    // Write file
    await pipeline(req, createWriteStream(filePath));

    // Return the URL
    const fileUrl = `https://${req.headers.host}/api/uploads/${filename}`;
    return res.status(200).json({ 
      success: true, 
      url: fileUrl,
      filename: filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed', details: error.message });
  }
}