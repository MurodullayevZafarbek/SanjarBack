const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        let arr = file.originalname.split(".")
        let text = ""
        for (let i = 0; i < arr.length - 1; i++) {
            text += arr[i]
        }
        text += uniqueSuffix
        text += "."
        text += arr.pop()
        cb(null, text)
    }
})

const upload = multer({ storage: storage })

const compressImage = (req, res, next) => {
    if (!req.files) {
        return next();
    }

    const filePath = req.files[0]?.path;
    const outputFilePath = `public/uploads/compressed-${req.files[0]?.filename}`;
    sharp(filePath)
        .resize(400) // Adjust the desired width or height for compression
        .toFile(outputFilePath, (err, info) => {
            if (err) {
                w
                return next(err);
            }
            next();
        });
};

module.exports = { upload, compressImage }