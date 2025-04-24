
const { createWriteStream } = require('fs');
const { promisify } = require('util');
const pipeline = promisify(require('stream').pipeline);
const { v4: uuidv4 } = require('uuid');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Generate unique filename
    const fileExtension = req.headers['content-type'].split('/')[1];
    const filename = `${uuidv4()}.${fileExtension}`;
    const filePath = `./uploads/${filename}`;

    // Write file to uploads folder
    await pipeline(req, createWriteStream(filePath));

    // Return the URL
    const fileUrl = `https://${req.headers.host}/uploads/${filename}`;
    return res.status(200).json({ 
      success: true, 
      url: fileUrl,
      filename: filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
};
