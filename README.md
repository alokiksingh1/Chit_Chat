# CPSC559_Proj
Distributed Systems concepts based application for CPSC 559 Project.

## Chit-Chat
The chit-chat application is an application for real time communication between two clients and the framework & architecture for this project includes using client/server architecture where client sends a request to the server through the proxy (HAProxy), MongoDb as database and using Redis Queue messaging system to transfer messages acroos different servers connected to the clients on the system.
This project underlines the key concepts of distributed system concept such as Fault Tolerance, Synchronization (Bully Algorithm), Consistency (Sequential Consistency Model) and Replication of servers and database attached to each server.
Using all these concepts, it is ensured that the users have a seamless chat experience. They just need to enter a random name for themselves and the name of the person they would like to talk to, keeping it a fun interactive new experience for the users.

You can also find the detailed discussion of the concepts in the Proof_Of_Concept.pdf file :
[Proof_Of_Concept.pdf](https://github.com/Murtaza1Mustafa/CPSC559_Proj/files/15326603/Proof_Of_Concept.pdf)



### How to run this project

1. Open 6 terminals in total
2. In 3 terminals do 
    cd server
    npx tsc         # (To compile server code)
3. In each of these 3 server terminals for server, change the environment variables of APPID and willStart 
4. Do
    node ./dist/app.js
5. On other two terminals , do 
    cd proxy
6. On one proxy terminal run :
    haproxy -f haproxy.cfg > haproxy.log 2>&1 &
7. On another proxy terminal run :
    node proxy.js
8. And on the last terminal run client
    cd client
    npm run dev
9. Remember to change paths according to your local files for haproxy.log in proxy.js file



#### To run dockerfile, use the following command on terminal on main project folder
#### Build 
docker build -t nodeapp .
#### Compose and run
docker-compose up
