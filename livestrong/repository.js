var mongodb = require('mongodb');

function Repository(db) {
    this.db = db;
    this.EXERCISE_COLLECTION = 'livestrong_exercises';
}

Repository.prototype.getAllExercises = function getAllExercises() {
    var query = this.db.collection(this.EXERCISE_COLLECTION).find({});
    return new Promise(function getAllExercisesPromise(resolve, reject) {
        query.toArray(function(error, docs) {
            if (error) {
                reject(error);
            }
            resolve(docs);
        });
    });
};

Repository.prototype.createExercise = function createExercise(exercise) {
    var collection = this.db.collection(this.EXERCISE_COLLECTION);
    return new Promise(function createExercisePromise(resolve, reject) {
        collection.insertOne(exercise, function(error, doc) {
            if (error) {
                reject(error);
            }
            resolve(doc.ops[0]);
        });
    });
};

Repository.prototype.getExercisesOfName = function getExercisesOfName(name) {
    var existingExercises = this.db.collection(this.EXERCISE_COLLECTION).find({ name: name });
    return new Promise(function getExercisesOfNamePromise(resolve, reject) {
        existingExercises.toArray(function(error, docs) {
            if (error) {
                reject(error);
            }
            resolve(docs);
        });
    });
};
Repository.prototype.validateExercise = function(exercise) {
    if (!exercise.name) {
        return 'Exercise name is missing';
    }
    return null;
};

Repository.prototype.deleteExercise = function(id, errorHandler, success) {
    var collection = this.db.collection(this.EXERCISE_COLLECTION);
    return new Promise((resolve, reject) => {
        collection.deleteOne(
            {
                _id: new mongodb.ObjectID(id)
            },
            function(error, result) {
                if (error) {
                    reject(error);
                }
                resolve(result);
            }
        );
    });
};

Repository.prototype.updateExercise = function(id, exercise, errorHandler, success) {
    delete exercise._id;
    var collection = this.db.collection(this.EXERCISE_COLLECTION);
    return new Promise((resolve, reject) => {
        collection.updateOne(
            {
                _id: new mongodb.ObjectID(id)
            },
            exercise,
            function(error, doc) {
                if (error) {
                    reject(error);
                }
                resolve(doc);
            }
        );
    });
};

module.exports = Repository;
