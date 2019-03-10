var mongoose = require('mongoose');

commentSchema = new mongoose.Schema({
    name:  String,
    content:  String,
    dateCreated: {type: Date, default:Date.now}
});


module.exports = mongoose.model('Comment', commentSchema, 'comments');