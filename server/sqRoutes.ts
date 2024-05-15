import express from "express"
import { SQDelete, SQWrite } from "./sq";
import { deleteFromDB, insertToDatabase } from "./db";
require("dotenv").config();

const sqRouter = express.Router()
// Application ID, server ID
const APPID = process.env.APPID ? parseInt(process.env.APPID) : 0;

// Endpoint to handle SQ write
sqRouter.post("/write", (req, res) => {
    const username = req.body.username;
    const socketID = req.body.socketID;
    const serverID = req.body.serverID;
    console.log(`/write operation performed for `, username);
    console.log("reached ", socketID);

    insertToDatabase(username, socketID, serverID);

    console.log("Database write successful");

    res.status(200).json({ success: true });
});

// Endpoint to handle SQ write request
sqRouter.post("/sendRequest", (req, res) => {
    const username = req.body.username;
    const socketID = req.body.socketID;
    const serverID = req.body.serverID;
    console.log(`/sendRequest hit from `, req.body.username);
    console.log("reached ", socketID);

    SQWrite(username, socketID, serverID);
    // console.log("PRAM called again because I am not the leader");

    res.status(200).json({ success: true });
});

// Endpoint to handle SQ delete
sqRouter.post("/delete", (req, res) => {
    const socketID = req.body.socketID;
    console.log(`/delete operation performed for `, socketID);

    deleteFromDB(socketID);

    console.log("Database delete successful");

    res.status(200).json({ success: true });
});

// Endpoint to handle SQ delete request
sqRouter.post("/deleteRequest", (req, res) => {
    const socketID = req.body.socketID;
    console.log(`/deleteRequest hit`);

    SQDelete(socketID);
    // console.log("PRAM called again because I am not the leader");

    res.status(200).json({ success: true });
});

export default sqRouter;