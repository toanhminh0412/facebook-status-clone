import React, {useState, useEffect} from 'react'
import {useNavigate} from "react-router-dom"
import imageCompression from "browser-image-compression";
import axios from "axios";
import {storage} from "../App";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";


function AuthPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState(window.localStorage.getItem("FSCusername"));
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (username) {
            navigate("/");
        }
    }, [])

    // create a preview as a side effect, whenever selected file is changed
    // Source: https://stackoverflow.com/questions/38049966/get-image-preview-before-uploading-in-react
    useEffect(() => {
        if (!photo) {
            setPhotoPreview(null)
            return
        }

        const objectUrl = URL.createObjectURL(photo)
        setPhotoPreview(objectUrl)

        // free memory when ever this component is unmounted
        return () => URL.revokeObjectURL(objectUrl)
    }, [photo])

    const onUsernameChange = e => {
        setUsername(e.target.value);
    }

    const onPhotoChange = async(e) => {
        if (!e.target.files || e.target.files.length === 0) {
          setPhoto(null)
          return
        } 
        const options = {
          maxSizeMB: 0.1,
          maxWidthOrHeight: 700,
          useWebWorker: true
        }
        try {
          const compressedFile = await imageCompression(e.target.files[0], options);
          setPhoto(compressedFile);
          console.log(compressedFile);
        } catch (error) {
            console.log(error);
        } 
      }

    const logIn = e => {
        e.preventDefault();
        if (!username) {
            setError("Please pick an username");
            return;
        } 
         else if (photo){
            const photoRef = ref(storage, `user-images/${username}`)
            // upload user images to storage
            uploadBytes(photoRef, photo).then(snapshot => {
                getDownloadURL(photoRef).then(url => {
                    const newUser = {
                        username: username,
                        userPhoto: url
                    }
                    axios.post("/new-user", {newUser: newUser})
                    .then(res => {
                        if (res.data.found) {
                            window.localStorage.setItem("FSCusername", username);
                            window.localStorage.setItem("FSCuserphoto", res.data.photo);
                        } else {
                            window.localStorage.setItem("FSCusername", username);
                            window.localStorage.setItem("FSCuserphoto", "");
                        }
                        navigate("/")
                    }).catch(error => console.log(error))
                })
                .catch(error => console.log(error));
            }).catch(error => console.log(error));
        } else {
            axios.post("/new-user", {
                newUser: {
                    username: username,
                    userPhoto: ""
                }
            })
            .then(res => {
                console.log(res.data);
                if (res.data.found) {
                    window.localStorage.setItem("FSCusername", username);
                    window.localStorage.setItem("FSCuserphoto", res.data.photo);
                } else {
                    window.localStorage.setItem("FSCusername", username);
                    window.localStorage.setItem("FSCuserphoto", "");
                }
                navigate("/")
            })
            .catch(error => {
                console.log(error);
            })
        }  
    }

    return (
        <div className="w-screen min-h-screen bg-gray-100">
            <div className="pt-60 w-10/12 sm:w-8/12 md:w-7/12 lg:w-5/12 xl:w-4/12 2xl:w-3/12 mx-auto">
                <h1 className="text-4xl text-blue-500 font-bold">Facebook Status Clone</h1>
                <form className="w-full bg-white shadow-md shadow-slate-500 rounded-md mt-4 text-center h-fit" onSubmit={logIn}>
                    {error !== "" ? (<p className="text-xl pt-4 text-red-500">{error}</p>) : (<div></div>)}
                    <input className="w-11/12 mx-auto mt-4 text-lg rounded-md border border-slate-500 py-2 px-4" type="text" placeholder='Username (any will be fine)' value={username ? username: ""} onChange={onUsernameChange}></input>
                    <p className="ml-6 text-left mt-2 text-lg font-medium">Profile picture (optional):</p>
                    <img className="h-48 w-40 mt-4 mx-auto shadow-md border border-gray-200" src={photoPreview ? photoPreview : "img/user.png"} alt="user pic"></img>
                    <input className="ml-16 mt-4" type="file" onChange={onPhotoChange}></input>
                    <input type="submit" value="Log in" className="py-2 px-4 w-11/12 mt-4 mb-4 text-white text-xl text-white bg-blue-500 hover:bg-blue-600 rounded-md"></input>
                </form>
            </div>
        </div>
    )
}

export default AuthPage