// pages/api/upload-video.js
import cloudinary from 'cloudinary';
import { IncomingForm } from 'formidable';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse form data
    const data = await new Promise((resolve, reject) => {
      const form = new IncomingForm();
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const file = data.files.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Cloudinary dengan resource_type video
    const result = await cloudinary.v2.uploader.upload(file.filepath, {
      resource_type: 'video', // Ini yang paling penting!
      folder: 'assets-videos',
      use_filename: true,
      unique_filename: false,
      chunk_size: 6000000, // Untuk video besar
      eager: [
        { width: 300, height: 300, crop: "pad", audio_codec: "none" }, 
        { width: 160, height: 100, crop: "crop", gravity: "south", audio_codec: "none" } 
      ]
    });

    return res.status(200).json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Video upload error:', error);
    return res.status(500).json({ 
      error: 'Video upload failed',
      details: error.message 
    });
  }
}