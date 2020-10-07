const express = require('express');
const app = express();
const Joi = require('joi');
const session = require('express-session');
const bodyParser = require('body-parser');
const { urlencoded, json } = require('body-parser');


app.use(session({
    secret: 'secret1234',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
const mySql = require('mysql')


//database
const mvl = mySql.createConnection({
    host: 'localhost',
    user: 'mevil',
    password: 'mevil250128m@',
    database: 'noteWall'
});

mvl.connect((err) => {
    if (err) throw err;
    console.log('Connected to Mysql')
});

//GET METHODS

app.get('/', (req, res) => {
    res.render("login")
});

app.get('/register', (req, res) => {
    res.render("register")
});

app.get('/home', function(req, res) {
    if (req.session.loggedin) {
        res.render('home', { name: req.session.phoneNumber });
    } else {
        res.send('Please login to view this page!');
    }
    res.end();
});


//POST METHODS  

//login 
app.post('/', function(req, res) {
    var phoneNumber = req.body.phoneNumber;
    var passWord = req.body.passWord;
    if (phoneNumber && passWord) {
        mvl.query('SELECT * FROM users WHERE phoneNumber = ? AND passWord = ?', [phoneNumber, passWord], function(error, results, fields) {
            if (results.length > 0) {
                req.session.loggedin = true;
                req.session.phoneNumber = phoneNumber;
                res.redirect('/home');
            } else {
                res.send('Incorrect Username and/or Password!');
            }
            res.end();
        });
    } else {
        res.send('Please enter Username and Password!');
        res.end();
    }
});
//creating user
app.post('/register', (req, res) => {

    const schema = Joi.object({
        phoneNumber: Joi.string().pattern(new RegExp('^[09]')).required(),
        passWord: Joi.string().min(4).required(),
        note: Joi.string()
    });
    const result = schema.validate(req.body);
    if (result.error) {
        res.status(400).send(result.error)
        return;
    }


    let sql = `INSERT INTO users(phoneNumber,passWord,note) VALUES (?)`;
    let values = [
        req.body.phoneNumber,
        req.body.passWord,
        req.body.note,

    ];


    mvl.query(sql, [values], function(err, data, fields) {
        if (err) throw err;
        res.render('login', { name: req.session.phoneNumber });
    });

});


//Loading notes
app.post('/note', (req, res) => {

    let sql = `SELECT note FROM users
    where phoneNumber=?`;

    mvl.query(sql, [req.session.phoneNumber], (err, result, fields) => {
        if (err) throw err;
        res.json(result)
    });

})


//PORTS
const port = process.env.PORT || 3000
app.listen(port), console.log(`app listening at ${port}`)