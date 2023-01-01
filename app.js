
var express = require('express');
var path = require('path');
var fs = require('fs');  //used to read or write to a file
const { request } = require('http');
var session = require('express-session');

var app = express();
const PORT = process.env.PORT || 3000;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


//the user 
/*var userName = "";
var userPass = "";
var userList = [];*/

let db = null;
var MongoClient = require('mongodb').MongoClient;
const dbName = 'myDB';
const client = new MongoClient("mongodb://127.0.0.1:27017");
client.connect(function (err) {
  if (err) throw err;
  console.log('Connected to MongoDB!');
  db = client.db(dbName);
});

app.use(session({
  secret: 'secretkey', // a secret key to sign the session ID cookie
  resave: false, // don't save the session if it was not modified
  saveUninitialized: false, // don't create a session if there is no activity
}));

const sessions = (req, res, next) => {
  if (req.session.username) {
    next();
  } else {
    res.redirect('/');
  }
}

app.get('/', function (req, res) {
  if (req.session.username) {
    res.render('home');
  } else {
    res.render('login');
  }
});

app.post('/', async function (req, res) {
    var username = req.body.user;
    var password = req.body.pass;
    if (username == "" || password == "") {
        let alert = require('alert');
        alert('please enter your username and your password :)');        
    }
    else { if (username == "admin" || password == "admin") {
        req.session.username = username;
        res.render("home");      
    }
        else{
            db.collection('myCollection').find({ username: username, password: password }).toArray(function (err, ress) {
                if(err) throw err;
                console.log(ress);
                if (ress.length == 0) {
                    //not found in the db
                    let alert = require('alert');
                    alert('wrong username or password!.double check or if it is your first time ,register');
                }
                else {
                    //found in the db
                    console.log("i am in the db");
                    req.session.username = username;
                    /*userName = user;
                    userPass = pass;
                    userList = ress.To_Go_List;
                    console.log(userList);*/
                    res.render("home");
                }
            });
        }
    }
});


app.get('/Registration', function (req, res) {
    if (req.session.username) {
        res.render('home');
      } else {
        res.render('registration');
      }
    });

app.post('/Register', function (req, res) {
    var username = req.body.user;
    var password = req.body.pass;
    if (username == "" || password == "") {
        let alert = require('alert');
        alert('please enter a valid username and password ');
        res.redirect("/Registration");
        //return;
    }
    else { if(username == "admin"){
                let alert = require('alert');
                 alert('this username has already been taken , please choose another one');
            }
            else{
            db.collection('myCollection').countDocuments({username}, (err, ress) => {
                if (ress == 0) {
                    //not found in the db then insert
                    db.collection('myCollection').insertOne({ username: username, password: password, To_Go_List: [] });
                    let alert = require('alert');
                    alert("your registration has been successfully completed");
                    res.redirect("/");
                }
                else {
                    //found in the db
                    let alert = require('alert');
                    alert('this username has already been taken , please choose another one');
                    res.redirect("/registration");
                }
            });
        }
    }
});
   
app.get('/home', sessions, (req, res) => {
    res.render('home')
});

app.get('/hiking',sessions, (req, res) => {
    res.render('hiking')
});

app.get('/cities', sessions, (req, res) => {
    res.render('cities')
});

app.get('/islands', sessions, (req, res) => {
    res.render('islands')
});

app.get('/wanttogo', sessions, async (req, res) => {
    if(req.session.username == "admin"){
        res.render('wanttogo',{title: "Your list is empty"});
    }
    else{
        var user = await db.collection("myCollection").findOne({ username: req.session.username });
        var userList = user.To_Go_List
        if(userList.length==0)
        {
            res.render('wanttogo',{title: "Your list is empty"});
        }
        else{
            res.render('wanttogo',{title: userList});
        }
    }
});

app.post('/search', function (req,res) {
    const countries = ["bali", "annapurna", "inca", "paris", "rome", "santorini"];
    const searchKey = req.body.Search;
    const results = countries.filter((element) => element.toLowerCase().includes(searchKey.toLowerCase()));
    res.render('searchresults', { results });
});

 //Sarah
 app.get('/annapurna',sessions, (req,res) => {
  
    res.render('annapurna');
 })
 
 app.get('/bali',sessions, (req,res) => {
   
   res.render('bali');
 })
 app.get('/inca',sessions, (req,res) => {
   
   res.render('inca');
 })
 app.get('/paris',sessions, (req,res) => {
   
   res.render('paris');
 })
 app.get('/rome',sessions, (req,res) => {
   
   res.render('rome');
 })
 app.get('/santorini',sessions, (req,res) => {
   
   res.render('santorini');
 })

 app.post('/annapurna', sessions, async (req, res) => {

    var user = await db.collection('myCollection').findOne({ username: req.session.username });
    var list = user.To_Go_List;

            if (list.includes("annapurna"))
        {
            let alert = require('alert');
            alert('Annapurna is already in your Want-to-go List!');
        }
        else
        {
            db.collection('myCollection').updateOne(
                { username: req.session.username},
                {$push: {To_Go_List: "annapurna"}}
                );
            let alert = require('alert');
            alert('Annapurna is successfully added to your Want-to-go List');
        }
  });
 app.post('/bali',sessions, async (req, res) => {

    var user = await db.collection('myCollection').findOne({ username: req.session.username });
    var list = user.To_Go_List;

            if (list.includes("bali"))
        {
            let alert = require('alert');
            alert('Bali is already in your Want-to-go List!');
        }
        else
        {
            db.collection('myCollection').updateOne(
                { username: req.session.username},
                {$push: {To_Go_List: "bali"}}
                );
            let alert = require('alert');
            alert('Bali is successfully added to your Want-to-go List');
        }
  });
  app.post('/inca',sessions, async (req, res) => {

    var user = await db.collection('myCollection').findOne({ username: req.session.username });
    var list = user.To_Go_List;

            if (list.includes("inca"))
        {
            let alert = require('alert');
            alert('Inca is already in your Want-to-go List!');
        }
        else
        {
            db.collection('myCollection').updateOne(
                { username: req.session.username},
                {$push: {To_Go_List: "inca"}}
                );
            let alert = require('alert');
            alert('Inca is successfully added to your Want-to-go List');
        }
  });

  app.post('/paris',sessions, async (req, res) => {

    var user = await db.collection('myCollection').findOne({ username: req.session.username });
    var list = user.To_Go_List;

            if (list.includes("paris"))
        {
            let alert = require('alert');
            alert('Paris is already in your Want-to-go List!');
        }
        else
        {
            db.collection('myCollection').updateOne(
                { username: req.session.username},
                {$push: {To_Go_List: "paris"}}
                );
            let alert = require('alert');
            alert('Paris is successfully added to your Want-to-go List');
        }
  });

  app.post('/rome',sessions, async (req, res) => {

    var user = await db.collection('myCollection').findOne({ username: req.session.username });
    var list = user.To_Go_List;

            if (list.includes("rome"))
        {
            let alert = require('alert');
            alert('Rome is already in your Want-to-go List!');
        }
        else
        {
            db.collection('myCollection').updateOne(
                { username: req.session.username},
                {$push: {To_Go_List: "rome"}}
                );
            let alert = require('alert');
            alert('Rome is successfully added to your Want-to-go List');
        }
  });

  app.post('/santorini',sessions, async (req, res) => {

    var user = await db.collection('myCollection').findOne({ username: req.session.username });
    var list = user.To_Go_List;

            if (list.includes("santorini"))
        {
            let alert = require('alert');
            alert('Santorini is already in your Want-to-go List!');
        }
        else
        {
            db.collection('myCollection').updateOne(
                { username: req.session.username},
                {$push: {To_Go_List: "santorini"}}
                );
            let alert = require('alert');
            alert('Santorini is successfully added to your Want-to-go List');
        }
  });
    
  app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
  });

  app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
  });