import axios from "axios";
import { useEffect, useState } from "react"
import '../style/lists.css'


const API = process.env.REACT_APP_API_URL;
export default function Lists(){

  const [listings, setListings] = useState([]);

  useEffect(() => {
    axios
    .get('http://localhost:3003/listings')
    .then((res) => {
      setListings(res.data)
    })
    .catch((e) => console.warn("catch", e))
  }, [])
  
  return (
    <div className="listing" >
      {listings.map(el => 
        <>
          <div className="listing__single">
          <img src="https://dingdong887180022.files.wordpress.com/2021/06/empty-room.jpg" alt=""/>
            {el.listing_id}
           <div>{el.size}</div> 
           <div>${el.price}</div> 
          </div>
        </>
      )}
    </div>
  );
}