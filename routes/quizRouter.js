const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
const quizRouter = express.Router();
quizRouter.use(bodyParser.json());
const multer = require('multer');

const Quizes = require('../models/quiz');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/summers');
    },

    filename: (req, file, cb) => {
        cb(null, Math.random() + file.originalname)
    }
});

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFileFilter});


quizRouter.route('/upload')
.options(cors.cors, (req, res) => { res.sendStatus(200); })
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file.filename);
})

quizRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Quizes.find(req.query)
    .then((quizes) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(quizes);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    Quizes.create(req.body)
    .then((quiz) => {
        console.log('quiz Created', quiz);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(quiz);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /quiz');
})

.delete(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    Quizes.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});



quizRouter.route('/:quizLink')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Quizes.findOne({"link": req.params.quizLink})
    .then((quiz) => {
        if(quiz != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(quiz);
        }
        else {
            err = new Error('quiz ' + req.params.quizLink + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /quiz/' + req.params.quizLink);
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Quizes.findOneAndUpdate({"link": req.params.quizLink}, {
        $set: req.body
    }, { new: true})
    .then((quiz) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(quiz);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.delete(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    Quizes.findOneAndRemove({"link": req.params.quizLink})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


quizRouter.route('/:quizLink/questions')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Quizes.findOne({"link": req.params.quizLink})
    .then((quiz) => {
        if (quiz != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(quiz.questions);
        }
        else {
            err = new Error('quiz ' + req.params.quizLink + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Quizes.findOneAndUpdate({"link": req.params.quizLink},
        { $inc: { questionsNum: 1 } },
        { new: true })
    .then((quiz) => {
        if (quiz != null) {
            quiz.questions.push(req.body);
            quiz.save()
            .then((quiz) => {
                Quizes.findById(quiz._id)
                .then((quiz) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(quiz);
                })
            }, (err) => next(err));
        }
        else {
            err = new Error('quiz ' + req.params.quizLink + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /quiz/' + req.params.quizLink + '/questions');
})

.delete(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    Quizes.findOne({"link": req.params.quizLink})
    .then((quiz) => {
        if (quiz != null) {
            for (var i = (quiz.questions.length -1); i >= 0; i--) {
                quiz.questions.id(quiz.questions[i]._id).remove();
            }
            quiz.save()
            .then((quiz) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(quiz);
            }, (err) => next(err));
        }
        else {
            err = new Error('quiz ' + req.params.quizLink + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});


quizRouter.route('/:quizLink/questions/:questionId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Quizes.findOne({"link": req.params.quizLink})
    .then((quiz) => {
        if (quiz != null && quiz.questions.id(req.params.questionId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(quiz.questions.id(req.params.questionId));
        }
        else if (quiz == null) {
            err = new Error('quiz ' + req.params.quizLink + ' not found ');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('quiz ' + req.params.questionId + ' not found ');
            err.status = 404;
            return next(err);  
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /quiz/' + req.params.quizLink
        + '/questions/' + req.params.questionId);
})

.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Quizes.findOne({"link": req.params.quizLink})
    .then((quiz) => {
        if (quiz != null && quiz.questions.id(req.params.questionId) != null) {
            if (req.body.question) {
                quiz.questions.id(req.params.questionId).question = req.body.question;
            }
            if (req.body.optionNum) {
                quiz.questions.id(req.params.questionId).optionNum = req.body.optionNum;
            }
            quiz.save()
            .then((quiz) => {
                Quizes.findById(quiz._id)
                .then((quiz) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(quiz);
                })
            }, (err) => next(err));
        }
        else if (quiz == null) {
            err = new Error('quiz ' + req.params.quizLink + ' not found ');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('question ' + req.params.questionId + ' not found ');
            err.status = 404;
            return next(err);  
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Quizes.findOneAndUpdate({"link": req.params.quizLink},
        { $inc: { questionsNum: -1 } },
        { new: true })
    .then((quiz) => {
        if (quiz != null && quiz.questions.id(req.params.questionId) != null) {
            quiz.questions.id(req.params.questionId).remove();
            quiz.save()
            .then((quiz) => {
                Quizes.findById(quiz._id)
                .then((quiz) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(quiz);
                })
            }, (err) => next(err));
        }
        else if (quiz == null) {
            err = new Error('quiz ' + req.params.quizLink + ' not found ');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('question ' + req.params.questionId + ' not found ');
            err.status = 404;
            return next(err);  
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});



quizRouter.route('/:quizLink/questions/:questionId/options')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Quizes.findOne({"link": req.params.quizLink})
    .then((quiz) => {
        if (quiz != null && quiz.questions.id(req.params.questionId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(quiz.questions.id(req.params.questionId).options);
        }
        else if (quiz == null) {
            err = new Error('quiz ' + req.params.quizLink + ' not found ');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('question ' + req.params.questionId + ' not found ');
            err.status = 404;
            return next(err);  
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Quizes.findOne({"link": req.params.quizLink})
    .then((quiz) => {
        if (quiz != null && quiz.questions.id(req.params.questionId) != null) {
            quiz.questions.id(req.params.questionId).options.push(req.body);
            quiz.save()
            .then((quiz) => {
                Quizes.findById(quiz._id)
                .then((quiz) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(quiz.questions.id(req.params.questionId).options);
                })
            }, (err) => next(err));
        }
        else if (quiz == null) {
            err = new Error('quiz ' + req.params.quizLink + ' not found ');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('question ' + req.params.questionId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /quiz/' + req.params.quizLink + '/questions/' + req.params.questionId + '/options');
})

.delete(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('Delete operation not supported on /quiz/' + req.params.quizLink + '/questions/' + req.params.questionId + '/options');
});

quizRouter.route('/:quizLink/questions/:questionId/options/:optionId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Quizes.findOne({"link": req.params.quizLink})
    .then((quiz) => {
        if (quiz != null && quiz.questions.id(req.params.questionId) != null && quiz.questions.id(req.params.questionId).options.id(req.params.optionId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(quiz.questions.id(req.params.questionId).options.id(req.params.optionId));
        }
        else if (quiz == null) {
            err = new Error('quiz ' + req.params.quizLink + ' not found ');
            err.status = 404;
            return next(err);
        }
        else if (quiz.questions.id(req.params.questionId) == null) {
            err = new Error('question ' + req.params.questionId + ' not found ');
            err.status = 404;
            return next(err);  
        }
        else {
            err = new Error('option ' + req.params.optionId + ' not found ');
            err.status = 404;
            return next(err);  
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('Get operation not supported on /quiz/' + req.params.quizLink + '/questions/' + req.params.questionId + '/options/' + req.params.optionId);
})

.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('Get operation not supported on /quiz/' + req.params.quizLink + '/questions/' + req.params.questionId + '/options/' + req.params.optionId);
})

.delete(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    Quizes.findOne({"link": req.params.quizLink})
    .then((quiz) => {
        if (quiz != null && quiz.questions.id(req.params.questionId) != null && quiz.questions.id(req.params.questionId).options.id(req.params.optionId) != null) {
            quiz.questions.id(req.params.questionId).options.id(req.params.optionId).remove();
            quiz.save()
            .then((quiz) => {
                Quizes.findById(quiz._id)
                .then((quiz) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(quiz.questions.id(req.params.questionId).options);
                })
            }, (err) => next(err));
        }
        else if (quiz == null) {
            err = new Error('quiz ' + req.params.quizLink + ' not found ');
            err.status = 404;
            return next(err);
        }
        else if (quiz.questions.id(req.params.questionId) == null) {
            err = new Error('question ' + req.params.questionId + ' not found ');
            err.status = 404;
            return next(err);  
        }
        else {
            err = new Error('option ' + req.params.optionId + ' not found ');
            err.status = 404;
            return next(err);  
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = quizRouter;