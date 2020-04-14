const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const optionSchema = new Schema({
    option: {
        type: String,
        required: true
    },
    isAnswer: {
        type: Boolean,
        required: true,
        default: false
    },
},{
    timestamps: true
});

const questionSchema = new Schema({
    question: {
        type: String,
        required: true
    },
    questionTypeId: {
        type: Number,
        default: 1
    },
    optionNum: {
        type: Number,
        default: 4,
    },
    questionType: {
        id: {
            type: Number,
            default: 1,
        },
        name: {
            type: String,
            default: 'Multiple Choice',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    options: [optionSchema],
},{
    timestamps: true
});

const quizSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true,
        unique: true
    },
    autoMove: {
        type: Boolean,
        required: true,
        default: false
    },
    time: {
        type: Number,
        required: true,
    },
    questionsNum: {
        type: Number,
        default: 0
    },
    questions: [questionSchema],
},{
    timestamps: true
});

var Quizes = mongoose.model('quiz', quizSchema);

module.exports = Quizes;