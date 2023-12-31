import axios from 'axios';
import { storage } from './firebase';
import { ref, listAll, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from "react-router-dom";
// import { useUserInfo } from '../api/fetch';

let imgID = 0;
const API = process.env.REACT_APP_API_URL;


export default function ListingEdit() {
  let { id } = useParams();
  let navigate = useNavigate();
  // const userInfo = useUserInfo();
  const fileInputRef = useRef(null);
  const imgListRef = ref(storage, `listings/${id}`);
  const states = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

  const [images, setImages] = useState([]);
  const [upImages, setUpImages] = useState([]);
  const [fireImgs, setFireImgs] = useState([]);
  const [deleteImgs, setDeleteImgs] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [listing, setListing] = useState({
    street: "",
    apt: "",
    city: "",
    state: "",
    zip: "",
    size: "",
    price: "",
    posted_at: "",
    type: "",
    host: "",
    is_rented: false,
    avg_rating: 0,
    description: ""
  });

  useEffect(() => {
    axios
      .get(`${API}/listings/${id}`)
      .then(
        (res) => {
          res.data.listing_id ? setListing(res.data) : navigate(`/not-found`);
          // if (res.data.listing_id && res.data.host === userInfo.id) {
          //   setListing(res.data);
          // }
          // else navigate(`/not-found`);
        },
        (error) => navigate(`/not-found`)
      );
  }, [id, navigate]);

  useEffect(() => {
    listAll(imgListRef).then((res) => {
      res.items.forEach((item) => {
        let imgName = Number(item._location.path_.split('/').pop());
        if (imgName > imgID) {
          imgID = imgName;
        }
        getDownloadURL(item).then((url) =>
          setFireImgs((prevs) =>
            [...prevs, {imgObj: item, imgUrl: url}]
          )
        );
      });
      imgID += 1;
    });
  }, []);

  const editListing = (updateListing) => {
    axios
      .put(`${API}/listings/${id}`, updateListing)
      .then(
        () => {
          for (let img of upImages) {
            const imageRef = ref(storage, `listings/${id}/${imgID++}`);
            uploadBytes(imageRef, img);
          }
          alert("Listing Updated!");
          navigate(`/listings/show/${id}`);
        },
        (error) => console.error(error)
      )
      .catch((c) => console.warn("catch", c));
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!(fireImgs.length + images.length)) {
      setErrorMessage("Must add images for the listing!");
      return;
    }
    // listing.posted_at = new Date().toLocaleDateString();
    deleteImgs.forEach(img => {
      const deleteRef = ref(storage, img._location.path_);
      deleteObject(deleteRef);
    });
    editListing(listing);
  }

  const handleTextChange = (event) => {
    setListing({ ...listing, [event.target.id]: event.target.value });
  }

  const handleNumberChange = (event) => {
    setListing({ ...listing, [event.target.id]: Number(event.target.value) });
  }

  const handleDateChange = (event) => {
    let date = event.target.value.replace(/(....).(..).(..)/, "$2/$3/$1");
    // setListing({ ...listing, [event.target.id]: date });
  }

  const processImages = (files) => {
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.split('/')[0] !== 'image') {
        setErrorMessage("File must be an image!");
        continue;
      }
      if (images.length + fireImgs.length + files.length >= 6) {
        setErrorMessage("You can only add 5 images!");
        continue;
      }
      if (files[i].size > 5242880) {
        setErrorMessage("One or more images exceed the size limit of 5MB!");
        continue;
      }
      if (images.some(img => img.name === files[i].name)) {
        setErrorMessage("Image file already added!");
        continue;
      }

      setImages(prevImages => [
        ...prevImages, {
          name: files[i].name,
          url: URL.createObjectURL(files[i])
        }
      ]);
      setUpImages(prevs => [ ...prevs, files[i] ]);
      setErrorMessage("");
    }
  }

  const selectFiles = () => {
    fileInputRef.current.click();
  }

  const onFileSelect = (event) => {
    const files = event.target.files;
    if (!files.length) return;
    processImages(files);
  }

  const onDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const files = event.dataTransfer.files;
    processImages(files);
  }

  const onDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
    event.dataTransfer.dropEffect = "copy";
  }

  const onDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  }

  const deleteImage = (index) => {
    setImages((prevs) => prevs.filter((img, i) => i !== index));
  }

  const deleteFireImage = (imgObj, index) => {
    setDeleteImgs(prevs => [...prevs, imgObj]);
    setFireImgs(prevs => prevs.filter((img, i) => i !== index));
  }

  // const deleteFireImage = (imgObj, index) => {
  //   const deleteRef = ref(storage, imgObj._location.path_);
  //   deleteObject(deleteRef);
  //   setFireImgs(prevs => prevs.filter((img, i) => i !== index))
  // }

  return (
    <div>
      <form className="new-listing-form" onSubmit={handleSubmit}>
        <div className="address-detail">
          <div className="address form-section">
            <h3 className='section-text'>--Address--</h3>
            <label>Street Address:</label>
            <input
              className="input"
              id="street"
              type="text"
              value={listing.street}
              onChange={handleTextChange}
              required
            />
            <label>Floor/Unit/Apt (Optional):</label>
            <input
              className="input"
              id="apt"
              type="text"
              value={listing.apt}
              onChange={handleTextChange}
            />
            <label>City:</label>
            <input
              className="input"
              id="city"
              type="text"
              value={listing.city}
              onChange={handleTextChange}
              required
            />
            <label>Select State:</label>
            <select className="input" name="states" id="state" value={listing.state} onChange={handleTextChange}>
              {states.map(st => <option key={st} value={st}> {st} </option>)}
            </select>
            <label>Zip Code:</label>
            <input
              className="input"
              id="zip"
              type="text"
              value={listing.zip}
              onChange={handleTextChange}
              required
            />
          </div>
          
          <div className="space-detail form-section">
            <h3 className='section-text'>--Space Details--</h3>
            <label>Type:</label>
            <select className="input" name="type" id="type" value={listing.type} onChange={handleTextChange}>
              <option value="Closet">Closet</option>
              <option value="Spare Room">Spare Room</option>
              <option value="Basement">Basement</option>
              <option value="Backyard Shade">Backyard Shade</option>
              <option value="Garage">Garage</option>
              <option value="Parking Spot">Parking Spot</option>
              <option value="Other">Other</option>
            </select>
            <label>Size:</label>
            <input
              className="input"
              id="size"
              type="text"
              value={listing.size}
              onChange={handleTextChange}
              required
            />
            <label>Available Until:</label>
            <input
              className="input"
              id="date"
              type="date"
              onChange={handleDateChange}
              required
            />
            <label>Monthly Rent in USD($):</label>
            <input
              className="input"
              id="price"
              type="number"
              min="0"
              value={listing.price}
              onChange={handleNumberChange}
              required
            />
            <label>Short Description:</label>
            <textarea
              className="input"
              id="description"
              type="text"
              maxLength="1000"
              placeholder="Maximum 1000 characters"
              value={listing.description}
              onChange={handleTextChange}
              required
            />
          </div>
        </div>
        <div className="last-section">
          <div className="card">
            <div className="top">
              <p className='section-text'>Add Images</p>
              <label>(Add up to 5 images & max size 5MB per image)</label>
            </div>
            <div className="drag-area" onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
              {isDragging ? (
                <span>Drop images here</span>
              ) : (
                <section className='drop-text'>
                  <span>Drag & Drop in this box</span>
                  <span>or</span>
                  <span className="select-image" role='button' onClick={selectFiles}>Browse from files</span>
                </section>
              )}
              <input
                type="file"
                name="images"
                className="files"
                onChange={onFileSelect}
                ref={fileInputRef}
                multiple
              />
            </div>
            <div className="container">
              {errorMessage && <p>{errorMessage}</p>}
              <div className='images'>
              {fireImgs.map((img, index) =>
                <div className="image" key={index}>
                  <span className="delete" onClick={() => deleteFireImage(img.imgObj, index)}>&times;</span>
                  <img src={img.imgUrl} alt={index}/>
                </div>
              )}
              {images.map((img, index) =>
                <div className="image" key={index}>
                  <span className="delete" onClick={() => deleteImage(index)}>&times;</span>
                  <img src={img.url} alt={img.name}/>
                </div>
              )}
              </div>
            </div>
          </div>
          <input className='bg-customBlue hover:bg-customBlueLight text-white font-bold' type="submit" value="SUBMIT"/>
          <Link className='backButton font-bold' to={`/listings/show/${id}`}>
            <button>BACK</button>
          </Link>
        </div>
      </form>
    </div>
  )
}
