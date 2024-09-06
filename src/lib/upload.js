import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
  } from "firebase/storage";
  
  const upload = async (file) => {
    const storage = getStorage();
    const metadata = {
      contentType: file.type,
    };
    const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    console.log('File Name:', file.name); // Check that file.name is a valid string
    console.log('File Type:', file.type); // Check that file.type is correct
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };
  
  export default upload;
  