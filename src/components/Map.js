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

  responseCount,
  setResponseCount,
  weatherData,
  weatherObjects,
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

    if (response) {
      if (responseCount === response.geocoded_waypoints.length) {
        clearTimeout(myTimeout);
      }
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
            {weatherObjects
              ? weatherObjects
                  .filter(
                    (marker, i) => i != 0 && i != weatherObjects.length - 1
                  )
                  .map((marker, i) => {
                    let coordinate = marker.coordinate.split(",");
                    return marker ? (
                      <Marker
                        key={"key" + marker.coordinate}
                        onLoad={onLoad}
                        defa
                        position={{
                          lat: Number(coordinate[0]),
                          lng: Number(coordinate[1]),
                        }}
                        // icon={
                        //   weatherData && weatherData[i]
                        //     ? {
                        //         // path: google.maps.SymbolPath.CIRCLE,
                        //         url: weatherData[i]
                        //           ? `https:${weatherData[i + 1].condition.icon}`
                        //           : null,
                        //         scale: 3,
                        //       }
                        //     : null
                        // }
                      />
                    ) : (
                      ""
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
