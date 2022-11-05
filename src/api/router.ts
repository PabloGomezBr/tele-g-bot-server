import { Router } from 'express';

import { getMessage } from './routerController';

const router = Router();

router.get('/', getMessage);

// router.get('/', getMessage, (req, res) => {
//     res.status(200).send();
// });

router.post('/', (req, res) => {
    res.send('POSTEANDO');
});

export default router;
