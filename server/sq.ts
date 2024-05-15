import axios from "axios";
import { deleteFromDB, insertToDatabase } from "./db"
import { state } from "./app"
require("dotenv").config();

// Application ID, server ID
const APPID = process.env.APPID ? parseInt(process.env.APPID) : 0;

export function SQWrite(username: string, socketID: string, serverID: number) {
	console.log(`state.leader`, state.leader);
	console.log(`state.leaderfound`, state.leaderFound);
	console.log(`APPID`, APPID);

	if (APPID === state.leader && state.leaderFound === true) {
		// we want a function that first inserts the user to the database => insertToDatabase
		// we want to broadcast this to all the servers so that they write to their replicted databases as well
		console.log("I AM THE LEADER AND WILL WRITE TO MY LEADER DB");
		console.log(`username`, username);
		console.log(`socketid`, socketID);
		console.log(`serverID`, serverID);

		insertToDatabase(username, socketID, serverID);
		for (const server of state.knownServers) {
			if (server !== APPID) {
				axios
					.post(`http://localhost:${server}/write`, {
						username: username,
						socketID: socketID,
						serverID: serverID,
					})
					.then((res: any) => {
						console.log(`res from server ${server} while performing PRAM: `);
					})
					.catch((err: any) => {
						console.error(`err from server ${server} while performing PRAM: `);
					});
			}
		}
	}
	if (APPID !== state.leader && state.leaderFound === true) {
		axios
			.post(`http://localhost:${state.leader}/sendRequest`, {
				username: username,
				socketID: socketID,
				serverID: APPID,
			})
			.then((res: any) => {
				console.log(`res from leader while performing PRAM: `);
			})
			.catch((err: any) => {
				console.error(`err from leader while performing PRAM: `);
			});
	}
}

// run bully algorithm => user gets connected to the server/ websocket connection => database mapping insertToDatabase	(PRAM)

export function SQDelete(socketID: string) {
	console.log(`state.leader`, state.leader);
	console.log(`state.leaderfound`, state.leaderFound);
	console.log(`APPID`, APPID);

	if (APPID === state.leader && state.leaderFound === true) {
		// we want a function that first inserts the user to the database => insertToDatabase
		// we want to broadcast this to all the servers so that they write to their replicted databases as well
		console.log("I AM THE LEADER AND WILL DELETE FROM MY LEADER DB");
		console.log(`socketid`, socketID);

		deleteFromDB(socketID);
		for (const server of state.knownServers) {
			if (server !== APPID) {
				axios
					.post(`http://localhost:${server}/delete`, {
						socketID: socketID,
					})
					.then((res: any) => {
						console.log(
							`res from server ${server} while performing PRAMdelete: `
						);
					})
					.catch((err: any) => {
						console.error(
							`err from server ${server} while performing PRAMdelete: `
						);
					});
			}
		}
	}
	if (APPID !== state.leader && state.leaderFound === true) {
		axios
			.post(`http://localhost:${state.leader}/deleteRequest`, {
				socketID: socketID,
			})
			.then((res: any) => {
				console.log(`res from leader while performing PRAMdelete: `);
			})
			.catch((err: any) => {
				console.error(`err from leader while performing PRAMdelete: `);
			});
	}
}