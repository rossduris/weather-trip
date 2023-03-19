import axios from "axios";
import { useEffect, useState } from "react";
// import getWeather from "../api/getWeather";
import getDistance from "../api/getDistance";

const WeatherResults = ({
  tripData,
  setRoute,
  weatherForTrip,
  setWeatherForTrip,
  setResponseCount,
  setCoordinatesToCheck,
}) => {
  const [tripResults, setTripResults] = useState();
  // const [weatherData, setWeatherData] = useState();
  const [steps, setSteps] = useState();
  const [spots, setSpots] = useState();
  const [loading, setLoading] = useState(false);

  async function getTripPlan() {
    setLoading(true);
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
        console.log(tripResults);
        setRoute({
          start: tripData.startLocation.name,
          end: tripData.endLocation.name,
        });
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  let results = [];

  const getWeather = (coordinate, hour) => {
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
          response.data.forecast.forecastday[0].hour[hour].condition.text;
        results.push({
          location: coordinate,
          hour: hour,
          text: weatherText,
        });
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  useEffect(() => {
    const tripCoords = [];
    // Find trip distance in hours
    if (tripResults) {
      const coords = tripResults.features[0].geometry.coordinates[0];

      tripCoords.push(coords[0]);
      tripCoords.push(coords[Math.round(coords.length * 0.2)]);
      tripCoords.push(coords[Math.round(coords.length * 0.3)]);
      tripCoords.push(coords[Math.round(coords.length * 0.4)]);
      tripCoords.push(coords[Math.round(coords.length * 0.6)]);
      tripCoords.push(coords[Math.round(coords.length * 0.7)]);
      tripCoords.push(coords[coords.length - 1]);

      setCoordinatesToCheck(tripCoords);

      tripCoords.forEach((coord, i) => {
        getWeather(`${coord[1]}, ${coord[0]}`, i);
      });

      setWeatherForTrip(results);

      console.log(`${tripCoords[1][1]}, ${tripCoords[1][0]};
      ${tripCoords[2][1]}, ${tripCoords[2][0]};
      ${tripCoords[3][1]}, ${tripCoords[3][0]};
      ${tripCoords[4][1]}, ${tripCoords[4][0]}
     `);
      getDistance(
        `${tripCoords[0][1]}, ${tripCoords[0][0]}`,
        `${tripCoords[1][1]}, ${tripCoords[1][0]};
         ${tripCoords[2][1]}, ${tripCoords[2][0]};
         ${tripCoords[3][1]}, ${tripCoords[3][0]};
         ${tripCoords[4][1]}, ${tripCoords[4][0]}
        `
      );
    }

    setLoading(false);
  }, [tripResults]);

  return (
    <>
      <div className="weather-data">
        <button onClick={getTripPlan} disabled={loading}>
          {loading ? "Loading..." : "Get Weather"}
        </button>
      </div>
      <div>
        {weatherForTrip ? (
          <div>
            {weatherForTrip
              .sort((a, b) => (a.hour > b.hour ? 1 : -1))
              .map((weather) => {
                return (
                  <>
                    <div key={weather.hour}>{weather.hour}</div>
                    <div key={weather.location}>{weather.location}</div>
                    <div key={`${weather.location}${weather.hour}`}>
                      {weather.text}
                    </div>
                  </>
                );
              })}
          </div>
        ) : (
          "Loading..."
        )}
      </div>
      {/* <div>{tripResults ? JSON.stringify(tripResults) : ""}</div> */}
    </>
  );
};

export default WeatherResults;
