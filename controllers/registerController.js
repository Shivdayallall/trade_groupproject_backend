const Register = require('../models/Register')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


module.exports = {
  join: (params) => {
    return new Promise(( resolve, reject) => {
      Register
        .findOne({email: params.email})
        .then( user => {
          // using the register function to create a new user, if there is an error reject the process and log error message
          if(user) {
            let errors = {}
            errors.message = 'Email taken! Pick another'
            errors.status = 400
            reject(errors)
          } else {
            // if create user a success save the new user to the newUser variable, save their name, password, and email
            const newUser = new Register({name:params.name, email:params.email, password:params.password})

            bcrypt.genSalt(10, (err, salt ) => {
              if(err) {
                reject(err)
              }
              bcrypt.hash(newUser.password, salt, (err, hashedPassword) => {
                // take the user password that is save to a variable hash the password
                if(err) {
                  reject(err)
                } else {
                  newUser.password = hashedPassword

                  newUser
                    .save()
                    .then(user => resolve(user))
                    .catch(err => reject(err))
                }
              })
            })
          }
        })
        .catch(err => {
          console.log(err)
        })
    })
  },

  login: (params) => {
    // save the user password and email to the variable they enter it into the search box
    const email = params.email
    const password = params.password

    return new Promise((resolve, reject) => {
      // when user try to login search by email if no user found by that eamil return error message
      Register
        .findOne({email})
        .then(user => {
          if(!user) {
            let errors = {}
            errors.email = " Email not found"
            errors.status = 404
            reject(errors)
          }
          // when user enter password compare password that was enter to the password that was saved on user create
          bcrypt
            .compare(password, user.password)
            .then( isAuth => {

              if(!isAuth) {
                let errors = {}
                errors.password = "check password and email"
                errors.status = 404

              } else {
                const payload = {
                  id: user._id,
                  email: user.email,
                  name: user.name
                }
                
                jwt.sign(payload, process.env.SECRET_KEY, {expiresIn: 4000}, (err, token) => {
                  if(err) {
                    console.log(err)
                    reject(err)
                  }
                  let success = {}
                  success.confirmation = "Complete"
                  success.token = "Bearer " + token
                  resolve(success)
                })
              }
            })
        })
    })
  }

}