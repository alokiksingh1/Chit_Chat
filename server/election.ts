import axios from "axios";
import { state } from "./app";
require("dotenv").config();
// Application ID, server ID
const APPID = process.env.APPID ? parseInt(process.env.APPID) : 0;


// Function to start the election
export function startElection() {
    state.running = true;

    // Base case to select the server that has the highest ID as the leader
    if (APPID === Math.max(...state.knownServers)) {
        console.log(`I AM THE GREATEST LEADER, AND WILL SEND LEADER TO EVERYONE`);
        state.leader = APPID;
        state.leaderFound = true;

        // Send leader message to all other servers
        for (const server of state.knownServers) {
            if (server !== APPID) {
                axios
                    .post(`http://localhost:${server}/leader`, {
                        senderID: APPID,
                    })
                    .then((res: any) => {
                        console.log(`res from leader message broadcast: `);
                    })
                    .catch((err: any) => {
                        console.error(`err from leader message broadcast: `);
                    });
            }
        }

        return;
    }

    // Send election message to all servers with higher IDs
    for (const serverId of state.knownServers.filter((id) => id > state.id)) {
        axios
            .post(
                `http://localhost:${serverId}/election`,
                {
                    senderID: APPID,
                },
                {
                    timeout: 5000,
                }
            )
            .then((res: any) => {
                // Bully is received
                console.log(`res from the bully received from: `, res.data);

                // Wait for T’ time units
                setTimeout(() => {
                    if (state.leader === -1) {
                        // Start a new election if no leader message was received
                        startElection();
                    } else {
                        // Quit election if leader message was received
                        console.log(`current leader: `, state.leader);
                        state.running = false;
                        return;
                    }
                }, 5000);
            })
            .catch((err: any) => {
                // No response received, ie. timeout from election message
                // Then declare myself as the leader, send leader message to all other servers
                console.log(`timeout reached for election message`);
                console.log(`Telling all other servers that I am now the leader`);
                state.leader = APPID;
                state.leaderFound = true;
                for (const server of state.knownServers) {
                    if (server !== APPID) {
                        axios
                            .post(`http://localhost:${server}/leader`, {
                                senderID: APPID,
                            })
                            .then((res: any) => {
                                console.log(`res from leader message broadcast: `);
                            })
                            .catch((err: any) => {
                                console.error(`err from leader message broadcast: `);
                            });
                    }
                }
            });
    }
}