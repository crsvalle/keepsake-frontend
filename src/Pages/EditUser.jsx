import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import pic from "../Pages/Pic/garage1.jpeg"
import "../style/EditUser.css"

import { TextField } from "@mui/material";
import { InputAdornment } from "@mui/material";
import Box from "@mui/material/Box";
// import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";
import { ref, uploadBytes } from "firebase/storage";
import { storage } from "../Components/firebase";

const API = process.env.REACT_APP_API_URL;

function EditProfile() {
  const navigate = useNavigate();
  const { index } = useParams();
  const [errorMsg, setErrorMsg] = useState("");

  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    address: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    axios.get(`${API}/users/${index}`).then((res) => setUser(res.data));
  }, [index]);

  const editProfile = (updateProfile) => {
    axios
      .put(`${API}/users/${index}`, updateProfile)
      .then(() => navigate(`/user/profile`))
      .catch((e) => console.warn("catch", e));
  };

  const uploadImage = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setErrorMsg("");
      return;
    }
    if (file.type.split('/')[0] !== 'image') {
      setErrorMsg("File must be an image!");
      return;
    }
    if (file.size > 5242880) {
      setErrorMsg("Is exceed the size limit of 5MB!");
      return;
    }
    setErrorMsg("");
    const imgRef = ref(storage, `users/${user.user_id}/1`);
    uploadBytes(imgRef, file);
  }

  const handleTextChange = (event) => {
    setUser({ ...user, [event.target.id]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    editProfile(user);
  };

  return (
    <div className="edit__user">
      <div className=" form mt-7 w-10">
        <Box
        className="flex-col"
          component="form"
          onSubmit={handleSubmit}
          sx={{
            "& .MuiTextField-root": { m: 1, width: "30ch" },
            "& button": { m: 1 },
          }}
          noValidate
          autoComplete="off">
          <TextField
            id="first_name"
            label="First Name"
            //  variant="standard"
            size="small"
            value={user.first_name}
            onChange={handleTextChange}
            // InputLabelProps={{ shrink: true }}
          />
          <TextField
            id="last_name"
            label="Last Name"
            // variant="standard"
            size="small"
            value={user.last_name}
            onChange={handleTextChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            helperText=""
            id="address"
            label="Address"
            // variant="standard"
            size="small"
            value={user.address}
            onChange={handleTextChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <HomeIcon className="w-s" style={{ fontSize: "20px" }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            helperText=""
            id="email"
            label="Email"
            // variant="standard"
            size="small"
            value={user.email}
            onChange={handleTextChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon className="w-s" style={{ fontSize: "20px" }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            id="phone"
            label="Phone"
            // variant="standard"
            size="small"
            value={user.phone}
            onChange={handleTextChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocalPhoneIcon
                    className="w-s"
                    style={{ fontSize: "20px" }}
                  />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            helperText=""
            id="image"
            size="small"
            label="Upload Image"
            type="file"
            onChange={uploadImage}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                </InputAdornment>
              ),
            }}
          />
          {errorMsg && <p>{errorMsg}</p>}
          <button
            type="submit"
            className="edit__user__btn bg-customBlue hover:bg-customBlueLight text-white py-2 px-4 rounded mr-2"
          >
            Save
          </button>
        </Box>
      </div>
      <div className="user__edit__img"><img className="img" src={pic} alt="garage" /></div>
    </div>
  );
}

export default EditProfile;
