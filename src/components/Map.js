import React, { Component, useEffect, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  useGoogleMap,
  Marker,
  useLoadScript,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import logo from "../logo.svg";

const containerStyle = {
  width: "400px",
  height: "400px",
};

const Map = ({
  route,
  setRoute,
  responseCount,
  setResponseCount,
  coordinatesToCheck,
  weatherForTrip,
  setWeatherForTrip,
}) => {
  const [response, setResponse] = useState("");

  function directionsCallback(response) {
    const myTimeout = setTimeout(() => {
      if (response != null) {
        setResponseCount(responseCount + 1);
        switch (response.status) {
          case "OK":
            setResponse(response);
            break;

          default:
            break;
        }
      }
    }, 1500);

    if (responseCount === response.geocoded_waypoints.length) {
      clearTimeout(myTimeout);
    }
  }

  const onLoad = (marker) => {
    // console.log("marker: ", marker);
  };

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap mapContainerStyle={containerStyle} zoom={10}>
        <DirectionsService
          // required
          options={{
            destination: route.end,
            origin: route.start,
            travelMode: "DRIVING",
          }}
          // required
          callback={directionsCallback}
        />
        {response ? (
          <>
            <DirectionsRenderer
              options={{
                directions: response,
              }}
            />
            {weatherForTrip
              ? weatherForTrip.map((marker) => {
                  const location = marker.location.split(",");
                  return (
                    <Marker
                      onLoad={onLoad}
                      position={{
                        lat: Number(location[0]),
                        lng: Number(location[1]),
                      }}
                      label={marker.text}
                    />
                  );
                })
              : ""}
          </>
        ) : (
          ""
        )}
      </GoogleMap>
    </LoadScript>
  );
};
export default Map;
