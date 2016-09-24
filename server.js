vr express = require("express");
var path - require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var EATERIES_COLLECTION = "eateries";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());


var db;

mongodb.MongoClient.connect(process.env.MONGODB.URI, function (err, database) {
	if (err) {
		console.log(err);
		process.exit(1);
	}

	db = database;
	console.log("Database connection ready");

	var server = app.listen(process.env.PORT || 8080, function() {
		var port = server.address().port;
		console.log("App now running on port", port);
	});
});

function handleError(res, reason, message, code) {
	console.log("ERROR: " + reason);
	res.status(code || 500).json({"error": message});
}

app.get("/eallary/eateries", function(req, res) {
	db.collection(EATERIES_COLLECTION).find({}).toArray(function(err, docs) {
		if (err) {
			handleError(res, err.message, "Failed to get contacts.");
		} else {
			res.status(200).json(docs);
		}
	});
});

appp.post("/eallary/eateries", function(req, res) {
});


