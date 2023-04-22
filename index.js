if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }

const express = require("express");
var cookieParser = require('cookie-parser')
var path = require('path');
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const {join} = require('path');
const morgan = require("morgan");
const cors = require("cors");
const swaggerUI = require("swagger-ui-express");
const docs = require('./src/docs');
const todoRouter = require('./src/routes/todos');
const indexRouter = require('./src/routes/index');
const auth = require("./middleware/auth");

const users = []


const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const adapter = new FileSync(join(__dirname,'..','db.json'));
const db = low(adapter);
db.defaults({ todos:[] }).write();    
const app = express();
const PORT = process.env.PORT || 4000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//Session
app.use(cookieParser(secret='secret'));
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

// app configs.
app.db = db;
async function seed(){
  const hashedPassword = await bcrypt.hash(process.env.PASSWORD, 10)
  users.push({
      id: Date.now().toString(),
      name: process.env.NAME,
      email: process.env.EMAIL,
      password: hashedPassword
  });
}
seed().then(()=> console.log(users));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(morgan("dev"));
app.use(cors());
app.use('/',indexRouter);
app.use('/todos',todoRouter);
app.use('/api-docs',checkAuthenticated,swaggerUI.serve,swaggerUI.setup(docs));
app.use(express.static(__dirname + '/public'));


//initialize the app.
async function initialize(){    
    app.listen(PORT);
};

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }))

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.jade')
})

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.jade')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      users.push({
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
      })
      res.redirect('/login')
    } catch {
      res.redirect('/register')
    }
  })
  
  app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
  })
  
  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/login')
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      console.log(">>> Authenticated <<<")
      return res.redirect('/')
    }
    console.log(">>> Not Authenticated <<<")
    next()
  }

initialize().finally(() => console.log(`app started on port:${PORT}`));