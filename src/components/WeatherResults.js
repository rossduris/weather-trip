import axios from "axios";
import { useEffect, useState } from "react";
// import getWeather from "../api/getWeather";
import getDistance from "../api/getDistance";

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
  // const [weatherData, setWeatherData] = useState();
  const [steps, setSteps] = useState();
  const [spots, setSpots] = useState();
  const [weatherForTrip, setWeatherForTrip] = useState([]);
  const [loading, setLoading] = useState(false);

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

  let results = [];

  const getWeather = (coordinate) => {
    const options = {
      method: "GET",
      url: "https://weatherapi-com.p.rapidapi.com/forecast.json",
      params: { q: coordinate },
      headers: {
        "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
        "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com",
      },
    };

    axios
      .request(options)
      .then(function (response) {
        const weatherText =
          response.data.forecast.forecastday[0].hour[0].condition.text;
        results.push({
          location: coordinate,
          hour: 0,
          text: weatherText,
        });
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  useEffect(() => {
    console.log("coordinates updated");
    setLoading(true);
    if (coordinatesToCheck) {
      coordinatesToCheck.forEach((coord, i) => {
        if (coord[0]) {
          console.log("getting data for hour: ", coord[1]);
          console.log(coord[0][1], coord[0][0]);
          getWeather(`${coord[0][1]}, ${coord[0][0]}`);
        }
      });
      // results.sort((a, b) => (a.hour > b.hour ? 1 : b.hour > a.hour ? -1 : 0));
      setWeatherForTrip(results);
    }

    setLoading(false);
  }, [coordinatesToCheck]);

  useEffect(() => {
    const tripCoords = [];
    // Find trip distance in hours
    if (tripResults) {
      const coords = tripResults.features[0].geometry.coordinates[0];
      if (tripResults) {
        tripCoords.push([coords[0], 1]);
        tripCoords.push([coords[Math.round(coords.length * 0.2)], 2]);
        tripCoords.push([coords[Math.round(coords.length * 0.4)], 3]);
        tripCoords.push([coords[Math.round(coords.length * 0.3)], 4]);
        tripCoords.push([coords[Math.round(coords.length * 0.6)], 5]);
        tripCoords.push([coords[Math.round(coords.length * 0.7)], 6]);
        tripCoords.push([coords[coords.length - 1], 7]);
      }
      setCoordinatesToCheck(tripCoords);
    }
  }, [tripResults]);

  return (
    <>
      <div>
        <button onClick={getTripPlan} disabled={loading}>
          {loading ? "Loading..." : "Submit"}
        </button>
      </div>
      {weatherForTrip ? (
        <div>{JSON.stringify(weatherForTrip)}</div>
      ) : (
        "Loading..."
      )}
    </>
  );
};

export default WeatherResults;
