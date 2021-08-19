var mongoose = require("mongoose");
var Schema = mongoose.Schema;

//Colleciones => tablas
//Documentos => filas
mongoose.connect("mongodb://localhost/fotos",{
  useNewUrlParser: true,
  useUnifiedTopology: true
});

/*
	Tipos de Datos: String, Number, Date, Buffer, Boolean, Mixed, Objectid, Array
*/

var posibles_valores = ["M", "F"];
var email_match = [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,"Coloca un email valido"];
var password_validation = {
	validator: function(p){
		return this.password_confirmation == p;
	},
	message: "Los passwords no son iguales"
};

var user_schema = new Schema({
	name: String,
	username: {type: String, required: true, maxlength: [50,"Username muy grande"]},
	password1: {type: String, required: true, minlength:[8, "Password muy corto"], validate: password_validation},
	age: {type: Number, min:[18, "La edad no puede ser menor de 18"], max:[100, "La edad no puede ser mayor de 100"]},
	email: {type: String, required: "El correo es obligatorio", match: email_match},
	date_of_birth: Date,
	sex: {type: String, enum:{values: posibles_valores, message: "Opción no válida"}}
});

//Virtuals: atributos no guardados en la DB
user_schema.virtual('password_confirmation').get(function(){ 
	return this.p_c;
}).set(function(pass){
	this.p_c = pass;
});

//Define el nombre de la collecione en plural, es decir, Users
var User = mongoose.model("User", user_schema);

module.exports.User = User;