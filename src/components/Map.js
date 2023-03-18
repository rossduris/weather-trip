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
            {coordinatesToCheck.length > 0
              ? coordinatesToCheck
                  .filter((coordinate, index) => {
                    const lastIndex = coordinatesToCheck.length - 1;
                    return index != lastIndex && index != 0;
                  })
                  .map((coordinate, index) => {
                    return (
                      <Marker
                        onLoad={onLoad}
                        position={{
                          lat: coordinate[0][1],
                          lng: coordinate[0][0],
                        }}
                        label="Raining"
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
