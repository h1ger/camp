var mongoose = require("mongoose");

campgroundSchema = new mongoose.Schema({
    title: String,
    _image: String,
    info: String,
    comment: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});


module.exports = mongoose.model ("Campground", campgroundSchema);