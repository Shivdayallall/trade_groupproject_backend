var express = require('express')
var router = express.Router()

const join = require('../utils/validation/join')
const login = require('../utils/validation/login')
var registerController = require('../controllers/registerController')

router.post('/register', function(req, res) {
  console.log(req.body)
  const signUp = req.body
  const { errors, isValid} = join(signUp)

  if(!isValid) {
    console.log(!isValid, errors)
    return res.status(400).json(errors)
  }

  registerController.join(signUp)
    .then(user => {
      console.log('------')
      console.log(user)
      res.status(200).json({
        data: user
      })
    })
    .catch(err => {
      const status = err.status
      const message = err.message
      console.log(err)
      res.status(status).json({
        message: message
      })
    })
})

router.post('/login', function(req, res) {
  const {errors, isValid } = login(req.body)

  if (!isValid) {
    return res.status(400).json(errors);
  }

  registerController
    .login(req.body)
    .then(user => res.json(user))
    .catch(err => res.json(err))
})
module.exports = router