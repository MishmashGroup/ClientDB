import { mergeDeep } from "./MergeDeep";

export class DontSave { };

export default class DB {
    constructor(data, handler = null, loadFromStorageOnInit = true) {
        var _data = data || {};

        this.handlers = [];

        this.getData = (path = "") => {

            let nodes = path.split(".");
            let root = _data;
            
            if(path !== "") {
                let node = root;

                for (let index = 0; index < nodes.length; index++) {
                    node = node[nodes[index]];  
                }

                return node;
            } else {
                return root;
            }
        }

        this.mutate = (vector, path = "") => {
            
            let nodes = path.split(".");
            let root = _data;
            let newData;

            let obj = vector;
            if(typeof(vector) === "object") {
                vector = () => obj;
            }

            if(path !== "") {
                let node = root;

                let prevNode;
                let prevName;

                for (let index = 0; index < nodes.length; index++) {
                    prevNode = node;
                    prevName = nodes[index];

                    node = prevNode[prevName];  
                }

                let vectorResult = vector(node);

                newData = prevNode[prevName] = mergeDeep(prevNode[prevName] || {}, node || {}, vectorResult || {});
                
            } else {
                
                let vectorResult = vector(_data);

                newData = mergeDeep(data || {}, vectorResult || {});

                _data = newData;
            }

            console.log((path === "" ? "root" : path) + ":", newData);

            this._fireUpdateEvents(_data);
        }        

        this.load = () => {
            let state = localStorage.getItem("state");

            if (state) {

                let parsedState = JSON.parse(state);

                _data = mergeDeep(_data, parsedState);
            }
        }

        this.save = () => {

            var json = JSON.stringify(_data, function (key, value) {
                if (value && value.__proto__ === DontSave) {
                    return undefined;
                }

                return value;
            });
            
            localStorage.setItem("state", json);
        }

        this.connect = (fn, callOnConnect = true) => {
            this.handlers.push(fn);
            
            if(callOnConnect) {
                fn.call(this, _data)
            }

            return _data;
        };

        this.disconnect = (fn) => {
            this.handlers = this.handlers.filter(item => item !== fn);
        };

        this._fireUpdateEvents = (o) => {
            this.handlers.forEach(function (item) {
                item.call(this, o);
            });
        }

        if (typeof (handler) === "function") {
            this.connect(handler, false);
        }

        if(loadFromStorageOnInit) {
            this.load();
        }
    }
}