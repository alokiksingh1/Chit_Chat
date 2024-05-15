"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromDB = exports.findUserSocketInDatabase = exports.findUserServerInDatabase = exports.insertToDatabase = exports.retreiveDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
require("dotenv").config();
// Retrieve the application ID from environment variables
// const APPID = process.env.APPID;
const APPID = process.env.APPID ? parseInt(process.env.APPID) : 0;
const uri1 = process.env.MONGO_URI1;
const uri2 = process.env.MONGO_URI2;
const uri3 = process.env.MONGO_URI3;
let currentUri;
let currentConn = null;
let wasDown = false; //checking if the database was down
if (uri1 && uri2 && uri3) {
    // async function connect(){
    if (APPID !== undefined && APPID === 1111) {
        currentUri = uri1;
        try {
            currentConn = mongoose_1.default.createConnection(uri1);
            console.log("connected to MONGODB1");
        }
        catch (error) {
            console.error('Error connecting to MONGODB1', error);
        }
    }
    else if (APPID !== undefined && APPID === 2222) {
        currentUri = uri2;
        try {
            currentConn = mongoose_1.default.createConnection(uri2);
            console.log("connected to MONGODB2");
        }
        catch (error) {
            console.error('Error connecting to MONGODB1', error);
        }
    }
    else if (APPID !== undefined && APPID === 3333) {
        currentUri = uri3;
        try {
            currentConn = mongoose_1.default.createConnection(uri3);
            console.log("connected to MONGODB3");
        }
        catch (error) {
            console.error('Error connecting to MONGODB1', error);
        }
    }
}
const tableSchema = new Schema({
    username: { type: String },
    socketID: { type: String },
    serverID: { type: String },
});
let mappingTable;
if (currentConn) {
    mappingTable = currentConn.model('mappingTable', tableSchema);
    //  const currentModel = currentConn.model('mappingTable', tableSchema);
}
let checkDB = 0;
function retreiveDB(leaderURI) {
    return __awaiter(this, void 0, void 0, function* () {
        if (leaderURI && currentConn) {
            try {
                console.log("in try");
                const data = yield mappingTable.find();
                console.log("Query result:", data);
                if (wasDown) {
                    checkDB = 1; // Database was down but came back up now
                }
                wasDown = false;
            }
            catch (error) {
                console.error("ERROR while querying database:");
                if (!wasDown) {
                    checkDB = 0; // Database was up but is currently down
                }
                wasDown = true;
            }
            console.log("was down is ", wasDown);
            if (checkDB == 1) { // Only check if the database came back up
                const leaderConn = mongoose_1.default.createConnection(leaderURI);
                console.log('leader connection established.');
                try {
                    const leaderModel = leaderConn.model('mappingTable', tableSchema);
                    const data = yield leaderModel.find().lean();
                    console.log(data);
                    yield mappingTable.deleteMany({});
                    console.log("deleted");
                    yield mappingTable.insertMany(data);
                    console.log("inserted data ");
                    checkDB = 0;
                }
                catch (error) {
                    console.error('Error cloning collection:', error);
                    wasDown = true;
                }
                leaderConn.close()
                    .then(() => {
                    console.log('Disconnected from source database.');
                })
                    .catch(error => {
                    console.error('Error disconnecting from source database:', error);
                });
            }
        }
    });
}
exports.retreiveDB = retreiveDB;
function insertToDatabase(username, socketID, serverID) {
    const newMap = new mappingTable({
        username: username,
        socketID: socketID,
        serverID: serverID.toString(),
    });
    console.log("insertToDatabase reached ", socketID);
    newMap
        .save()
        .then((res) => {
        console.log(`res`, res);
    })
        .catch((err) => {
        wasDown = true;
    });
}
exports.insertToDatabase = insertToDatabase;
function findUserServerInDatabase(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = mappingTable.where({ username: username });
        try {
            const result = yield query.findOne();
            if (result) {
                console.log(result);
                console.log(`Found serverID: ${result.serverID}`);
                return result.serverID;
            }
        }
        catch (err) {
            console.error(err);
        }
    });
}
exports.findUserServerInDatabase = findUserServerInDatabase;
function findUserSocketInDatabase(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = mappingTable.where({ username: username });
        try {
            const result = yield query.findOne();
            if (result) {
                console.log(`Found socketID: ${result.socketID}`);
                return result.socketID;
            }
        }
        catch (err) {
            console.error(err);
        }
    });
}
exports.findUserSocketInDatabase = findUserSocketInDatabase;
function deleteFromDB(socketID) {
    return __awaiter(this, void 0, void 0, function* () {
        mappingTable
            .deleteMany({ socketID: socketID })
            .then((deletedDocument) => {
            if (deletedDocument) {
                console.log("Deleted document:", deletedDocument);
            }
            else {
                console.log("Document not found");
            }
        })
            .catch((err) => {
            console.error(`Error deleting many from db`, err);
            wasDown = true;
        });
    });
}
exports.deleteFromDB = deleteFromDB;
