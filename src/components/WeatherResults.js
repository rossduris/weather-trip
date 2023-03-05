import axios from "axios";
import { useEffect, useState } from "react";

const WeatherResults = ({
  tripData,
  route,
  setRoute,
  responseCount,
  setResponseCount,
  coordinatesToCheck,
  setCoordinatesToCheck,
}) => {
  const [tripResults, setTripResults] = useState();
  const [weatherData, setWeatherData] = useState({});

  function getTripPlan() {
    setResponseCount(0);

    const options = {
      method: "GET",
      url: "https://multimodal-trip-planner.p.rapidapi.com/v1/routing",
      params: {
        mode: "drive",
        waypoints: `${tripData.startLocation.lat},${tripData.startLocation.lon}|${tripData.endLocation.lat},${tripData.endLocation.lon}`,
      },
      headers: {
        "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
        "X-RapidAPI-Host": "multimodal-trip-planner.p.rapidapi.com",
      },
    };

    axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
        setTripResults(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });

    tripResults
      ? setCoordinatesToCheck(
          tripResults.features[0].geometry.coordinates[0][0]
        )
      : console.log("Waiting for coordinates");

    console.log(tripData.startLocation.name, tripData.endLocation.name);
    setRoute({
      start: tripData.startLocation.name,
      end: tripData.endLocation.name,
    });
  }

  async function getWeather() {
    const options = {
      method: "GET",
      url: "https://visual-crossing-weather.p.rapidapi.com/forecast",
      params: {
        location: `${coordinatesToCheck[0][1]},${coordinatesToCheck[0][0]}`,
        aggregateHours: "1",
        shortColumnNames: "0",
        unitGroup: "us",
        contentType: "csv",
      },
      headers: {
        "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
        "X-RapidAPI-Host": "visual-crossing-weather.p.rapidapi.com",
      },
    };

    await axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
        setWeatherData(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  useEffect(() => {
    console.log("coordinates updated");
    getWeather();
  }, [coordinatesToCheck]);

  useEffect(() => {
    const tripCoords = [];
    if (tripResults) {
      tripCoords.push(tripResults.features[0].geometry.coordinates[0][0]);
      tripCoords.push(
        tripResults.features[0].geometry.coordinates[0][
          Math.round(
            tripResults.features[0].geometry.coordinates[0].length * 0.25
          )
        ]
      );
      tripCoords.push(
        tripResults.features[0].geometry.coordinates[0][
          Math.round(
            tripResults.features[0].geometry.coordinates[0].length * 0.5
          )
        ]
      );
      tripCoords.push(
        tripResults.features[0].geometry.coordinates[0][
          Math.round(
            tripResults.features[0].geometry.coordinates[0].length * 0.75
          )
        ]
      );
      tripCoords.push(
        tripResults.features[0].geometry.coordinates[0][
          tripResults.features[0].geometry.coordinates[0].length - 1
        ]
      );
    }
    setCoordinatesToCheck(tripCoords);

    console.log(tripCoords);
  }, [tripResults]);

  return (
    <>
      <div>
        <button onClick={getTripPlan}>Get Routes</button>
        {tripResults
          ? `${JSON.stringify(
              tripResults.features[0].properties.time / 60 / 60
            )} hrs`
          : "Loading..."}
      </div>
      <div>
        {tripResults
          ? `${tripResults.features[0].geometry.coordinates[0][0][1]},
          ${tripResults.features[0].geometry.coordinates[0][0][0]}
            
            |        
          ${
            tripResults.features[0].geometry.coordinates[0][
              Math.round(
                tripResults.features[0].geometry.coordinates[0].length / 2
              )
            ][1]
          },${
              tripResults.features[0].geometry.coordinates[0][
                Math.round(
                  tripResults.features[0].geometry.coordinates[0].length / 2
                )
              ][0]
            }|
            ${
              tripResults.features[0].geometry.coordinates[0][
                tripResults.features[0].geometry.coordinates[0].length - 1
              ][1]
            },
            ${
              tripResults.features[0].geometry.coordinates[0][
                tripResults.features[0].geometry.coordinates[0].length - 1
              ][0]
            }`
          : "Loading..."}
      </div>
      <div>{weatherData ? <div>{JSON.stringify(weatherData)}</div> : ""}</div>
    </>
  );
};

export default WeatherResults;
