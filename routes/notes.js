const express = require('express');
const router = express.Router();
const Note = require('../models/Note_1');

// Lấy danh sách các ghi chú
router.get('/', async (req, res) => {
    const { keyword, sortBy } = req.query;

    let query = {};

    if (keyword) {
        query = {
            $or: [
                { title: { $regex: keyword, $options: 'i' } },
                { content: { $regex: keyword, $options: 'i' } }
            ]
        };
    }

    let sortOption = { created_at: -1 }; // Default sort by date (newest first)

    if (sortBy === 'title') {
        sortOption = { title: 1 }; // Sort by title (ascending)
    }

    const notes = await Note.find(query).sort(sortOption);
    res.render('index', { notes: notes, user: req.user, keyword, sortBy });
});

router.get('/api', async (req, res) => {
    try {
        const notes = await Note.find();
        res.json(notes); // Trả về JSON
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Hiển thị form tạo ghi chú mới
router.get('/new', (req, res) => {
    res.render('new', { user: req.user });
});

// Tạo ghi chú mới
router.post('/', async (req, res) => {
    const note = new Note({
        title: req.body.title,
        content: req.body.content
    });
    await note.save();
    res.redirect('/notes');
});

// Hiển thị form chỉnh sửa ghi chú
router.get('/edit/:id', async (req, res) => {
    const note = await Note.findById(req.params.id);
    res.render('edit', { note: note, user: req.user });
});

// Cập nhật ghi chú
router.post('/:id', async (req, res) => {
    await Note.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        content: req.body.content
    });
    res.redirect('/notes');
});

// Xóa ghi chú
router.post('/delete/:id', async (req, res) => {
    await Note.findByIdAndDelete(req.params.id);
    res.redirect('/notes');
});

module.exports = router;
