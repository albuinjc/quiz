// Importamos el modelo
var models = require ('../models/models.js')

var getTematicas = function(){
	return ["Otro", "Humanidades", "Ocio", "Ciencia","Tecnología"];
};

// Autoload´- factoriza el codigo si ruta incluye :quizId
exports.load=function( req, res, next, quizId){
	models.Quiz.find({
		where:{ id: Number(quizId) },
		include: [{ model: models.Comment }]
	}).then(
		function(quiz){
			if (quiz){
				req.quiz=quiz;
				next();
			} else { next (new Error('No existe quizId=' + quizId)); }
		}
	).catch (function (error) { next(error);});
};

//GET /quizes
exports.index = function(req,res) {
	if(req.query.search !== undefined){
		var search = "%" + req.query.search + "%"; // Comodin % antes y después
		search = search.trim().replace(/\s/g,"%"); // Sustituimos espacios en blanco por comodin
		models.Quiz.findAll({where: ["LOWER(pregunta) like ?", search.toLowerCase()], order: 'pregunta ASC'}).then(
			function(quizes) {
				res.render('quizes/index.ejs', { quizes: quizes, errors: [] });
			}
		).catch (function (error) { next(error);});
	} else {
		models.Quiz.findAll().then(
			function(quizes) {
				res.render('quizes/index.ejs', { quizes: quizes, errors: [] });
			}
		).catch (function (error) { next(error);});
	}
};


//GET /quizes/:id
exports.show = function (req, res){
	res.render('quizes/show', { quiz: req.quiz, errors: []});
};

//GET /quizes/answer
exports.answer = function (req, res){
	var resultado = 'Incorrecto';
	if (req.query.respuesta === req.quiz.respuesta){
		resultado= 'Correcto';
	}
	res.render('quizes/answer', { quiz: req.quiz, respuesta: resultado, errors: []});
};

//GET /quizes/new
exports.new = function (req, res){
	var quiz = models.Quiz.build ( 	// Crea objeto quiz 
		{pregunta: "Pregunta", respuesta: "Respuesta", tematica: "Otro"}
	);
	res.render('quizes/new',{quiz: quiz, tematicas: getTematicas(), errors: []});
};

//POST /quizes/create
exports.create = function (req, res){
	var quiz = models.Quiz.build ( req.body.quiz );
	
	quiz.validate().then(
		function (err){
			if (err){
				res.render('quizes/new', {quiz: quiz, errors: err.errors});
			} else {
				// Guarda en DB los campos pregunta y respuesta de quiz
				quiz.save({fields:["pregunta","respuesta","tematica"]}).then(
					function(){ res.redirect('/quizes');}
				); // Redirecciona HTTP (URL relativo) lista de preguntas
			}
		}
	);
};

//GET quizes/:id/edit
exports.edit = function(req,res){
	var quiz = req.quiz; //autoload de instancia de quiz
	
	res.render('quizes/edit', {quiz: quiz, tematicas: getTematicas(), errors: []});
};

//PUT /quizes/:id
exports.update = function (req, res) {
	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;
	req.quiz.tematica = req.body.quiz.tematica;
	
	req.quiz.validate().then(
		function(err){
			if(err){
				res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
			} else {
				// Guarda campos pregunta y respuesta en la DB
				req.quiz.save({fields:["pregunta","respuesta","tematica"]}).then(
					function(){ res.redirect('/quizes');}
				); // Redirecciona HTTP lista de preguntas (URL relativo)
			}
		}	
	);
};

//DELETE /quizes/:id
exports.destroy = function(req,res){
	req.quiz.destroy().then( function() {
		res.redirect('/quizes');
	}).catch(function(error){next(error);});	
};