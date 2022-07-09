import React, {useState} from 'react'
import {useNavigate} from "react-router-dom"
import axios from "axios";


function AuthPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("")
    const [error, setError] = useState("");

    const onUsernameChange = e => {
        setUsername(e.target.value);
    }

    const logIn = e => {
        e.preventDefault();
        if (username === "") {
            setError("Please pick an username")
        } else {
            axios.post("/new-user", {
                username: username
            })
            .then(res => {
                console.log(res.data);
                if (res.data.error) {
                    setError("Username already exists");
                    setUsername("")
                } else {
                    window.localStorage.setItem("FSCusername", username);
                    navigate("/")
                }
            })
            .catch(error => {
                console.log(error);
            })
        }  
    }

    return (
        <div className="w-screen min-h-screen bg-gray-100">
            <div className="pt-60 w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12 xl:w-3/12 mx-auto">
                <h1 className="text-4xl text-blue-500 font-bold">Facebook Status Clone</h1>
                <form className="w-full bg-white shadow-md shadow-slate-500 rounded-md mt-4 text-center h-fit" onSubmit={logIn}>
                    {error !== "" ? (<p className="text-xl pt-4 text-red-500">{error}</p>) : (<div></div>)}
                    <input className="w-11/12 mx-auto mt-4 text-lg rounded-md border border-slate-500 py-2 px-4" type="text" placeholder='Username (any will be fine)' value={username} onChange={onUsernameChange}></input>
                    <input type="submit" value="Log in" className="py-2 px-4 w-11/12 mt-4 mb-4 text-white text-xl text-white bg-blue-500 hover:bg-blue-600 rounded-md"></input>
                </form>
            </div>
        </div>
    )
}

export default AuthPage