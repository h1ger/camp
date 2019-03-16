var express = require("express"),
    app = express(),
    config = require("./config");
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    mongoose = require("mongoose"),
    Campground = require("./mongomodel/campground"),
    Comment = require("./mongomodel/comments"),
    session = require("express-session"),
    passportLocalMongoose = require("passport-local-mongoose"),
    localStrategy = require("passport-local"),
    passport = require("passport"),
    path = require("path"),
    helmet = require("helmet"),
    User = require("./mongomodel/index"),
    errorHandler = require("errorhandler");


app.set('view engine', 'ejs');
app.use(helmet());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));
app.use(express.static(path.join(__dirname, 'public')))
app.use(methodOverride('_method'));
app.use(session({
    secret: 'Some paw marks from the cat i saw earlier.',
    resave: false,
    saveUninitialized: true
}));

var URI =  process.env.DATABASEURL || 'mongodb://localhost:27017/yelpcamp';
console.log(process.env.DATABASEURL);
console.log(URI);

mongoose.connect(URI, {useNewUrlParser: true});
mongoose.set(mongoose, {usefindAndModify: false});
// mongoose.set('debug', true);

// PASSPORT

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

// Landing
app.get('/', function(req, res){
    res.render('landing');
});

// Index
app.get('/campgrounds', function(req, res){
    Campground.find({}, function(error, campgrounds){
        if(error){
            console.log(error);
        } else {
            console.log(req.user);
            res.render('index', {campgrounds: campgrounds, currentUser: req.user});
        }
    });
});

// New Route
app.get('/campgrounds/new', isLoggedIn, function(req, res){
    res.render('new');
});

// Create Route
app.post('/campgrounds', isLoggedIn, function(req, res){
    var camp = {
        title: req.body.title,
        _image: req.body._image,
        info: req.body.info
    }
    
    Campground.create(camp, function(error, newCamp){
        if(error){
            console.log(error);
        } else {
            res.redirect('/campgrounds');
        }
    });
});

// Show Route
app.get('/campgrounds/camp/:id', function(req, res){
    Campground.findById(req.params.id).populate("comment").exec(function(error, showCamp){
        if(error){
            console.log(req.params.id);
            console.log(error);
        } else {
            res.render('show', {showCamp: showCamp});
        }
    })
});

// Edit Route
app.get('/campgrounds/camp/:id/edit', isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(error, editCamp){
        if(error) {
            console.log(req.params.id);
            console.log(error);
        } else {
            res.render('edit', {editCamp: editCamp});
        }
    })
})
// Update Route
app.put('/campgrounds/camp/:id', isLoggedIn, function(req, res){
    Campground.findByIdAndUpdate(req.params.id, req.body.camp, function(error, editCamp){
        if(error) {
            console.log(req.params.id +'Put Route');
            console.log(error);
        } else {
            res.redirect('/campgrounds/camp/'+req.params.id);
        }
    })
})

// Delete Route
app.delete('/campgrounds/camp/:id', isLoggedIn,function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(error){
        if(error){
            console.log(error); 
        } else {
            console.log('Success.');
            res.redirect('/campgrounds');
        }
    });
});


// Comment Route

// New Route
app.get('/campgrounds/camp/:id/comment/new', isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(error, camp){
        if(error){
            console.log(error);
            
        } else {
            res.render('comments/new', {camp: camp});
        }
    })
})

// Create Route
app.post('/campgrounds/camp/:id/comment', isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (error, camp) {
        if(error){
            console.log(error);
            
        } else {
            Comment.create(req.body.comment, function (error, comments) {
                if(error){
                    console.log(error);
                } else {
                    comments.username.id = req.user._id;
                    comments.username.username = req.user.username;
                    comments.save();
                    console.log(comments +"@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");     
                    camp.comment.push(comments);
                    camp.save();
                    res.redirect('/campgrounds/camp/'+req.params.id);
                }
            });
        }
    });
});

// Edit Route
app.get('/campgrounds/camp/:id/comment/:comment_id/edit', isLoggedIn, function(req,res){
    Comment.findById(req.params.comment_id, function(error, commentEdit){
        if(error){
            console.log(error); 
        } else {
           res.render('comments/edit', {campid: req.params.id, commentEdit: commentEdit})
        }
    });
});

// Put Route
app.put('/campgrounds/camp/:id/comment/:comment_id', isLoggedIn, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (error, commentPut) {
        if(error){
            console.log(error);
        } else {
            res.redirect('/campgrounds/camp/'+req.params.id);
        }
    });
});

// Delete Route
app.delete('/campgrounds/camp/:id/comment/:comment_id', isLoggedIn, function (req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function (error, data) {
        if(error){
            console.log(error);
        } else {
            res.redirect('/campgrounds/camp/'+req.params.id);
        }
    });
});

// Auth Routes

app.get('/register', function(req, res){
    res.render('auth');
});

app.post('/register', function(req, res){
    console.log(req.body.username);
    User.register(new User({username: req.body.username}), req.body.password, function(error, userData){
        if(error){
            console.log(error);
            res.redirect('/register');
        } else {
            passport.authenticate("local")(req, res, function(){
                console.log('Success registration!');
                res.redirect('/campgrounds');
            });
        }
    });
});

app.get('/login', function(req, res){
    res.render('user');
});

app.post('/login', passport.authenticate("local", {
    successRedirect: '/campgrounds',
    failureRedirect: '/login'
}), function (req, res) {
    
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

var port = process.env.PORT || 3000;
console.log(port);
app.listen(port, process.env.IP, function(req, res){
    console.log('Serving Hot Coffee!');
});
