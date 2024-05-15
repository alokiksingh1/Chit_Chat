import Head from "next/head";
import styles from "../styles/Home.module.css";
import Login from "./Login";
import Chatroom from "./Chatroom";
import FindUser from "./FindUser";
import { io } from "socket.io-client";
import { useEffect } from "react";
import React, { useState } from "react";

export default function Home() {
	const [user1, setUser1] = useState("");
	const [user2, setUser2] = useState("");
	const [socket, setSocket] = useState(null);
	useEffect(() => {
		const socket = io("http://localhost:8080/", {
			transports: ["websocket", "polling", "flashsocket"],
		});

		socket.on("connect", () => {
			console.log(socket.id); // x8WIv7-mJelg7on_ALbx
			console.log(socket.connected); // true
			console.log(`user1`, user1);
		});

		// socket.on("reconnect", () => {
		// 	console.log("Reconnected to the server");
		// 	// Perform any actions that should happen after a successful reconnection
		// 	if (user1 !== "") {
		// 	  console.log("Re-emitting username after reconnection");
		// 	  socket.emit("username", user1);
		// 	}
		//   });


		console.log(socket);

		setSocket(socket);

		return () => socket.disconnect();
	}, []);
	


	{
		/* const socket = io("http://localhost:5001/");
  socket.on("connect", () => {
    console.log(socket.id); // x8WIv7-mJelg7on_ALbx
  console.log(socket.connected); // true 
  });

  socket.on("test", () => {
    console.log("test event");
  }) */
	}
	return (
		<div className={styles.container}>
			<Head>
				<title>ChitChat</title>

				{/* <link rel="icon" href="/favicon.ico" /> */}
			</Head>

			<main>
				<h1 className={styles.title}>Welcome to ChitChat!</h1>

				{/*<Login socket={socket} /> */}

				{!user1 ? (
					<Login setUser={setUser1} socket={socket} />
				) : !user2 ? (
					<FindUser setUser={setUser2} />
				) : (
					<Chatroom user1={user1} user2={user2} socket={socket} />
				)}
			</main>

			<footer>
				<a
					href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
					target="_blank"
					rel="noopener noreferrer"
				>
					Powered by{" "}
					<img src="/vercel.svg" alt="Vercel" className={styles.logo} />
				</a>
			</footer>

			<style jsx>{`
				main {
					padding: 5rem 0;
					flex: 1;
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
				}
				footer {
					width: 100%;
					height: 100px;
					border-top: 1px solid #eaeaea;
					display: flex;
					justify-content: center;
					align-items: center;
				}
				footer img {
					margin-left: 0.5rem;
				}
				footer a {
					display: flex;
					justify-content: center;
					align-items: center;
					text-decoration: none;
					color: inherit;
				}
				code {
					background: #fafafa;
					border-radius: 5px;
					padding: 0.75rem;
					font-size: 1.1rem;
					font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
						DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
				}
			`}</style>

			<style jsx global>{`
				html,
				body {
					padding: 0;
					margin: 0;
					font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
						Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
						sans-serif;
				}
				* {
					box-sizing: border-box;
				}
			`}</style>
		</div>
	);
}
