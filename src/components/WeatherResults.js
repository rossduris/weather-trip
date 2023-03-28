import axios from "axios";
import { useEffect, useState } from "react";

const WeatherResults = ({
  tripData,
  setRoute,
  weatherData,
  setWeatherData,
  weatherObjects,
  setWeatherObjects,
  setResponseCount,
  setCoordinatesToCheck,
}) => {
  const [tripResults, setTripResults] = useState();
  const [loading, setLoading] = useState(false);
  const [checkWeatherCount, setCheckWeatherCount] = useState(1);
  const [forecastData, setForecastData] = useState();

  const [distanceData, setDistanceData] = useState();

  let forecast = [];
  let results = [];

  async function getTripPlan() {
    setLoading(true);
    setResponseCount(0);
    setTripResults(null);
    setForecastData(null);
    setWeatherData([]);
    forecast = [];
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

        setRoute({
          start: tripData.startLocation.name,
          end: tripData.endLocation.name,
        });
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  const getWeather = (coordinate, hour, index) => {
    const options = {
      method: "GET",
      url: "https://weatherapi-com.p.rapidapi.com/forecast.json",
      params: { q: coordinate, days: 2 },
      headers: {
        "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
        "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com",
      },
    };

    axios
      .request(options)
      .then((response) => {
        if (hour < 24) {
          forecast.push(response.data.forecast.forecastday[0].hour[hour]);
        } else if (hour > 24 && hour < 48) {
          forecast.push(response.data.forecast.forecastday[1].hour[hour - 24]);
        }
      })
      .then(() => {
        forecast.sort((a, b) => (a.time > b.time ? 1 : -1));

        if (forecast.length === weatherObjects.length) {
          setWeatherData(forecast);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  async function getDistance(origins, destinations) {
    const options = {
      method: "GET",
      url: "https://trueway-matrix.p.rapidapi.com/CalculateDrivingMatrix",
      params: {
        origins: origins,
        destinations: destinations,
      },
      headers: {
        "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
        "X-RapidAPI-Host": "trueway-matrix.p.rapidapi.com",
      },
    };

    await axios
      .request(options)
      .then(function (response) {
        setDistanceData(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  useEffect(() => {
    const tripCoords = [];
    const tripObjs = [];

    setForecastData(null);
    forecast = [];
    // Find trip distance in hours
    if (tripResults) {
      const coords = new Array(
        tripResults.features[0].geometry.coordinates[0].length
      );
      tripResults.features[0].geometry.coordinates[0].forEach(
        (coordinate, i) => {
          coords[i] = `${coordinate[1]},${coordinate[0]}`;
        }
      );

      let grain = 10;

      let increment = grain / checkWeatherCount / 10;
      let indexToGet = 0;

      for (let i = 0; i < checkWeatherCount; i++) {
        console.log(indexToGet.toFixed(2));

        tripCoords.push(coords[Math.round(coords.length * indexToGet)]);

        let weatherObj = {
          coordinate: coords[Math.round(coords.length * indexToGet)],
          distance: ``,
          duration: ``,
          weather: ``,
        };
        tripObjs.push(weatherObj);

        indexToGet += increment;
      }
      //Get last coordintate for trip
      tripCoords.push(coords[coords.length - 1]);

      let weatherObj = {
        coordinate: coords[coords.length - 1],
        distance: `0`,
        duration: `0`,
        weather: ``,
      };
      tripObjs.push(weatherObj);
      setWeatherObjects(tripObjs);

      setCoordinatesToCheck(tripCoords);

      let len = tripCoords.length;
      let origins = `${tripCoords[0]}`;
      let destinations = ``;
      for (let i = 1; i < len; i++) {
        if (i === len - 1) {
          destinations += `${tripCoords[i]}`;
        } else {
          destinations += `${tripCoords[i]};`;
        }
      }

      getDistance(origins, destinations).then(setLoading(false));

      setForecastData(forecast);
    }
  }, [tripResults]);

  useEffect(() => {
    if (distanceData) {
      weatherObjects
        ? weatherObjects.forEach((obj, i) => {
            if (i != 0) {
              obj.duration = distanceData.durations[0][i - 1];
              obj.distance = distanceData.distances[0][i - 1];
            }
            const duration = Math.round(obj.duration / 60 / 60);
            const time = new Date();
            const minuets = time.getMinutes();
            console.log("minuets: ", minuets);
            let timeToCheck = Number(time.getHours() + duration);
            if (minuets > 30) {
              timeToCheck = timeToCheck + 1;
            }
            console.log("getting weather for time: ", timeToCheck);
            getWeather(obj.coordinate, timeToCheck, i);
          })
        : console.log("no objs yet");
    } else {
      console.log("no data");
    }
  }, [distanceData]);

  return (
    <>
      <div className="weather-data">
        <button onClick={getTripPlan} disabled={loading}>
          {loading ? "Loading..." : "Get Weather"}
        </button>
        <span className="marker-count-wrapper">
          <span className="marker-title">
            Checkpoints: <span id="count">{Number(checkWeatherCount) + 1}</span>
            <span>
              <div
                onClick={() => {
                  if (checkWeatherCount > 1) {
                    setCheckWeatherCount(
                      (prev) => Number(checkWeatherCount) - 1
                    );
                  }
                }}
              >
                -
              </div>
              <div
                onClick={() =>
                  setCheckWeatherCount((prev) => Number(checkWeatherCount) + 1)
                }
              >
                +
              </div>
            </span>
          </span>
        </span>
      </div>
      {/* <div>
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
          "Loading weather..."
        )}
      </div> */}
      <div>
        {weatherObjects ? (
          <div className="weather-box">
            {weatherObjects.map((obj, i) => {
              return (
                <div key={obj.coordinate}>
                  <div>Location: {obj.coordinate}</div>
                  {/* <span>Distance: {obj.distance}</span> */}
                  {i != 0 ? (
                    <div>
                      Duration:{" "}
                      {loading
                        ? "Loading..."
                        : (obj.duration / 60 / 60).toFixed(2)}{" "}
                      hrs.
                    </div>
                  ) : (
                    ""
                  )}
                  {/* <div>Weather: {obj.weather}</div> */}
                  <div>
                    {weatherData && weatherData[i] ? (
                      <>
                        <div>{weatherData[i].time}</div>
                        <div>Temp: {weatherData[i].temp_f}&#176;F</div>
                        {weatherData[i].condition.text}
                      </>
                    ) : (
                      "loading..."
                    )}
                  </div>
                  {weatherData && weatherData[i] ? (
                    <img
                      className="weather-img"
                      src={`https:${weatherData[i].condition.icon}`}
                    />
                  ) : (
                    ""
                  )}
                  {i === 0 ? (
                    <span className="origin">Origin</span>
                  ) : i === weatherObjects.length - 1 ? (
                    <span className="destination">Destination</span>
                  ) : (
                    ""
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          "Loading objs"
        )}
      </div>
    </>
  );
};

export default WeatherResults;
