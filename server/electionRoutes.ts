
import express from "express"
import { state } from "./app";
import { startElection } from "./election";
const electionRouter = express.Router()
require("dotenv").config();

// Application ID, server ID
const APPID = process.env.APPID ? parseInt(process.env.APPID) : 0;

// Endpoint to handle election messages from other servers
electionRouter.post("/election", (req, res) => {
    console.log(`/election hit from `, req.body.senderID);
    const senderID = req.body.senderID;

    // If receive election message from server with a lower ID, then reply with a bully message
    if (senderID < APPID) {
        res.status(200).json({
            bully: true,
            senderID: APPID,
        });
        if (!state.running) {
            // If not currently running, then start a new election
            startElection();
        }
    }
});

// Endpoint to handle leader messages from other servers
electionRouter.post("/leader", (req, res) => {
    console.log(`/leader hit from `, req.body.senderID);
    const senderID = req.body.senderID;

    // Declare the sender as the leader
    // Quit the election
    state.leader = senderID;
    state.running = false;
    state.leaderFound = true;

    res.status(200).json({ success: true });
});

export default electionRouter;