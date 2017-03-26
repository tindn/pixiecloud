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
// app.use(function(req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     next();
// });

var db;
var livestrongRepository;
mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, database) {
    if (err) {
        console.log(err);
        process.exit(1);
    }

    db = database;
    console.log('Database connection ready');

    var server = app.listen(process.env.PORT, function() {
        var port = server.address().port;
        console.log('App now running on port', port);
    });
    livestrongRepository = new LsRepository(db);
});

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
    livestrongRepository
        .getAllExercises()
        .then(exercises => {
            var modifiedExercises = exercises.map(ex => {
                return restifyExercise(ex, req);
            });
            res.status(200).json(modifiedExercises);
        })
        .catch(error => {
            handleError(res, error.message, 'Failed to get exercises');
        });
});

app.post('/livestrong/exercises', function(req, res) {
    var validationError = livestrongRepository.validateExercise(req.body);
    if (validationError) {
        handleError(res, validationError, validationError, 400);
        return;
    }

    livestrongRepository.getExercisesOfName(req.body.name).then(docs => {
        if (docs.length > 0) {
            res.status(400).json({
                error: 'Exercises of the name ' + req.body.name + ' exists',
                exercises: docs.map(doc => {
                    return restifyExercise(doc, req);
                })
            });
            return;
        }
        livestrongRepository
            .createExercise(req.body)
            .then(newExercise => {
                res.status(201).json(restifyExercise(newExercise, req));
            })
            .catch(err => {
                handleError(res, err.message, 'Failed to create new exercise');
            });
    });
});

app.delete('/livestrong/exercises/:id', function(req, res) {
    livestrongRepository
        .deleteExercise(req.params.id)
        .then(result => {
            res.status(200).json(result);
        })
        .catch(error => {
            handleError(res, error.message, 'Failed to delete exercise');
        });
});

app.put('/livestrong/exercises/:id', function(req, res) {
    livestrongRepository
        .updateExercise(req.params.id, req.body)
        .then(exercise => {
            res.status(200).json(exercise);
        })
        .catch(error => {
            handleError(res, error.message, 'Failed to update exercise');
        });
});

function restifyExercise(exercise, req) {
    return Object.assign({}, exercise, { url: req.headers.host + req.url + '/' + exercise._id });
}
