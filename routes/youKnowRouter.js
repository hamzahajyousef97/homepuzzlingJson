const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
var nodemailer = require('nodemailer');
const youKnowRouter = express.Router();
youKnowRouter.use(bodyParser.json());


const YouKnow = require('../models/youKnow');

youKnowRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    YouKnow.find(req.query)
    .then((youKnows) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(youKnows);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    YouKnow.create(req.body)
    .then((youKnow) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(youKnow);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /youKnow');
})

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    YouKnow.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});



youKnowRouter.route('/:youKnowId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    YouKnow.findById(req.params.youKnowId)
    .then((youKnow) => {
        if(youKnow != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(youKnow);
        }
        else {
            err = new Error('youKnow ' + req.params.youKnowId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /youKnow/' + req.params.youKnowId);
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    YouKnow.findByIdAndUpdate(req.params.youKnowId, {
        $set: req.body
    }, { new: true})
    .then((quiz) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(quiz);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    YouKnow.findByIdAndRemove(req.params.youKnowId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = youKnowRouter;


