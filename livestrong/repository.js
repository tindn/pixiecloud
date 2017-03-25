var mongodb = require('mongodb');

var repository = function(db) {
    this.db = db;
    this.EXERCISE_COLLECTION = 'livestrong_exercises';
};

repository.prototype.getAllExercises = function(errororHandler, success) {
    this.db.collection(this.EXERCISE_COLLECTION).find({}).toArray(function(error, docs) {
        if (error) {
            errororHandler(error);
        } else {
            success(docs);
        }
    });
};

repository.prototype.createExercise = function(exercise, errororHandler, success) {
    this.db
        .collection(this.EXERCISE_COLLECTION)
        .find({ name: exercise.name })
        .toArray(function(error, docs) {
            if (error) {
                errororHandler(error);
            }
            if (docs.length == 0) {
                this.db
                    .collection(this.EXERCISE_COLLECTION)
                    .insertOne(exercise, function(error, doc) {
                        if (error) {
                            errororHandler(error);
                        } else {
                            success(doc.ops[0]);
                        }
                    });
            } else {
                success(docs[0]);
            }
        });
};

repository.prototype.validateExercise = function(exercise, invalid) {
    if (!exercise.name) {
        invalid('Exercise name is missing');
    }
};

repository.prototype.deleteExercise = function(id, errorHandler, success) {
    this.db.collection(this.EXERCISE_COLLECTION).deleteOne({
        _id: new mongodb.ObjectID(id)
    }, function(error, result) {
        if (error) {
            errorHandler(error);
        } else {
            success(result);
        }
    });
};

repository.prototype.updateExercise = function(id, exercise, errorHandler, success) {
    delete exercise._id;
    this.db.collection(this.EXERCISE_COLLECTION).updateOne({
        _id: new mongodb.ObjectID(id)
    }, exercise, function(error, doc) {
        if (error) {
            errorHandler(error);
        } else {
            success(doc);
        }
    });
};

module.exports.repository = repository;
