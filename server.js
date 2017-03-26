//tutorial https://devcenter.heroku.com/articles/mean-apps-restful-api

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var LsRepository = require('./livestrong/repository');
var ObjectID = mongodb.ObjectID;

var app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

var db;
var livestrongRepository;
mongodb.MongoClient.connect(
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017',
    function(err, database) {
        if (err) {
            console.log(err);
            process.exit(1);
        }

        db = database;
        console.log('Database connection ready');

        var server = app.listen(process.env.PORT || 8080, function() {
            var port = server.address().port;
            console.log('App now running on port', port);
        });
        livestrongRepository = new LsRepository(db);
    }
);

function handleError(res, reason, message, code) {
    console.log('ERROR: ' + reason);
    res.status(code || 500).json({ error: message });
}

var EATERIES_COLLECTION = 'eateries';

app.get('/eallary/eateries', function(req, res) {
    db.collection(EATERIES_COLLECTION).find({}).toArray(function(err, docs) {
        if (err) {
            handleError(res, err.message, 'Failed to get eateries.');
        } else {
            res.status(200).json(docs);
        }
    });
});

app.get('/livestrong/exercises', function(req, res) {
    livestrongRepository.getAllExercises(
        err => {
            handleError(res, err.message, 'Failed to get exercises');
        },
        exercises => {
            var modifiedExercises = exercises.map(ex => {
                ex.url = req.headers.host + req.url + '/' + ex._id;
                return ex;
            });
            res.status(200).json(modifiedExercises);
        }
    );
});

app.post('/livestrong/exercises', function(req, res) {
    livestrongRepository.validateExercise(req.body, error => {
        handleError(res, error, error, 400);
    });
    livestrongRepository.createExercise(
        req.body,
        err => {
            handleError(res, err.message, 'Failed to create new exercise');
        },
        newExercise => {
            newExercise.url = req.headers.host + req.url + '/' + newExercise._id;
            res.status(201).json(newExercise);
        }
    );
});

app.delete('/livestrong/exercises/:id', function(req, res) {
    livestrongRepository.deleteExercise(
        req.params.id,
        error => {
            handleError(res, error.message, 'Failed to delete exercise');
        },
        result => {
            res.status(200).json(result);
        }
    );
});

app.put('/livestrong/exercises/:id', function(req, res) {
    livestrongRepository.updateExercise(
        req.params.id,
        req.body,
        error => {
            handleError(res, error.message, 'Failed to update exercise');
        },
        exercise => {
            res.status(200).json(exercise);
        }
    );
});
