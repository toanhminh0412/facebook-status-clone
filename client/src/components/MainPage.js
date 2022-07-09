import React, {useState, useEffect} from 'react'
import {useNavigate} from "react-router-dom";
import {FcVideoCall, FcStackOfPhotos, FcPortraitMode} from "react-icons/fc";
import NavBar from './NavBar';
import CreatePost from './CreatePost';

function MainPage() {
    const [username, setUsername] = useState("");
    const [showCreatePost, setShowCreatePost] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user has provided an username
        const storageUsername = window.localStorage.getItem("FSCusername");
        if (storageUsername) {
            setUsername(storageUsername);
        } else {
            navigate("/auth");
        }
    }, [])

    return (
        <div className="w-screen min-h-screen bg-gray-100 relative">
            {showCreatePost ? (<CreatePost close={() => {setShowCreatePost(false)}}/>) : (<div></div>)}
            <NavBar/>
            <div className="pt-40 w-full sm:w-9/12 md:w-8/12 lg:w-1/2 xl:w-1/3 mx-auto">
                <div className="w-full bg-white rounded-md shadow-md shadow-grey-900">
                    <div className="flex flex-row pt-4 pb-4 border-b border-gray-200 w-11/12 mx-auto">
                        <img className="w-12 h-12 rounded-full border border-gray-400" src="img/user.png" alt="profile pic"></img>
                        <div className="ml-auto px-3 py-1 text-xl rounded-full w-11/12 bg-gray-100 hover:bg-gray-200 active:bg-gray-200 duration-200 text-gray-500 cursor-pointer flex flex-col justify-center" onClick={() => {setShowCreatePost(true)}}>What's on your mind, {username}?</div>
                    </div>
                    <div className="mt-2 flex flex-row w-11/12 mx-auto pb-2">
                        <div className="w-1/3 flex flex-row justify-center text-gray-600 font-medium text-md h-12 rounded-lg cursor-pointer hover:bg-gray-100">
                            <FcVideoCall className="text-3xl w-fit my-auto"/>
                            <p className="w-fit my-auto ml-2">Live video</p>
                        </div>
                        <div className="w-1/3 flex flex-row justify-center text-gray-600 font-medium text-md h-12 rounded-lg cursor-pointer hover:bg-gray-100">
                            <FcStackOfPhotos className="text-3xl w-fit my-auto"/>
                            <p className="w-fit my-auto ml-2">Photo/video</p>
                        </div>
                        <div className="w-1/3 flex flex-row justify-center text-gray-600 font-medium text-md h-12 rounded-lg cursor-pointer hover:bg-gray-100">
                            <FcPortraitMode className="text-3xl w-fit my-auto"/>
                            <p className="w-fit my-auto ml-2">Feeling/Activity</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MainPage