// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
// import '../style/Map.css'

// const MAP_API = process.env.REACT_APP_GEOLOCATION_API;

// const containerStyle = {
//   width: '400px',
//   height: '400px',
// };

// const Map = ({ location, hoveredListingId }) => {
//   const [list, setList] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [mapLoading, setMapLoading] = useState(true);
//   const [markers, setMarkers] = useState([]);
//   const [selectedMarker, setSelectedMarker] = useState(null);
//   console.log(hoveredListingId);
//   useEffect(() => {
//     setLoading(true);

//     fetch('http://localhost:3003/listings')
//       .then((response) => response.json())
//       .then((data) => setList(data))
//       .catch((error) => console.error('Error fetching listings:', error))
//       .finally(() => setLoading(false));
//   }, []);

//   useEffect(() => {
//     setMapLoading(true);
//     const fetchGeocodedMarkers = async () => {
//       const newMarkers = [];

//       for (const el of list) {
//         const address = `${el.street}, ${el.city}, ${el.state} ${el.zip}`;

//         try {
//           const geocoder = new window.google.maps.Geocoder();
//           const result = await new Promise((resolve, reject) => {
//             geocoder.geocode({ address }, (results, status) => {
//               if (status === 'OK' && results.length > 0) {
//                 resolve(results[0].geometry.location);
//               } else {
//                 reject(new Error('Geocoding failed'));
//               }
//             });
//           });

//           newMarkers.push({
//             position: result,
//             icon: {
//               url: el.image,
//                scaledSize: new window.google.maps.Size(30, 30),
//             },
//             content: `${el.price}`,
//             id:  `${el.listing_id}`,
//           });
//         } catch (error) {
//           console.error('Geocoding error:', error);
//         }
//       }

//       setMarkers(newMarkers);
//       console.log(markers);
//       setMapLoading(false);
//     };

//     fetchGeocodedMarkers();
//   }, [list]);

//   const handleMarkerClick = (marker) => {
//     console.log('Clicked Marker ID:', marker.id);
//     setSelectedMarker(marker);
//   };

//   const handleInfoWindowClose = () => {
//     setSelectedMarker(null);
//   };

//   return (
//     loading && mapLoading ? <div>Loading ...</div> : (
//       <LoadScript googleMapsApiKey={MAP_API}>
//         <GoogleMap mapContainerStyle={containerStyle} center={location} zoom={11}>
//           {markers.map((marker, index) => (
//             <Marker
//   key={marker.id}
//   position={marker.position}
//   icon={{
//     url: marker.icon.url,
//     scaledSize: {
//       width: hoveredListingId === marker.id ? 60 : 30,
//       height: hoveredListingId === marker.id ? 60 : 30,
//     },
//   }}
//   onClick={() => handleMarkerClick(marker)}
// >
// </Marker>

//           ))}
//           {selectedMarker && (
//             <InfoWindow
//               position={selectedMarker.position}
//               onCloseClick={handleInfoWindowClose}
//             >
//               <div className='map__marker'>
//                 <Link to={`/listings/${selectedMarker.id}`}>
//                   <img className='map__marker__img' src={selectedMarker.icon.url} alt="Marker Icon" style={{ width: '40px', height: '40px' }}/>
//                   <p className='map__marker__p'>{selectedMarker.content}</p>
//                 </Link>
//               </div>
//             </InfoWindow>
//           )}
//         </GoogleMap>
//       </LoadScript>
//     )
//   );
// };

// export default Map;
// Map.js
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import '../style/Map.css'

const MAP_API = process.env.REACT_APP_GEOLOCATION_API;

const containerStyle = {
  width: '400px',
  height: '400px',
};

const Map = ({ location, hoveredListingId }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);


  const fetchMarkers = async () => {
    try {
      const newMarkers = [];

      for (const el of list) {
        const address = `${el.street}, ${el.city}, ${el.state} ${el.zip}`;
        const result = await geocodeAddress(address);

        newMarkers.push({
          position: result,
          icon: {
            url: el.image,
          },
          content: `${el.price}`,
          id: el.listing_id,
        });
      }

      setMarkers(newMarkers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching markers:', error);
    }
  };

  useEffect(() => {
    setLoading(true);

    fetch('http://localhost:3003/listings')
      .then((response) => response.json())
      .then((data) => setList(data))
      .catch((error) => console.error('Error fetching listings:', error))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (list.length > 0) {
      fetchMarkers();
    }
  }, [list]);

  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${MAP_API}`
      );
  
      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }
  
      const data = await response.json();
  
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return { lat: location.lat, lng: location.lng };
      } else {
        throw new Error('Geocoding response did not contain valid data');
      }
    } catch (error) {
      console.error('Error geocoding address:', error.message);
      return { lat: 0, lng: 0 };
    }
  };
  

  const handleMarkerClick = (marker) => {
    console.log('Clicked Marker ID:', marker.id);
    setSelectedMarker(marker);
  };

  const handleInfoWindowClose = () => {
    if (selectedMarker && selectedMarker.position) {
      setSelectedMarker(null);
    }
  };

  return (
    loading && mapLoading ? <div>Loading ...</div> : (
      <LoadScript googleMapsApiKey={MAP_API}>
        <GoogleMap mapContainerStyle={containerStyle} center={location} zoom={11}>
          {markers.map((marker, index) => (
            <Marker
              key={index}
              position={marker.position}
              icon={{
                url: marker.icon.url,
                scaledSize: {
                  width: hoveredListingId === marker.id ? 60 : 30,
                  height: hoveredListingId === marker.id ? 60 : 30,
                },
              }}
              onClick={() => handleMarkerClick(marker)}
            />
          ))}
          {selectedMarker && (
  <InfoWindow
    position={selectedMarker.position}
    onCloseClick={handleInfoWindowClose}
  >
    <div className='map__marker'>
      <Link to={`/listings/${selectedMarker.id}`}>
        <img className='map__marker__img' src={selectedMarker.icon.url} alt="Marker Icon" style={{ width: '40px', height: '40px' }}/>
        <p className='map__marker__p'>${selectedMarker.content}</p>
      </Link>
    </div>
  </InfoWindow>
)}

        </GoogleMap>
      </LoadScript>
    )
  );
};

export default Map;
