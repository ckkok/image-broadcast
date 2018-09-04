import express from 'express';
import multer from 'multer';
import cookieParser from 'cookie-parser';
import sha256 from 'sha256';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

let CURRENT_KEY;
let LAST_PIC;
let ADMIN_PASSWORD = sha256(process.env.ADMIN_PASSWORD);
let HASHED_ADMIN_KEY;

const permittedMimeTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/pjpeg'];

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'public/uploads/');
    },
    filename: function (req, file, callback) {
        let fileName = CURRENT_KEY + '-' + file.originalname;
        if (LAST_PIC) {
            fs.unlink('public/' + decodeURIComponent(LAST_PIC), (err) => {
                if (err) throw err;
            });
        };
        LAST_PIC = 'uploads/' + encodeURIComponent(fileName);
        callback(null, fileName);
    }
});

const fileFilter = function (req, file, callback) {
    if (req.body.key === CURRENT_KEY && permittedMimeTypes.includes(file.mimetype)) {
        callback(null, true);
        CURRENT_KEY = getNewKey();
    } else {
        callback(null, false);
    };
};

const upload = multer({storage, fileFilter});
const app = express();

function getNewKey() {
    return Math.ceil(Math.random() * 9999).toString();
};

function authCheck(req, res, next) {
    let { adminKey } = req.cookies;
    if (adminKey === HASHED_ADMIN_KEY) {
        next();
    } else {
        res.redirect('/');
    };
};

app.use(cookieParser());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.post('/login', (req, res) => {
    if (sha256(req.body.password) == ADMIN_PASSWORD) {
        res.cookie('adminKey', HASHED_ADMIN_KEY);
        res.redirect('/key');
    } else {
        res.redirect('/login');
    };
});

app.get('/login', (req, res) => {
    res.send(`
        <html>
            <head><title>Login</title></head>
            <body>
                <form action="/login" method="POST">
                    <label for="password">Password: </label><input type="password" name="password" /><br />
                    <input type="submit" value="Login" />
                </form>
            </body>
        </html>
    `)
});

app.get('/logout', (req, res) => {
    res.clearCookie('adminKey');
    res.redirect('/');
})

app.post('/upload', upload.single('file'), (req, res) => {
    res.redirect('/');
});

app.get('/key', authCheck, (req, res) => {
    res.send(CURRENT_KEY);
});

app.get('/last', authCheck, (req, res) => {
    if (LAST_PIC) {
        res.send(`<html><head><title>Shared Picture</title></head><body><img src="${LAST_PIC}"></body></html>`);
    } else {
        res.send('Nothing uploaded yet');
    };
});

CURRENT_KEY = getNewKey();
HASHED_ADMIN_KEY = sha256(process.env.ADMIN_KEY);

app.listen(3000, () => {console.log('Server started')});
