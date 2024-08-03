const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');

// Hiển thị form đăng ký
router.get('/register', (req, res) => {
    res.render('register');
});

// Xử lý đăng ký
router.post('/register', async (req, res) => {
    try {
        const user = new User({
            username: req.body.username,
            password: req.body.password
        });
        await user.save();
        // Đăng nhập ngay sau khi đăng ký
        req.login(user, err => {
            if (err) return res.redirect('/auth/register');
            res.redirect('/');
        });
    } catch (error) {
        res.redirect('/auth/register');
    }
});

// Hiển thị form đăng nhập
router.get('/login', (req, res) => {
    res.render('login');
});

// Xử lý đăng nhập
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login'
}));

// Đăng xuất
router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/auth/login');
    });
});

module.exports = router;
