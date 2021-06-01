const express = require('express')
const router = express.Router()

// middleware that is specific to this router
// router.use(function timeLog(req, res, next) {
//     console.log('Time: ', Date.now())
//     next()
// })

router.get('/', (req, res) => {
    console.log('router index');
});

module.exports = router