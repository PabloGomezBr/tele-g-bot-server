import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.send('RAIZ DEL SERVER');
});

router.post('/', (req, res) => {
    res.send('POSTEANDO');
});

export default router;
