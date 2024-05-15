import React, { useState } from "react";

const Login = ({ socket, setUser }) => {
	// State for form fields
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	// Function to handle form submission
	const handleSubmit = (e) => {
		e.preventDefault();

		socket.emit("username", username);

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
			<h1>Enter a username</h1>
			<form onSubmit={handleSubmit}>
				<label htmlFor="username">Username: </label>
				<input
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					type="username"
					placeholder="enter name here"
					id="usernme"
					name="username"
				/>
				<button type="submit">Enter name</button>
			</form>
		</>
	);
};

export default Login;