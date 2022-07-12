import React, {useState, useEffect} from 'react'
import {useNavigate} from "react-router-dom";
import {FcVideoCall, FcStackOfPhotos, FcPortraitMode} from "react-icons/fc";
import {AiOutlineLike} from "react-icons/ai";
import {GoComment} from "react-icons/go";
import NavBar from './NavBar';
import CreatePost from './CreatePost';
import axios from 'axios';

function MainPage() {
    const [username, setUsername] = useState("");
    const [profilePic, setProfilePic] = useState(window.localStorage.getItem("FSCuserphoto"))
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showCreatePostFeeling, setShowCreatePostFeeling] = useState(false);
    const [showCreatePostPhoto, setShowCreatePostPhoto] = useState(false);
    const [posts, setPosts] = useState([]);
    // const [likes, setLikes] = useState(0);
    const [comment, setComment] = useState(["", ""]);
    const [message, setMessage] = useState("Loading...");
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user has provided an username
        const storageUsername = window.localStorage.getItem("FSCusername");
        if (storageUsername) {
            setUsername(storageUsername);
        } else {
            navigate("/auth");
        }

        // Get all the current posts
        axios.get("/all-posts")
        .then(res => {
            if (res.data.posts) {
                setPosts(res.data.posts);
                if (res.data.posts.length === 0) {
                    setMessage("No posts found")
                }
            } else {
                setMessage("No posts found")
            }
        })
        .catch(error => console.log(error));
    }, [])

    const likePost = postId => {
        axios.post("/like-post", {
            newLike:{
                postId: postId,
                username: username
            }
        })
        .then(res => {
            console.log(res.data.msg);
            axios.get("/all-posts")
            .then(res => {
                if (res.data.posts) {
                    setPosts(res.data.posts);
                    if (res.data.posts.length === 0) {
                        setMessage("No posts found")
                    }
                } else {
                    setMessage("No posts found")
                }
            })
            .catch(error => console.log(error));
        })
        .catch(error => {   
            console.log(error)
        })
    }

    const onCommentChange = (e, postId) => {
        let newComment = [postId, e.target.value];
        setComment(newComment);
    }

    const commentPost = (postId, e) => {
        e.preventDefault();
        if (comment[1] !== "") {
            axios.post("/comment-post", {
                newComment: {
                    postId: postId,
                    username: username,
                    userPhoto: profilePic,
                    content: comment[1]
                }
            })
            .then(res => {
                console.log(res.data.msg);
                setComment(["", ""]);
                axios.get("/all-posts")
                .then(res => {
                    if (res.data.posts) {
                        setPosts(res.data.posts);
                        if (res.data.posts.length === 0) {
                            setMessage("No posts found")
                        }
                    } else {
                        setMessage("No posts found")
                    }
                })
                .catch(error => console.log(error));
            })
            .catch(error => {   
                console.log(error)
            })
        }
    }

    return (
        <div className="w-screen min-h-screen bg-gray-100 relative pb-20">
            {showCreatePost ? (<CreatePost close={() => {setShowCreatePost(false)}} openPhoto={showCreatePostPhoto} openFeeling={showCreatePostFeeling}/>) : (<div></div>)}
            <NavBar/>
            <div className="pt-12 w-full sm:w-9/12 md:w-8/12 lg:w-1/2 xl:w-1/3 mx-auto">
                <div className="w-full bg-white rounded-md shadow-md shadow-grey-900">
                    <div className="flex flex-row pt-4 pb-4 border-b border-gray-200 w-11/12 mx-auto">
                        <img className="w-10 h-10 rounded-full border border-gray-400" src={profilePic ? profilePic : "img/user.png"} alt="profile pic"></img>
                        <div className="ml-auto px-3 py-1 text-xl rounded-full w-11/12 bg-gray-100 hover:bg-gray-200 active:bg-gray-200 duration-200 text-gray-500 cursor-pointer flex flex-col justify-center" onClick={() => {setShowCreatePost(true); setShowCreatePostPhoto(false); setShowCreatePostFeeling(false);}}>What's on your mind, {username}?</div>
                    </div>
                    <div className="mt-2 flex flex-row w-11/12 mx-auto pb-2">
                        <div className="w-1/3 flex flex-row justify-center text-gray-600 font-medium text-md h-12 rounded-lg cursor-pointer hover:bg-gray-100">
                            <FcVideoCall className="text-3xl w-fit my-auto"/>
                            <p className="w-fit my-auto ml-2">Live video</p>
                        </div>
                        <div className="w-1/3 flex flex-row justify-center text-gray-600 font-medium text-md h-12 rounded-lg cursor-pointer hover:bg-gray-100" onClick={() => {setShowCreatePost(true); setShowCreatePostFeeling(false); setShowCreatePostPhoto(true)}}>
                            <FcStackOfPhotos className="text-3xl w-fit my-auto"/>
                            <p className="w-fit my-auto ml-2">Photo/video</p>
                        </div>
                        <div className="w-1/3 flex flex-row justify-center text-gray-600 font-medium text-md h-12 rounded-lg cursor-pointer hover:bg-gray-100" onClick={() => {setShowCreatePost(true); setShowCreatePostFeeling(true); setShowCreatePostPhoto(false)}}>
                            <FcPortraitMode className="text-3xl w-fit my-auto"/>
                            <p className="w-fit my-auto ml-2">Feeling/Activity</p>
                        </div>
                    </div>
                </div>

                {posts.length === 0 ? (<div className="text-center text-4xl font-bold mt-12">{message}</div>) : (<div className="w-full mt-4">
                    {posts.map(post => (
                        <div key={post.postId} className="bg-white rounded-lg shadow-md mt-4 pb-4">
                            <div className="flex flex-row px-4 pt-2">
                                <img className="w-8 h-8 rounded-full border border-gray-300" src={post.userPhoto ? post.userPhoto : "img/user.png"} alt="user pic"/>
                                <p className="font-medium ml-2">{post.username} {post.feeling === "" ? (<span></span>) : (<span><span className="font-normal">feeling</span> {post.feeling}</span>)}</p>
                            </div>
                            <div className="flex flex-row px-4 mt-2">
                                {post.caption}
                            </div>
                            {post.photo ? (<img className="w-full mt-4" src={post.photo} alt="post pic"></img>) : (<div></div>)}
                            {post.likes.length > 0 ? (<p className="text-gray-800 font-light text-md mt-2 mx-4">{post.likes.length} likes</p>) : (<div></div>)}
                            <div className={`mt-2 mx-4 border-b border-t border-gray-300 flex flex-row ${post.photo ? "" : "border-t"}`}>
                                <div className="w-1/2 flex flex-row justify-center font-medium text-gray-600 py-1 my-1 rounded-lg hover:bg-gray-100 cursor-pointer" onClick={() => {likePost(post.postId)}}>
                                    <AiOutlineLike className={`text-xl ${post.likes.includes(username) ? "text-blue-500" : ""}`}/>
                                    <p className={`ml-2 ${post.likes.includes(username) ? "text-blue-500" : ""}`}>Like</p>
                                </div>
                                <div className="w-1/2 flex flex-row justify-center font-medium text-gray-600 py-1 my-1 rounded-lg hover:bg-gray-100 cursor-pointer">
                                    <GoComment className="text-xl w-fit my-auto"/>
                                    <p className='ml-2'>Comment</p>
                                </div>
                            </div>

                            <div className="w-full px-4 flex flex-row mt-4">
                                <img className="w-8 h-8 rounded-full border border-gray-300" src={profilePic ? profilePic : "img/user.png"} alt="user pic"></img>
                                <form className="ml-3 w-11/12" onSubmit={e => {commentPost(post.postId, e)}}>
                                    <input className="w-full placeholder:text-gray-500 rounded-full px-3 py-1 bg-gray-100 outline-none" type="text" placeholder='Write a comment...' value={post.postId === comment[0] ? comment[1] : ""} onChange={e => {onCommentChange(e, post.postId)}}></input>
                                    <p className="text-xs text-gray-700 font-normal mt-1">Press Enter to post.</p>
                                </form>
                            </div>
                            <div>
                                {post.comments.map((comment, index) => (
                                    <div key={index} className="w-full px-4 flex flex-row mt-4">
                                        <img className="w-8 h-8 rounded-full border border-gray-300" src={comment.userPhoto ? comment.userPhoto : "img/user.png"} alt="user pic"></img>
                                        <div className="ml-3 w-11/12 rounded-lg px-3 py-1 bg-gray-100 text-sm">
                                            <p className="font-medium">{comment.username}</p>
                                            <p>{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>)}
            </div>
            
        </div>
    )
}

export default MainPage