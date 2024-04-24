const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const UPLOAD_FOLDER = 'uploads';
const THUMBNAIL_FOLDER = 'thumbnails';

fs.existsSync(UPLOAD_FOLDER) || fs.mkdirSync(UPLOAD_FOLDER);
fs.existsSync(THUMBNAIL_FOLDER) || fs.mkdirSync(THUMBNAIL_FOLDER);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_FOLDER);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

let videos = [];

function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        res.status(401).send('Unauthorized');
        return;
    }
    const token = authHeader.split(' ')[1];
    if (token in users) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}

app.post('/upload', authenticate, upload.single('video'), (req, res) => {
    const file = req.file;
    if (!file) {
        res.status(400).send('No file uploaded.');
        return;
    }
    const privacy = req.body.privacy || 'public';
    videos.push({ filename: file.filename, privacy, views: 0 });
    generateThumbnail(file.filename);
    res.status(200).send('Video uploaded successfully.');
});

function generateThumbnail(filename) {
    // Logic to generate thumbnail
}

app.get('/videos', (req, res) => {
    res.json(videos);
});

app.get('/watch/:filename', (req, res) => {
    const filename = req.params.filename;
    const video = videos.find(v => v.filename === filename);
    if (!video) {
        res.status(404).send('Video not found.');
        return;
    }
    video.views++;
   
