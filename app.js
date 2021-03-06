var express = require("express");
var bodyParser = require("body-parser");
var User = require("./models/user").User;
var session = require("express-session");
//var cookieSession = require("cookie-session");
var router_app = require("./router_app");
var session_middleware = require("./middlewares/session");
var methodOverride =  require("method-override");
var formidable = require("express-form-data");
const redis = require('redis');
var redisClient = redis.createClient();
var RedisStore = require("connect-redis")(session);
var http = require("http");
var realtime = require("./realtime");

var app = express();

var server = http.Server(app);
var sessionMiddleware = session({
	store: new RedisStore({ host: 'localhost', port: 6379, client: redisClient, ttl: 86400 }),
	secret: "super ultra secrect word"
});
realtime(server, sessionMiddleware);

//app.use(express.static('public')); //Sin dominio
app.use("/public",express.static('public')); //Con dominio public
app.use(bodyParser.json()); //Para peticion application/json
app.use(bodyParser.urlencoded({extended : true}));
/*
app.use(session({
	secret: "dasdhkjadiedjlkdd", //Token unico
	resave: false, //La sesion no se guarda si se modifica 
	saveUninitialized: false, //La sesion no se guarda si no se inicializad
}));
*/

app.use(sessionMiddleware);

app.use(methodOverride("_method"));

/*
app.use(cookieSession({
	name: "session",
	keys: ["llave1","llave2"]
}));
*/

app.use(formidable.parse({keepExtensions: true}));

app.set("view engine", "jade");

app.get("/", function(req, res){
	console.log(req.session.user_id)
	res.render("index");
});

app.get("/signup", function(req, res){
	User.find(function(err, doc){
		console.log(doc);
		res.render("signup");
	});
	
});

app.get("/login", function(req, res){
	res.render("login");
	
});

app.post("/users", function(req, res){
	console.log("User: "+req.body.email);
	console.log("Contraseņa: "+req.body.password);
	//res.send("Recibimos tus datos tus datos.");
	
	var user = new User({email: req.body.email, 
							password1: req.body.password,
							password_confirmation: req.body.password_confirmation,
							username: req.body.username});
							
	console.log("Password Confirmation: "+user.password_confirmation);
	/*Funcion Callback
	user.save(function(err,user,numero){
		if(err){
			console.log(String(err));
		}
		res.send("Guardamos tus datos exitosamente.");
	});
	*/
	
	//Utilizar promises para guardar
	user.save().then(function(us){
		res.send("Guardamos tus datos exitosamente.");
	}, function(err){
		if(err){
			console.log(String(err));
			res.send("No pidemos guardar la información.");
		}		
	});
	
});

app.post("/sessions", function(req, res){
	
	/*
	User.find({email:req.body.email,password1: req.body.password},function(err, docs){
		console.log(docs);
		res.send("Hola Mundo");
	});
	
	User.findById(60e76432ad3e501524e7ccfd, function(err, doc){
		console.log(docs);
		res.send("Hola Mundo");
	});
	*/
	
	User.findOne({email:req.body.email,password1: req.body.password},function(err, user){
		//console.log(user);
		//res.send("Hola Mundo");
		req.session.user_id = user._id;
		res.redirect("/app");
	});
	
	
});

app.use("/app", session_middleware);
app.use("/app", router_app);

server.listen(3500);