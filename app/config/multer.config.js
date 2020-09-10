module.exports = {
        dest: `uploads/`,
        limits: {
            files: 5, // allow up to 5 files per request,
            fieldSize: 2 * 1024 * 1024 // 2 MB (max file size)
        },
        fileFilter: (req, file, cb) => {
            // allow images only
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new Error('Only image are allowed.'), false);
            }
            cb(null, true);
        },
        filename: function (req, file, cb) {
            crypto.pseudoRandomBytes(16, function (err, raw) {
              cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
            });
          }
    };