var express 	= 	require("express"),
	app			= 	express(), 
	cons 		=	require("consolidate"), 
	puerto 		= 	8081, 
	bodyParser 	= 	require('body-parser'), 
	MongoClient = 	require("mongodb").MongoClient, coleccion;

//Conectarse a la base de datos de MngoDB, cambiar base de datos...
MongoClient.connect("mongodb://127.0.0.1:27017/test", function(err, database)
{
	if(err) throw err;
	coleccion = database.collection("comentario");
	app.listen(puerto);
	console.log("Express server iniciado en el " + puerto);	
});
//consolidate integra swig con express...
app.engine("html", cons.swig); //Template engine...
app.set("view engine", "html");
app.set("views", __dirname + "/vistas");
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res)
{
	res.render("index", {
		titulo 	:  	"Sistema comentarios"
	});
});

app.post('/create', function (req, res)
{
	var data = req.body;
	coleccion.count(function(err, count)
	{
		data.idcomentario = count + 1;
		data.like = 0;
		coleccion.insert(data, function(err, records)
		{
			res.json({status : true});
		});
	});
});

app.get("/updateLike/:id", function(req, res)
{
	var query = {idcomentario : Number(req.param("id"))};
	var incrementa = {$inc : {"like" : 1}};
	coleccion.update(query, incrementa, function(err, actualiza)
	{
		var cursor = coleccion.find(query, {"_id" : false, "like" : true});
		cursor.toArray(function(err, doc)
		{
			res.json(doc);
		});
	});
});
app.get("/getAllMensaje", function(req, res)
{
	var cursor = coleccion.find({});
	cursor.toArray(function(err, doc)
	{
		if(err)
		{
			throw err;
		}
		res.json(doc);
	});
});


//Para cualquier url que no cumpla la condición...
app.get("*", function(req, res)
{
	res.status(404).send("Página no encontrada :( en el momento");
});