import React, {useState, useEffect, useRef} from 'react'
import imageCompression from "browser-image-compression";
import {FcStackOfPhotos, FcPortraitMode} from "react-icons/fc";
import {MdAddAPhoto} from "react-icons/md";
import {storage} from "../App";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function CreatePost({close, openPhoto, openFeeling}) {
    const [username, setUsername] = useState(window.localStorage.getItem("FSCusername"));
    const [profilePic, setProfilePic] = useState(window.localStorage.getItem("FSCuserphoto"))
    const [showFeeling, setShowFeeling] = useState(openFeeling);
    const [feeling, setFeeling] = useState("");
    const [feelingCaption, setFeelingCaption] = useState("");
    const [showAddPhoto, setShowAddPhoto] = useState(openPhoto);
    const [caption, setCaption] = useState("");
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const inputPhoto = useRef(null);
    const navigate = useNavigate();

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

    const toggleShowAddPhoto = () => {
      if(showAddPhoto) {
        setShowAddPhoto(false);
      } else {
        setShowAddPhoto(true);
      }
    }

    const openFileBrowser = e => {
      inputPhoto.current.click();
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

    const toggleShowFeeling = () => {
      if (showFeeling) {
        setShowFeeling(false);
      } else {
        setShowFeeling(true); 
      }
    }

    const onFeelingChange = e => {
      setFeeling(e.target.value);
    }

    const onCaptionChange = e => {
      setCaption(e.target.value)
    }


    const addPost = () => {
      if (caption === "") {
        return;
      }
      // Upload photo
      if (photo) {
        const photoRef = ref(storage, `post-images/${username}-${photo.name}`)
        // 'file' comes from the Blob or File API
        uploadBytes(photoRef, photo).then((snapshot) => {
          getDownloadURL(photoRef).then(url => {
            console.log(url);
            const newPost = {
              postId: `post${new Date().getTime()}`,
              username: username,
              userPhoto: profilePic,
              caption: caption,
              photo: url,
              feeling: feeling,
              likes:[],
              comments: []
            }
            axios.post("/new-post", {newPost: newPost})
            .then(res => {
              if (res.data.success) {
                setCaption("");
                setPhoto(null);
                setPhotoPreview(null);
                setFeeling("");
                setShowAddPhoto(false);
                setShowFeeling(false);
                close();
                window.location.reload();
              } else {
                console.log(res.data.error);
              }
            })
            .catch(error => {console.log(error)});
          }).catch(error => {
            console.log(error)
          })
        })
        .catch(error => console.log(error));
      }
      else {
        const newPost = {
          postId: `post${new Date().getTime()}`,
          username: username,
          userPhoto: profilePic,
          caption: caption,
          photo: null,
          feeling: feeling,
          likes: [],
          comments: []
        }
        axios.post("/new-post", {newPost: newPost})
            .then(res => {
              if (res.data.success) {
                setCaption("");
                setPhoto(null);
                setPhotoPreview(null);
                setFeeling("");
                setShowAddPhoto(false);
                setShowFeeling(false);
                close();
                window.location.reload();
              } else {
                console.log(res.data.error);
              }
            })
            .catch(error => {console.log(error)});
      }
    }

    return (
        <div>
        <div className="w-screen min-h-screen fixed top-0 left-0 z-30 bg-gray-200 opacity-50"></div>
        <div className={`w-full sm:w-9/12 md:w-8/12 lg:w-1/2 xl:w-1/4 mx-auto absolute left-0 right-0 mx-auto ${showAddPhoto ? "top-28" : "top-60"} bg-white rounded-lg shadow-md shadow-gray-400 z-40 px-4`}>
            <div className="flex flex-row w-full pt-3 pb-3 border-b border-gray-200">
                <h1 className="w-11/12 text-xl font-bold text-center ml-4">Create post</h1>
                <div className="mr-4 text-center text-xl font-light w-8 h-8 text-gray-500 bg-gray-200 hover:bg-gray-300 rounded-full cursor-pointer" onClick={close}>&#x2716;</div>
            </div>
            <div className="flex flex-row w-full mt-4">
              <img className="w-10 h-10 rounded-full border border-gray-400" src={profilePic ? profilePic : "img/user.png"} alt="profile pic"></img>
              <div> 
                <p className="font-medium ml-2">{username}</p>
                {feelingCaption !== "" ? (
                  <p className="font-light ml-2">{feelingCaption} <span className='ml-2 hover:font-bold cursor-default' onClick={() => {setFeelingCaption(""); setFeeling("");}}>x</span></p>
                ) : (<div></div>)}
              </div>
            </div>
            <textarea className="placeholder:text-gray-500 border-0 bg-transparent resize-none outline-0 w-full text-2xl mt-4 mb-2 text-gray-700 h-40" placeholder={`What's on your mind, ${username}?`} onChange={onCaptionChange}></textarea>
            {showAddPhoto ? (<div className="rounded-lg w-full border border-gray-300 px-2 relative mb-4">
              {photo === null ? (<div>
                <div className="bg-gray-100 hover:bg-gray-200 duration-200 rounded-lg mt-2 mb-2 w-full h-60 flex flex-col justify-center" onClick={openFileBrowser}>
                  <div className="w-fit mx-auto px-4 py-4 rounded-full bg-gray-300">
                    <MdAddAPhoto className="text-3xl"/>
                  </div>
                  <h1 className="text-xl font-medium text-center">Add a photo</h1>
                </div>
                <div className="absolute top-4 right-4 text-center text-xl font-light w-8 h-8 text-gray-500 bg-white hover:bg-gray-200 rounded-full cursor-pointer" onClick={() => {setShowAddPhoto(false)}}>&#x2716;</div>
              </div>) : (
                <div className="w-full h-60 mt-2 mb-2">
                  <img className="w-full h-full" src={photoPreview} alt="Post pic"></img>
                  <div className="absolute top-4 right-4 text-center text-xl font-light w-8 h-8 text-gray-500 bg-white hover:bg-gray-200 rounded-full cursor-pointer" onClick={() => {setPhoto(null)}}>&#x2716;</div>
                </div>
              )}
            </div>) : (<div></div>)}
            <input type="file" ref={inputPhoto} className="hidden" accept='.jpeg,.png,.jpg' onChange={onPhotoChange}/> 
            {showFeeling ? (
            <div className="w-full mb-4 flex flex-row">
              <input className="w-10/12 px-4 py-2 text-lg rounded-md border border-gray-300" value={feeling} placeholder={`What are you feeling, ${username}?`} onChange={onFeelingChange}></input>
              <div className="w-2/12 py-2 bg-red-500 hover:bg-red-700 duration-200 text-white text-center text-lg font-medium rounded-lg cursor-default" onClick={() => {setFeelingCaption(`feeling ${feeling}`)}}>Add</div>
            </div>
            ) : (<div></div>)}
            <div className="flex flex-row px-4 py-3 w-full border border-gray-300 rounded-lg">
              <div className="w-1/2 font-medium pt-1">Add to your post</div>
              <div className={`ml-auto mr-4 w-1/12 text-3xl w-fit my-auto ${showAddPhoto ? "bg-gray-200" : "hover:bg-gray-200"} rounded-full px-1 py-1`} onClick={toggleShowAddPhoto}>
                <FcStackOfPhotos/>
              </div>
              <div className={`w-1/12 text-3xl w-fit my-auto ${showFeeling ? "bg-gray-200" : "hover:bg-gray-200"} rounded-full px-1 py-1`} onClick={toggleShowFeeling}>
                <FcPortraitMode/>
              </div>
            </div>
            <div className={`w-full py-2 mt-4 mb-4 rounded-lg text-center font-medium cursor-pointer ${caption === "" ? "bg-gray-200 text-gray-400" : "bg-blue-500 hover:bg-blue-600 text-white duration-100"}`} onClick={addPost}>Post</div>
          </div>
        </div>
    )
}

export default CreatePost