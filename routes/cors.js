const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = ['https://home-puzzling-control.firebaseapp.com', 'https://home-puzzling.firebaseapp.com', 'https://www.homepuzzling.com',
			 'https://control.homepuzzling.com', 'https://server.homepuzzling.com'];
var corsOptionsDelegate = (req, callback) => {
    var corsOptions;

    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    }
    else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);
