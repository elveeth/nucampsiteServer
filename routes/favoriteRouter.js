const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');
const { request } = require('express');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
    .populate('favorite.user')
    .populate('favorite.campsites')
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id })
        .then(favorite => {
            if (favorite) {
                // request body will have campsites desired to be posted/added to the favorites document in the db
                // loop through req.body and for each campsite check if it's inside the existing document favorite.campsites
                req.body.forEach(reqFav => {
                     // if it is not in the document, add or push it into it
                    if (!favorite.campsites.includes(reqFav._id)) {
                        favorite.campsites.push(reqFav._id)
                    }
                });
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite)
                })
                .catch(err => next(err));
            } else {
                Favorite.create({user: req.user._id })
                    .then(favorite => {
                        const reqFavsToAdd = req.body
                        reqFavsToAdd.forEach(reqFav => {
                            if (!favorite.campsites.includes(reqFav._id)) {
                                favorite.campsites.push(reqFav._id)
                            }
                        });
                        favorite.save()
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite)
                        })
                        .catch(err => next(err));
                    })
                    .catch(err => next(err));
            }
        })
        .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT request not supported!');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({user: req.user._id })
    .then(response => {
        res.statusCode = 200;
        if (favorite) {
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        } else {
            res.setHeader('Content-Type', 'text/plain');
            res.end('You do not have any favorites to delete');
        }
    })
    .catch(err => next(err));
})

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET request not supported!');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id })
    .then(favorite => {
        if (favorite) {
            req.body.forEach(reqFav => {
                if (!favorite.campsites.includes(reqFav._id)) {
                    favorite.campsites.push(reqFav._id)
                }
            });
            favorite.save()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite)
            })
            .catch(err => next(err));
        } else {
            res.setHeader('Content-Type', 'text/plain');
            res.end('That campsite is already in the list of favorites!');
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT request not supported!');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id })
        .then (favorite => {
        if (favorite) {
            favorite.campsites.filter((reqFav) => {
                return (!reqFav)
            })
        } else {
            res.setHeader('Content-Type', 'text/plain');
            res.end('There are no favorites to delete!');
        }
    })
})

module.exports = favoriteRouter;