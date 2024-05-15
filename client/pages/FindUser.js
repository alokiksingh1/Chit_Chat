import React, { useState } from "react";

const FindUser = ({ setUser }) => {
	// State for form fields
	const [username, setUsername] = useState("");

	// Function to handle form submission
	const handleSubmit = (e) => {
		e.preventDefault();

		setUser(username);
		// Here you can perform your login logic
		console.log("Email:", username);
		// Reset form fields after submission
		setUsername("");
		{
			/*socket.disconnect(); */
		}
	};

	return (
		<>
			<h1>Choose who you want to chat with</h1>
			<form onSubmit={handleSubmit}>
				<label htmlFor="username">Other username: </label>
				<input
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					type="username"
					placeholder="enter name here"
					id="usernme"
					name="username"
				/>
				<button type="submit">Start Chat</button>
			</form>
		</>
	);
};

export default FindUser;