"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const db_1 = require("../server/db");
require('dotenv').config();
// Access environment variables
const db1 = process.env.MONGO_URI1;
const db2 = process.env.MONGO_URI2;
const db3 = process.env.MONGO_URI3;
const leaderUri = 0;
const myMapL = {};
myMapL[1] = false;
myMapL[2] = false;
myMapL[3] = false;
let collection1111, collection2222, collection3333;
const connection1 = mongoose.createConnection(db1, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
connection1.on('open', () => {
    console.log('Connected to MongoDB1');
    const db = connection1.db;
    collection1111 = db.collection('mappingtables');
    // Perform operations with collection1111
});
connection1.on('error', (error) => {
    console.error('Error connecting to MongoDB1:', error);
});
// Connect to the second database
const connection2 = mongoose.createConnection(db2, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
connection2.on('open', () => {
    console.log('Connected to MongoDB2');
    const db = connection2.db;
    collection2222 = db.collection('mappingtables');
});
connection2.on('error', (error) => {
    console.error('Error connecting to MongoDB2:', error);
});
const connection3 = mongoose.createConnection(db3, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
connection3.on('open', () => {
    console.log('Connected to MongoDB3');
    const db = connection3.db;
    collection3333 = db.collection('mappingtables');
});
connection3.on('error', (error) => {
    console.error('Error connecting to MongoDB3:', error);
});
const logFilePath = '/Users/tenzindorjee/Documents/GitHub/CPSC559_Proj/proxy/haproxy.log';
// Global set to store unique numbers
const uniqueServers = new Set();
// Function to extract the number 5 characters before "DOWN" and add it to the set
function extractNumber(line) {
    const upIndex = line.indexOf("succeeded");
    const downIndex = line.indexOf('is DOWN');
    if (downIndex !== -1 && downIndex >= 2) {
        const numberStr = line.substring(downIndex - 2, downIndex);
        const number = parseInt(numberStr);
        if (!isNaN(number)) {
            handleLeaderDown(number);
            uniqueServers.add(number);
        }
    }
    if (upIndex !== -1 && upIndex >= 2) {
        const numberStr = line.substring(upIndex - 2, upIndex);
        const number = parseInt(numberStr);
        if (!isNaN(number)) {
            handleLeaderUp(number);
            uniqueServers.delete(number);
        }
    }
}
function handleLeaderUp(number) {
    if (number === 1) {
        myMapL[1] = true;
    }
    else if (number === 2) {
        myMapL[2] = true;
    }
    else if (number === 3) {
        myMapL[3] = true;
    }
}
function handleLeaderDown(number) {
    if (number === 1) {
        myMapL[1] = false;
    }
    else if (number === 2) {
        myMapL[2] = false;
    }
    else if (number === 3) {
        myMapL[3] = false;
    }
}
let maxKeyWithTrueValue = 0; // Declare outside the function
function checkFile() {
    console.log("Checking file...");
    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        const lines = data.split('\n');
        for (const line of lines) {
            extractNumber(line);
            console.log('Unique numbers:', Array.from(uniqueServers));
        }
        removeFromDB();
        // No need to declare maxKeyWithTrueValue here
        // You can directly modify the global variable
        for (const key in myMapL) {
            if (myMapL[key] === true) {
                maxKeyWithTrueValue = Math.max(maxKeyWithTrueValue, parseInt(key));
            }
        }
        console.log("leader is: ", maxKeyWithTrueValue);
    });
}
// Call the checkFile function initially
checkFile();
// Set up a setInterval to call checkFile every 3 seconds
setInterval(checkFile, 3000);
function removeFromDB() {
    console.log("fsdjkflsdjflksdjflksjfldsk");
    // Loop through unique servers
    for (const servers of uniqueServers) {
        console.log(servers);
        if (servers == 1) {
            collection1111.deleteMany({ serverID: "1111" })
                .then((result) => {
                console.log(`${result.deletedCount} document(s) removed from db 1 SERV:1111`);
            })
                .catch((error) => {
                console.error('Error removing documents:', error);
            });
            collection2222.deleteMany({ serverID: "1111" })
                .then((result) => {
                console.log(`${result.deletedCount} document(s) removed from db 2 SERV:1111`);
            })
                .catch((error) => {
                console.error('Error removing documents:', error);
            });
            collection3333.deleteMany({ serverID: "1111" })
                .then((result) => {
                console.log(`${result.deletedCount} document(s) removed from db 3 SERV:1111`);
            })
                .catch((error) => {
                console.error('Error removing documents:', error);
            });
        }
        if (servers == 2) {
            collection1111.deleteMany({ serverID: "2222" })
                .then((result) => {
                console.log(`${result.deletedCount} document(s) removed from db 1 SERV:2222`);
            })
                .catch((error) => {
                console.error('Error removing documents:', error);
            });
            collection2222.deleteMany({ serverID: "2222" })
                .then((result) => {
                console.log(`${result.deletedCount} document(s) removed from db 2 SERV:2222`);
            })
                .catch((error) => {
                console.error('Error removing documents:', error);
            });
            collection3333.deleteMany({ serverID: "2222" })
                .then((result) => {
                console.log(`${result.deletedCount} document(s) removed from db 3 SERV:2222`);
            })
                .catch((error) => {
                console.error('Error removing documents:', error);
            });
        }
        if (servers == 3) {
            collection1111.deleteMany({ serverID: "3333" })
                .then((result) => {
                console.log(`${result.deletedCount} document(s) removed from db 1 SERV:3333`);
            })
                .catch((error) => {
                console.error('Error removing documents:', error);
            });
            collection2222.deleteMany({ serverID: "3333" })
                .then((result) => {
                console.log(`${result.deletedCount} document(s) removed from db 2 SERV:3333`);
            })
                .catch((error) => {
                console.error('Error removing documents:', error);
            });
            collection3333.deleteMany({ serverID: "3333" })
                .then((result) => {
                console.log(`${result.deletedCount} document(s) removed from db 3 SERV:3333`);
            })
                .catch((error) => {
                console.error('Error removing documents:', error);
            });
        }
    }
}
setInterval(() => {
    if (db1 && db2 && db3) {
        console.log(`checking before`);
        if (maxKeyWithTrueValue === 1) {
            (0, db_1.retreiveDB)(db1);
        }
        else if (maxKeyWithTrueValue === 2) {
            (0, db_1.retreiveDB)(db2);
        }
        else if (maxKeyWithTrueValue === 3) {
            (0, db_1.retreiveDB)(db3);
        }
        console.log(`after`);
        // console.log(`current dbQueue before processing`, dbQueue);
        // processQueue();
        // console.log(`current dbQueue after processing`, dbQueue);
    }
}, 10000);
