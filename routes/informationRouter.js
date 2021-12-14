const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
var nodemailer = require('nodemailer');
const informationRouter = express.Router();
informationRouter.use(bodyParser.json());


const Information = require('../models/information');

informationRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Information.find(req.query)
    .then((informations) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(informations);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Information.create(req.body)
    .then((information) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(information);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /information');
})

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Information.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});



informationRouter.route('/:informationId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Information.findById(req.params.informationId)
    .then((information) => {
        if(information != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(information);
        }
        else {
            err = new Error('information ' + req.params.informationId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /information/' + req.params.informationId);
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Information.findByIdAndUpdate(req.params.informationId, {
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
    Information.findByIdAndRemove(req.params.informationId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = informationRouter;


