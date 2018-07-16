var express = require('express');
var router = express.Router();
var phantomjs = require('phantomjs-prebuilt');
var mongoose = require('mongoose');
var User = require('../models/User.js');
var CourseHistory = require('../models/CourseHistory.js');
var async = require('async');

/* GET ALL COURSE HISTORY */
router.get('/', function(req, res, next) {
  CourseHistory.find(function (err, products) {
    if (err) return next(err);
    res.json(products);
  });
});

router.get('/:id', function(req, res, next) {
    CourseHistory.find({_userId:req.params.id},function (err, products) {
      if (err) return next(err);
      res.json(products);
    });
  });

// Course History Scrape
router.get('/scrape/ch', function (req, res) {
// execute the course history scrape script
    var program = phantomjs.exec('courseHistoryScrape.js','your_username','your_password');
    program.stdout.pipe(process.stdout);
    program.stderr.pipe(process.stderr);
// on getting result
    program.stdout.on('data', function (data) {
// turn the retrieved result from buffer to json
        var buff = new Buffer(data).toString();
        var result  = JSON.parse(buff);
// to check if the user's course history has already been scraped or updated before
        User.findOne({ email: "your_email" }, function (err, user) {
            async.forEach(result.results[0], function forAllCourses(key, callback) {
                CourseHistory.findOne({ course: key.Course, description: key.Description, term: key.Term }, function (err, history){
// if already have records, check if previous grades and status are empty, if yes and there are new data, update them
                    if (history) {
                        if (history.grade !== key.Grade && history.status !== key.Status) {
                            history.grade = key.Grade;
                            history.status = key.Status;
                            history.save(function (err) {
                                if (err) { return res.status(500).send({ msg: err.message }); }
                            });
                        }
                    } else {
// create new course history row if this user has not been scraped before
                        history = new CourseHistory({ _userId: user._id, course: key.Course, description: key.Description,
                            term: key.Term, grade: key.Grade, units: key.Units,
                            status: key.Status });
                        history.save(function (err) {
                            if (err) { return res.status(500).send({ msg: err.message }); }
                        });
                    }
                    callback();
                });
            });
        });
    });
// print success status when program exit
    program.on('exit', code => {
        res.status(200).send("Successfully retrieved course history.");
    });
});

module.exports = router;