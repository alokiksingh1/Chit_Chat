import React, { useState, useEffect } from "react";
import { Socket } from "socket.io-client";

const Chatroom = ({ user1, user2, socket }) => {
	const [user1Message, setUser1Message] = useState("");
	const [messages, setMessages] = useState([]);
	const [lastMessageId1, setLastMessageId] = useState(0);

	useEffect(() => {
		socket.on("receiveMessage", (incomingMessage) => {
			console.log(`incoming message`, JSON.parse(incomingMessage));

			const newMessage = JSON.parse(incomingMessage);

			setMessages((prev) => prev.concat(newMessage));
		});
	}, []);

	const handleSubmitUser1 = (e) => {
		e.preventDefault();

		const newMessageId1 = lastMessageId1 + 1;

		const newMessage = {
			username1: user1,
			username2: user2,
			content: user1Message,
			messageId: newMessageId1,
		};

		socket.emit("message", newMessage);

		setMessages((prev) => prev.concat(newMessage));
		setLastMessageId(newMessageId1);

		setUser1Message("");
	};

	return (
		<>
			<h1>Chatroom</h1>
			<div style={{ maxWidth: "600px", margin: "20px auto", padding: "10px" }}>
				{messages.map((msg) => (
					// <div
					// 	style={{
					//     display: "flex",
					// 		flexDirection: "column",
					// 	}}
					// >
					// 	{msg.username1}
					// </div>
					<div
						key={msg.username1 + msg.messageId}
						style={{
							marginBottom: "10px",
							padding: "5px 10px",
							borderRadius: "5px",
							backgroundColor: msg.username1 === user1 ? "#DCF8C6" : "#C2E0FF",
							float: msg.username1 === user1 ? "left" : "right",
							clear: "both",
						}}
					>
						<strong>{msg.username1}:</strong>
						<p>{msg.content}</p>
					</div>
				))}
			</div>
			<form onSubmit={handleSubmitUser1}>
				<label htmlFor="user1Message">Message: </label>
				<input
					value={user1Message}
					onChange={(e) => setUser1Message(e.target.value)}
					type="text"
					placeholder="Enter message"
					id="user1Message"
					name="user1Message"
				/>
				<button type="submit">Send Message</button>
			</form>
		</>
	);
};
export default Chatroom;