const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const app = express();
const port = 3000;

app.use(fileUpload());
app.use(express.static('public'));
app.use('/upload', express.static('upload'));

app.post('/upload', (req, res) => {
    if (!req.files || !req.files.image) {
        return res.status(400).send('No files were uploaded.');
    }

    const image = req.files.image;
    const uploadPath = __dirname + '/upload/' + image.name;

    image.mv(uploadPath, (err) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send({
            success: true,
            url: `http://127.0.0.1:${port}/upload/${image.name}`
        });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}`);
});