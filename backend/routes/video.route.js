const express = require('express');
const { getVideos, createVideo, deleteVideo } = require('../controllers/video.controller');
const isAuth = require('../middlewares/isAuth');
const isAdmin = require('../middlewares/isAdmin');

const router = express.Router();

router.get('/', isAuth, getVideos);
router.post('/', isAuth, isAdmin, createVideo);
router.delete('/:id', isAuth, isAdmin, deleteVideo);

module.exports = router;
