const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const passport = require('passport');
const session = require('express-session');
const Redis = require('ioredis');
const RedisStore = require('connect-redis').default;

// Cấu hình dotenv để đọc các biến môi trường từ tệp .env
dotenv.config();

const app = express();

// Kết nối tới Redis
const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD || null,
});

redisClient.on('error', (err) => {
    console.log('Redis connection error:', err);
});

redisClient.on('connect', () => {
    console.log('Redis connected');
});

// Kết nối tới MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Thiết lập view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Thiết lập thư mục tĩnh
app.use(express.static(path.join(__dirname, 'public')));

// Sử dụng body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Cấu hình session với RedisStore
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Cấu hình Passport
require('./passport');
app.use(passport.initialize());
app.use(passport.session());

// Định tuyến
const notesRouter = require('./routes/notes');
const authRouter = require('./routes/auth');
app.use('/notes', notesRouter);
app.use('/auth', authRouter);

// Trang chủ
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/notes');
    } else {
        res.redirect('/auth/login');
    }
});

// Khởi động server
const PORT = process.env.APP_PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});
