var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    mongoose = require("mongoose"),
    Campground = require("./mongomodel/campground"),
    Comment = require("./mongomodel/comments");

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));

mongoose.connect('mongodb://localhost:27017/yelpcamp', {useNewUrlParser: true});
mongoose.set(mongoose, {usefindAndModify: false})
// Index
app.get('/campgrounds', function(req, res){
    Campground.find({}, function(error, campgrounds){
        if(error){
            console.log(error);
        } else {
            res.render('index', {campgrounds: campgrounds});
        }
    });
});

// New Route
app.get('/campgrounds/new', function(req, res){
    res.render('new');
});

// Create Route
app.post('/campgrounds', function(req, res){
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
            console.log('error');
        } else {
            res.render('show', {showCamp: showCamp});
        }
    })
});

// Edit Route
app.get('/campgrounds/camp/:id/edit', function(req, res){
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
app.put('/campgrounds/camp/:id', function(req, res){
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
app.delete('/campgrounds/camp/:id', function(req, res){
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
app.get('/campgrounds/camp/:id/comment/new', function(req, res){
    Campground.findById(req.params.id, function(error, camp){
        if(error){
            console.log(error);
            
        } else {
            res.render('comments/new', {camp: camp});
        }
    })
})

// Create Route
app.post('/campgrounds/camp/:id/comment', function (req, res) {
    Campground.findById(req.params.id, function (error, camp) {
        if(error){
            console.log(error);
            
        } else {
            Comment.create(req.body.comment, function (error, comments) {
                if(error){
                    console.log(error);
                    console.log(comments);
                } else {
                    camp.comment.push(comments);
                    camp.save();
                    res.redirect('/campgrounds/camp/'+req.params.id);
                }
            });
        }
    });
});

// Edit Route
app.get('/campgrounds/camp/:id/comment/:comment_id/edit', function(req,res){
    Comment.findById(req.params.comment_id, function(error, commentEdit){
        if(error){
            console.log(error); 
        } else {
           res.render('comments/edit', {campid: req.params.id, commentEdit: commentEdit})
        }
    });
});

// Put Route
app.put('/campgrounds/camp/:id/comment/:comment_id', function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (error, commentPut) {
        if(error){
            console.log(error);
        } else {
            res.redirect('/campgrounds/camp/'+req.params.id);
        }
    });
});


// Delete Route
app.delete('/campgrounds/camp/:id/comment/:comment_id', function (req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function (error, data) {
        if(error){
            console.log(error);
            
        } else {
            res.redirect('/campgrounds');
        }
    });
});

var port = 5000;
app.listen(port, function(req, res){
    console.log('Serving Hot Coffee!');
});

