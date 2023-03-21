import axios from "axios";
import { useEffect, useState } from "react";

const WeatherResults = ({
  tripData,
  setRoute,
  weatherForTrip,
  setWeatherForTrip,
  weatherObjects,
  setWeatherObjects,
  setResponseCount,
  setCoordinatesToCheck,
}) => {
  const [tripResults, setTripResults] = useState();
  const [loading, setLoading] = useState(false);
  const [checkWeatherCount, setCheckWeatherCount] = useState(2);
  const [forecastData, setForecastData] = useState();
  const [weatherData, setWeatherData] = useState([]);
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
      params: { q: coordinate },
      headers: {
        "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
        "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com",
      },
    };

    axios
      .request(options)
      .then((response) => {
        // const text = response.data.forecast.forecastday[0].hour[hour].condition.text;
        // const temp = response.data.forecast.forecastday[0].hour[hour]
        // forecast.push(response.data.forecast.forecastday[0].hour[hour])
        // const forecastArray = [...weatherData];
        setWeatherData((prev) => [
          ...prev,
          response.data.forecast.forecastday[0].hour[hour],
        ]);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    if (weatherData) {
      console.log(weatherData);
    }
  }, [weatherData]);

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

      console.log(origins, destinations);
      getDistance(origins, destinations).then(setLoading(false));
    }
  }, [tripResults]);

  useEffect(() => {
    setWeatherData([]);
    if (distanceData) {
      weatherObjects
        ? weatherObjects.forEach((obj, i) => {
            const duration = Math.round(obj.duration / 60 / 60);
            getWeather(obj.coordinate, duration, i);
            obj.weather = forecast ? forecast[i] : "Loading...";
            if (i != 0) {
              obj.duration = distanceData.durations[0][i - 1];
              obj.distance = distanceData.distances[0][i - 1];
            }
          })
        : console.log("no objs yet");

      setWeatherObjects((prev) => prev);

      console.log("forecast: ", forecastData);
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
            Checkpoints: <span id="count">{Number(checkWeatherCount) - 1}</span>
            <span>Including origin & destination.</span>
          </span>

          <input
            min={2}
            max={20}
            onChange={(e) => setCheckWeatherCount(e.target.value)}
            type="number"
            placeholder="Weather Checkpoints"
            value={checkWeatherCount}
          />
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
                  <span>Distance: {obj.distance}</span>
                  <div>
                    Duration:{" "}
                    {loading
                      ? "Loading..."
                      : (obj.duration / 60 / 60).toFixed(2)}{" "}
                    hrs.
                  </div>
                  <div>
                    Weather:{" "}
                    {weatherData[i]
                      ? weatherData[i].condition.text
                      : "loading..."}
                  </div>
                  {weatherData[i] ? (
                    <img
                      className="weather-img"
                      src={`https:${weatherData[i].condition.icon}`}
                    />
                  ) : (
                    console.log("no url...")
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
