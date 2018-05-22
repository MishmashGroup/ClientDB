import DB from "../src/DB";
import { mergeDeep } from "../src/MergeDeep";
import LocalStorageMock from "./mocks/LocalStorageMock";

global.localStorage = new LocalStorageMock;

describe("DB", () => {
    describe("constuctor", () =>{
        it("should initialize a database with the argument as initial data.", () => {
           let db = new DB({
                test: 1
            });

            expect(db.getData().test).toEqual(1);
        });

        it("should add handler argument as subscriber, if passed.", () => {
            const onDBUpdate = jest.fn();

            let db = new DB({
                test: 1
            }, onDBUpdate);
            
            db.mutate({ test: 123 });
            expect(onDBUpdate).toHaveBeenCalledTimes(1);
        });

        it("should call handler on connect", () => {
            const onDBUpdate = jest.fn();

            let db = new DB({
                test: 1
            });

            db.connect(onDBUpdate);
            
            expect(onDBUpdate).toHaveBeenCalled();
        });

        it("...unless second parameter is false.", () => {
            const onDBUpdate = jest.fn();

            let db = new DB({
                test: 1
            });

            db.connect(onDBUpdate, false);
            
            expect(onDBUpdate).not.toHaveBeenCalled();
        });
    });

    describe("connect", () => {
        it("should trigger function on update event.", () => {
            const onDBUpdate = jest.fn();
            let db = new DB();
            
            db.connect(onDBUpdate);
            db.mutate({ test: 123 });
            expect(onDBUpdate).toHaveBeenCalled();
        });

        it("should return data on connect.", () => {
            const onDBUpdate = jest.fn();
            let db = new DB({
                test: 1
            });
            
            let data = db.connect(onDBUpdate);
            expect(data.test).toEqual(1);
        });
    });

    describe("mutate", () => {
        it("should mutate the data.", () => {
            let db = new DB({
                test: 1
            });

            let vector = ({ test }) => ({ test: test + 1 });
            db.mutate(vector);
            expect(db.getData().test).toEqual(2);
        });

        it("should be able to mutate properties of an object in the data.", () => {
            let db = new DB({
                a: {
                    b: 0
                }
            });

            let vector = ({ b }) => ({ b: b + 1 });
            db.mutate(vector, "a");
            expect(db.getData().a.b).toEqual(1);
        });

        it("should be able to objects deep in the database", () => {
            let db = new DB({
                a: {
                    b: {
                        c: 0
                    }
                }
            });

            let vector = ({ c }) => ({ c: c + 1 });
            db.mutate(vector, "a.b");
            expect(db.getData().a.b.c).toEqual(1);
        });
    });

    describe("getData", () => {
        it("should get the whole database if no path is supplied.", () => {
            let db = new DB();
            db.mutate({ test: 123 });
            expect(db.getData()).toEqual({ test: 123 });
        });

        it("should be able to get data deep in the database (via path argument)", () => {
            let db = new DB({
                a: {
                    b: {
                        c: 0
                    }
                }
            });

            expect(db.getData("a.b")).toEqual({c:0});
            expect(db.getData("a.b.c")).toEqual(0);
        });

    });

    describe("save", () => {
        it("should remove DontSave properties from json'ified data", () => {

            class DontSave { };

            var json = JSON.stringify({ a: "10", b: { c: 10 }, f: { __proto__: DontSave, k: 100 } }, function (key, value) {
                if (value && value.__proto__ == DontSave) {
                    return undefined;
                }

                return value;
            });

            expect(json).toEqual('{"a":"10","b":{"c":10}}');
        });
    });

    describe("deepMerge", () => {
        it("should merge correctly on all levels", () => {

            var part0 = { a: 10, b: { bb: 22 } };
            var part1 = { c: 21, b: { dd: 30 } };
            
            var merged = mergeDeep(part0, part1);

            expect(JSON.stringify(merged)).toEqual('{"a":10,"b":{"bb":22,"dd":30},"c":21}');
        });
    });
});