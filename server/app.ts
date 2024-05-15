import express from "express";
import axios from "axios";
import { createServer } from "http";
import {
	findUserServerInDatabase,
	findUserSocketInDatabase,
} from "./db";
import { SQDelete, SQWrite } from "./sq"
import { Server } from "socket.io";
import cors from "cors";
import { createClient } from "redis";
import sqRouter from "./sqRoutes";
import electionRouter from "./electionRoutes";
import { startElection } from "./election";
require("dotenv").config();

// Application ID, server ID
const APPID = process.env.APPID ? parseInt(process.env.APPID) : 0;

export interface ServerState {
	id: number;
	knownServers: number[];
	leader: number;
	running: boolean;
	leaderFound: boolean;
}

export let state: ServerState = {
	id: APPID, // Server ID
	knownServers: [1111, 2222, 3333], // IDs of all servers in the system
	leader: -1, // Initialize leader to be -1
	running: false,
	leaderFound: false,
};



// Initialize Express application
const app = express();
let corsOptions = {
	origin: ["http://localhost:3000", "http://localhost:8080"],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use("/", sqRouter)
app.use("/", electionRouter)

// Create an HTTP socket.io server using the Express app
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});


// Create redis client for subscriber and publisher
const subscriber = createClient({
	password: process.env.REDIS_DB_PASSWORD,
	socket: {
		host: "redis-14801.c323.us-east-1-2.ec2.cloud.redislabs.com",
		port: 14801,
	},
});
const publisher = createClient({
	password: process.env.REDIS_DB_PASSWORD,
	socket: {
		host: "redis-14801.c323.us-east-1-2.ec2.cloud.redislabs.com",
		port: 14801,
	},
});

// Connect the subscriber and publisher client to redis cloud
subscriber.connect();
publisher.connect();

type IncomingMessage = {
	username1: string;
	username2: string;
	content: string;
	messageId: number;
};

// Subscribe to the topic channel
// Event listener for handling receiving messages on the subscribed channel
subscriber.subscribe(`topic-${APPID}`, async (message, channel) => {
	const incomingMessage: IncomingMessage = JSON.parse(message);
	console.log(`Received message on server ${APPID}`);
	console.log(incomingMessage);
	console.log(`channel: `, channel);

	// Find sockets currently connected to the server
	const currentSockets = await io.fetchSockets();

	// Find which socket we need to use from the target username in the incomming message
	const userSocketID = await findUserSocketInDatabase(
		incomingMessage.username2
	);
	const userSocket = currentSockets.find(
		(socket) => socket.id === userSocketID
	);
	userSocket?.emit("receiveMessage", message);
});

// Event listener for WebSocket connection requests
io.on("connection", (socket) => {
	console.log(`User connected: `, socket.id);

	// Write to the new user-server mapping table to the DB
	socket.on("username", (username) => {
		SQWrite(username, socket.id, APPID);
	});

	// Event listener for receiving messages from the WebSocket client
	socket.on("message", async (message) => {
		// Find target server using the user-server mapping table 
		const SERVER_TO_SEND_TO = await findUserServerInDatabase(message.username2);
		console.log(`User ${socket.id} messaged: `, message);
		console.log(`Received message "${message.content}" on server ${APPID}`);
		console.log(
			`Sending message "${message.content}" to server ${SERVER_TO_SEND_TO}`
		);

		// Send to the target server's redis message queue topic
		publisher.publish(`topic-${SERVER_TO_SEND_TO}`, JSON.stringify(message));
	});

	// Event listener for sockets that have disconnected
	socket.on("disconnect", (reason, description) => {
		console.log(`User disconnected from server`, socket.id);
		console.log(`disconnect desc `, description);

		// Remove the user server mapping entry from the table
		SQDelete(socket.id);
	});
});


app.get("/leader-heartbeat", (req, res) => {
	res.status(200).end();
});


// Start election if specified in the "willStart" env variable
if (process.env.willStart) {
	if (parseInt(process.env.willStart) === 1) {
		setTimeout(() => {
			startElection();
			console.log("Election Done \n");
		}, 2000);
	}
}

// Set heartbeat check for every 10s on the leader server
setInterval(() => {
	// If there is a current leader, ping the leader for heartbeat
	if (state.leader !== -1) {
		axios
			.get(`http://localhost:${state.leader}/leader-heartbeat`, {
				timeout: 5000,
			})
			.then((res) => {
				// console.log(`Leader server is still up`);
			})
			.catch((err) => {
				console.log(`Leader server is dead`);
				console.log(`Starting new election`);
				startElection();
			});
	}
}, 10000);

// Start the HTTP server on port APPID
httpServer.listen(APPID, () =>
	console.log(`Server listening on port ${APPID}`)
);