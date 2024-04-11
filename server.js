// to start server run "npm run devStart" in terminal without quotes
// open a web browser and type localhost:3000 and that will open server

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport.config')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = [] // because we are storing users in memory and not in a database
                 // every time a change is made the users needs to be added again
                 // this will be resolved when the database is added so it will store
                 // the users

app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(express.static('views'))

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name})
})

app.get('/main', checkAuthenticated, (req, res) => {
    res.render('main.ejs', { name: req.user.name });
});


app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs', {message: req.flash('error')})
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/main',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(), // if you have a database you do not need to do this step
            name: req.body.name,
            email : req.body.email,
            password: hashedPassword

        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
    console.log(users)
})

app.delete('/logout', (req, res) => {
    req.logOut((err) => {
        if (err) {
            console.error(err)
            return res.status(500).send("Error during logout")
        }
    res.redirect('/')
    })
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        return res.redirect('/main')
    }
    next()
}

app.listen(3000)