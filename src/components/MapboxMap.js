import React, { useState, useRef, useEffect } from "react";
import ReactMapGl, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Map from "react-map-gl";
const containerStyle = {
  width: "400px",
  height: "400px",
};

const MapboxMap = ({
  route,
  responseCount,
  setResponseCount,
  weatherData,
  weatherObjects,
}) => {
  const apiKey = process.env.REACT_APP_MAPBOX_PUBLIC_KEY;

  const [viewPort, setViewPort] = useState({
    latitude: 39.9612,
    longitude: -82.98333,
    zoom: 7,
  });

  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef && mapRef.current) {
      mapRef.current.dragPan = true;
    }
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        minHeight: "100vh",
        position: "absolute",
        top: 0,
        zIndex: 1,
      }}
    >
      <Map
        mapboxAccessToken={apiKey}
        initialViewState={{ ...viewPort }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
      >
        {/* <Marker
          longitude={viewPort.longitude}
          latitude={viewPort.latitude}
          anchor="bottom"
        >
          <img src="./pin.png" width={40} height={40} />
        </Marker> */}
        <div
          style={{
            position: "absolute",
            top: 0,
            width: "100%",
          }}
        >
          {weatherObjects
            ? weatherObjects.map((weatherObj, i) => {
                console.log(weatherObj.coordinate.split(",")[0]);
                console.log(weatherObj.coordinate.split(",")[1]);
                return (
                  <div key={weatherObj.coordinate}>
                    <Marker
                      latitude={weatherObj.coordinate.split(",")[0]}
                      longitude={weatherObj.coordinate.split(",")[1]}
                      anchor="bottom"
                    >
                      <img
                        src={
                          weatherData[i] ? weatherData[i].condition.icon : ""
                        }
                        width={40}
                        height={40}
                      />
                    </Marker>
                  </div>
                );
              })
            : // <img src="./pin.png" width={40} height={40} />
              ""}
          {/* {weatherData ? <div>{JSON.stringify(weatherData)}</div> : ""} */}
        </div>
      </Map>
      {/* <ReactMapGl
        {...viewPort}
        ref={mapRef}
        mapboxAccessToken={apiKey}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      ></ReactMapGl> */}
    </div>
  );
};
export default MapboxMap;
