//GET /author
exports.info = function (req, res){
	res.render('author', {errors: []});
};