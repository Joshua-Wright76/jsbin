const bcrypt = require('bcryptjs');
const db = require('../db.js');
const SALT_WORK_FACTOR = 10;


const userController = {};

userController.createUser = (req, res, next) => {
  console.log('someone is trying to create a new user!');
  console.log('this is their request body: ', req.body)
  bcrypt.genSalt(SALT_WORK_FACTOR)
  .then(salt => {
    console.log('generated salt; hashing password')
    return bcrypt.hash(req.body.password, salt)
  })
  .then(hash => {
    return db.one('INSERT INTO users(username, password) VALUES ($1, $2) RETURNING _id', [req.body.username, hash])
    //.then below passes the '_id' that we are returning from the above insert insert
    //'RETURNING _id'. it is this id we have specified to be the foreign key for our session table
  })
  .then(data => { 
    res.locals.data = data;
    db.query('INSERT INTO sessions(session_id) VALUES($1)', [data._id])
    .catch(err => {
      console.log('hi im an error', err);
    })
    console.log(res.locals);
    next();
  })
  .catch(err => {
    console.error(err);
    res.send(err);
  })
}


module.exports = userController;