var express = require("express");
var Imagen =  require("./models/imagenes");
var router = express.Router();
var imagen_find_middleware = require("./middlewares/find_image");
var fs = require('fs');  //modulo para archivos
var redis = require("redis");

var client = redis.createClient();

/* app.com/app/ */
router.get("/", function(req, res){
	Imagen.find({})
		.populate("creator")
		.exec(function(err, imagenes){
			if(err) 
				console.log(err);
			res.render("app/home",{imagenes:imagenes});
		});
});

/* REST */
router.get("/imagenes/new", function(req,res){
	res.render("app/imagenes/new");
});

router.all("/imagenes/:id*",imagen_find_middleware);

router.get("/imagenes/:id/edit", function(req,res){
	/* Refactor con find_image
	Imagen.findById(req.params.id, function(err, imagen){
		res.render("app/imagenes/edit",{imagen:imagen});
	});
	*/
	res.render("app/imagenes/edit");
});

router.route("/imagenes/:id")
	.get(function(req, res){
		/* Refactor con find_image
		Imagen.findById(req.params.id, function(err, imagen){
			res.render("app/imagenes/show",{imagen:imagen});
		});*/
		//client.publish("images",res.locals.imagen.toString());
		res.render("app/imagenes/show");
	})
	.put(function(req, res){
		/* Refactor con find_image
		Imagen.findById(req.params.id, function(err, imagen){
			imagen.title = req.body.title;
			imagen.save(function(err){
				if(!err){
					res.render("app/imagenes/show",{imagen:imagen});
				} else {
					res.render("app/imagenes/"+imagen.id+"/edit",{imagen:imagen});
				}
			});
			res.render("app/imagenes/show",{imagen:imagen});
		});*/
		res.locals.imagen.title = req.body.title;
		res.locals.imagen.save(function(err){
			if(!err){
				res.render("app/imagenes/show");
			} else {
				res.render("app/imagenes/"+req.params.id+"/edit");
			}
		});
		res.render("app/imagenes/show");
	})
	.delete(function(req, res){
		Imagen.findOneAndRemove({_id: req.params.id}, function(err){
			if(!err){
				res.redirect("/app/imagenes");
			} else {
				console.log(err);
				res.redirect("/app/imagenes"+re.params.id);
			}
		});
	});
	
router.route("/imagenes")
	.get(function(req, res){
		Imagen.find({creator: res.locals.user._id}, function(err, imagenes){
			if(err){
				res.redirect("/app");
				return;
			}
			res.render("app/imagenes/index", {imagenes: imagenes});
		});
	})
	.post(function(req, res){
		//console.log("ID Usuario: "+res.locals.user._id);
		console.log("Archivo INFO: "+req.files.archivo.path);
		var extension = req.files.archivo.name.split('.').pop();
		var data = {
			title: req.body.title,
			creator: res.locals.user._id,
			extension: extension
		}
		
		var imagen = new Imagen(data);
		
		imagen.save(function(err){
			if(!err){
				
				var imgJSON = {"id":imagen._id, "title": imagen.title, "extension": imagen.extension }
				
				client.publish("images",JSON.stringify(imgJSON));
				fs.rename(req.files.archivo.path, 'public/imagenes/'+imagen._id+'.'+extension,function(err){
					if(err)
						console.log(err);
				});
				res.redirect("/app/imagenes/"+imagen._id);
				//console.log(imagen);
			} else {
				res.render(err);
			}
		});
		
	});

module.exports = router;

