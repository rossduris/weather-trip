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
  const [weatherData, setWeatherData] = useState();
  const [steps, setSteps] = useState();
  const [spots, setSpots] = useState();
  const [weatherForTrip, setWeatherForTrip] = useState();

  const getWeather = async (coordinate) => {
    const options = {
      method: "GET",
      url: "https://weatherapi-com.p.rapidapi.com/forecast.json",
      params: { q: coordinate },
      headers: {
        "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
        "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com",
      },
    };

    await axios
      .request(options)
      .then(function (response) {
        setWeatherData(response.data);
        // console.log(response.data);
        // return response.data.forecast.forecastday[0].hour;
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  async function getTripPlan() {
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

    await axios
      .request(options)
      .then(function (response) {
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

  function getDistance(point1, point2) {
    const axios = require("axios");

    const options = {
      method: "GET",
      url: "https://distanceto.p.rapidapi.com/get",
      params: { route: "<REQUIRED>", car: "false" },
      headers: {
        "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
        "X-RapidAPI-Host": "distanceto.p.rapidapi.com",
      },
    };

    axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  useEffect(() => {
    console.log("coordinates updated");
  }, [coordinatesToCheck]);

  useEffect(() => {
    const tripCoords = [];

    if (tripResults) {
      const coordinates = tripResults.features[0].geometry.coordinates[0];
      tripCoords.push({ location: coordinates[0][0], weather: {} });
      tripCoords.push({
        location: coordinates[0][Math.round(coordinates[0].length - 1)],
        weather: {},
      });
      tripCoords.push({
        location: coordinates[0][Math.round(coordinates[0].length * 0.2)],
        weather: {},
      });
      tripCoords.push({
        location: coordinates[0][Math.round(coordinates[0].length * 0.4)],
        weather: {},
      });
      tripCoords.push({
        location: coordinates[0][Math.round(coordinates[0].length * 0.3)],
        weather: {},
      });
      tripCoords.push({
        location: coordinates[0][Math.round(coordinates[0].length * 0.6)],
        weather: {},
      });
      tripCoords.push({
        location: coordinates[0][Math.round(coordinates[0].length * 0.7)],
        weather: {},
      });
    }
    setCoordinatesToCheck(tripCoords);

    if (tripResults != null) {
      setSteps(tripResults.features[0].properties.legs[0].steps);
    }
  }, [tripResults]);

  useEffect(() => {
    if (tripResults != null && steps != null) {
      const hours = Math.round(
        tripResults.features[0].properties.time / 60 / 60
      );
      const stepsCount = steps.length;
      const rounds = Math.round(stepsCount / hours);
      let time = 0;
      let spotsToCheck = [];
      for (let i = 0; i < stepsCount; i++) {
        time += steps[i].time;
        const hours = time / 60 / 60;
        if (hours > 1) {
          spotsToCheck.push(steps[i].from_index);
          time = 0;
        }
      }
      setSpots(spotsToCheck);
    }
  }, [steps]);

  return (
    <>
      <div>
        <button onClick={getTripPlan}>Submit</button>
      </div>
      <div>
        {coordinatesToCheck.map((coordinate, index) => {
          return <div>{`${coordinate.location}`}</div>;
        })}
      </div>
      <div>
        {tripResults
          ? `${JSON.stringify(weatherForTrip)}`
          : "Loading directions..."}
      </div>
      <div>
        {weatherData ? (
          <>
            {coordinatesToCheck.map((coordinate, index) => {
              return (
                <div className="weatherBox">
                  <h3>{`${coordinate[1]}, ${coordinate[0]}`}</h3>
                  <div>
                    {JSON.stringify(
                      weatherData.forecast.forecastday[0].hour[index].time
                    )}
                  </div>
                  <div>
                    {JSON.stringify(
                      weatherData.forecast.forecastday[0].hour[index].condition
                        .text
                    )}
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          "Loading weather..."
        )}
      </div>
    </>
  );
};

export default WeatherResults;
