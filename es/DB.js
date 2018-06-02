"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = exports.DontSave = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _MergeDeep = require("./MergeDeep");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DontSave = exports.DontSave = function DontSave() {
    _classCallCheck(this, DontSave);
};

;

var DB = function DB(data) {
    var _this = this;

    var handler = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var loadFromStorageOnInit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

    _classCallCheck(this, DB);

    var _data = data || {};

    this.handlers = [];

    this.getData = function () {
        var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";


        var nodes = path.split(".");
        var root = _data;

        if (path !== "") {
            var node = root;

            for (var index = 0; index < nodes.length; index++) {
                node = node[nodes[index]];
            }

            return node;
        } else {
            return root;
        }
    };

    this.mutate = function (vector) {
        var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";


        var nodes = path.split(".");
        var root = _data;
        var newData = void 0;

        var obj = vector;
        if ((typeof vector === "undefined" ? "undefined" : _typeof(vector)) === "object") {
            vector = function vector() {
                return obj;
            };
        }

        if (path !== "") {
            var node = root;

            var prevNode = void 0;
            var prevName = void 0;

            for (var index = 0; index < nodes.length; index++) {
                prevNode = node;
                prevName = nodes[index];

                node = prevNode[prevName];
            }

            var vectorResult = vector(node);

            newData = prevNode[prevName] = (0, _MergeDeep.mergeDeep)(prevNode[prevName] || {}, node || {}, vectorResult || {});
        } else {

            var _vectorResult = vector(_data);

            newData = (0, _MergeDeep.mergeDeep)(data || {}, _vectorResult || {});

            _data = newData;
        }

        console.log((path === "" ? "root" : path) + ":", newData);

        _this._fireUpdateEvents(_data);
    };

    this.load = function () {
        var state = localStorage.getItem("state");

        if (state) {

            var parsedState = JSON.parse(state);

            _data = (0, _MergeDeep.mergeDeep)(_data, parsedState);
        }
    };

    this.save = function () {

        var json = JSON.stringify(_data, function (key, value) {
            if (value && value.__proto__ === DontSave) {
                return undefined;
            }

            return value;
        });

        localStorage.setItem("state", json);
    };

    this.connect = function (fn) {
        var callOnConnect = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        _this.handlers.push(fn);

        if (callOnConnect) {
            fn.call(_this, _data);
        }

        return _data;
    };

    this.disconnect = function (fn) {
        _this.handlers = _this.handlers.filter(function (item) {
            return item !== fn;
        });
    };

    this._fireUpdateEvents = function (o) {
        _this.handlers.forEach(function (item) {
            item.call(this, o);
        });
    };

    if (typeof handler === "function") {
        this.connect(handler, false);
    }

    if (loadFromStorageOnInit) {
        this.load();
    }
};

exports.default = DB;