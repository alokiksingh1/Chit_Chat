import mongoose, { Model } from "mongoose";
const { Schema } = mongoose;

require("dotenv").config();

// Retrieve the application ID from environment variables
const APPID = process.env.APPID ? parseInt(process.env.APPID) : 0;
const uri1 = process.env.MONGO_URI1;
const uri2 = process.env.MONGO_URI2;
const uri3 = process.env.MONGO_URI3;
let currentUri:string;
let currentConn:mongoose.Connection |null =  null;
//boolean to determine if database was down
let wasDown=false;	

//mapping the mongoDB URI based on the current server APPID
if (uri1 && uri2 && uri3) {
	if (APPID !== undefined && APPID === 1111) {
		currentUri=uri1;
		try{
			currentConn=mongoose.createConnection(uri1)
			console.log("connected to MONGODB1")
		}catch(error){
			console.error('Error connecting to MONGODB1', error);
		}		
			
	} else if (APPID !== undefined && APPID === 2222) {
		currentUri=uri2;
		try{
			currentConn=mongoose.createConnection(uri2)
			console.log("connected to MONGODB2")

		}catch(error){
			console.error('Error connecting to MONGODB1', error);
		}	
	} else if (APPID !== undefined && APPID === 3333) {
		currentUri=uri3;
		try{
			currentConn=mongoose.createConnection(uri3)
			console.log("connected to MONGODB3")

		}catch(error){
			console.error('Error connecting to MONGODB1', error);
		}	
	}
}


const tableSchema = new Schema({
	username: { type: String },
	socketID: { type: String },
	serverID: { type: String },
});

//creating a customized document for mappingTable model
interface MappingTableDocument extends mongoose.Document {
    username: string;
    socketID: string;
    serverID: string;
}
	

	let mappingTable: Model<MappingTableDocument>;
	
	if(currentConn){
		mappingTable = currentConn.model<MappingTableDocument>('mappingTable', tableSchema);
	}


let checkDB=0;

export async function retreiveDB(leaderURI: string){
	if (leaderURI && currentConn) {
        try {
            const data = await mappingTable.find();
			//printing out the data we found in the database
            console.log("Query result:", data);			
			// Database was down but came back up now
            if (wasDown) {
                checkDB = 1;
            }
            wasDown = false;
        } catch (error) {
            console.error("ERROR while querying database:");
			// Database was up but is currently down
            if (!wasDown) {	
                checkDB = 0; 
            }
            wasDown = true;
        }
        if (checkDB == 1) { // Only check if the database came back up
            const leaderConn = mongoose.createConnection(leaderURI);
            console.log('leader connection established.');
            try {
				//retreiving the collection from the leader mapping table
                const leaderModel = leaderConn.model('mappingTable', tableSchema);
                const data = await leaderModel.find().lean();
                console.log(data);
				//deleting current servers collection so we dont have outdated information
                await mappingTable.deleteMany({});
                console.log("deleted collection in current server");
				//inserting the data retrieved from the leader database to current server database
                await mappingTable.insertMany(data);
                console.log("inserted data into current server");
                checkDB = 0;
            } catch (error) {
                console.error('Error cloning collection:', error);
                wasDown = true;
            }
			//closing the leader database connection
            leaderConn.close()
                .then(() => {
                    console.log('Disconnected from source database.');
                })
                .catch(error => {
                    console.error('Error disconnecting from source database:', error);
                });
        }
    }
}

//This function inserts the user to the database which acts as a user serving mapping table
export function insertToDatabase(
	username: string,
	socketID: string,
	serverID: number
) {
	//inputting the parameters received into our mapping table model
	const newMap = new mappingTable({
		username: username,
		socketID: socketID,
		serverID: serverID.toString(),
	});
	console.log("insertToDatabase reached ", socketID);
	//inserting this document into our database collection
		newMap
			.save()
			.then((res: any) => {
				console.log(`res`, res);
			})
			.catch((err: any) => {
				wasDown=true;

			});	
}

//This function finds the user in the database and retreives its server ID
export async function findUserServerInDatabase(username: string) {
	//querying to find a document to find a specific username 
	const query = mappingTable.where({ username: username });

	try {
		const result = await query.findOne();
		if (result) {
			console.log(result);
			console.log(`Found serverID: ${result.serverID}`);
			return result.serverID;
		}
	} catch (err) {
		console.error(err);
	}
}

//This function finds user in database and retreives it socket ID
export async function findUserSocketInDatabase(username: string) {
	const query = mappingTable.where({ username: username });

	try {
		const result = await query.findOne();
		if (result) {
			console.log(`Found socketID: ${result.socketID}`);
			return result.socketID;
		}
	} catch (err) {
		console.error(err);
	}
}

//This function deletes user based on socketID
export async function deleteFromDB(socketID: string) {
	mappingTable
		.deleteMany({ socketID: socketID })
		.then((deletedDocument: any) => {
			if (deletedDocument) {
				console.log("Deleted document:", deletedDocument);
			} else {
				console.log("Document not found");
			}
		})
		.catch((err: any) => {
			console.error(`Error deleting many from db`, err);
			wasDown=true;
		});
}
