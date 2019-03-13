var mongoose = require('mongoose');

commentSchema = new mongoose.Schema({
    username: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    content:  String,
    dateCreated: {type: Date, default:Date.now}
});


module.exports = mongoose.model('Comment', commentSchema);