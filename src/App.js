import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";
import axios from "axios";
import LocationSearchBar from "./components/LocationSearchBar";
import WeatherResults from "./components/WeatherResults";
import MapboxMap from "./components/MapboxMap";
import Footer from "./components/Footer";

function App() {
  const [coordinatesToCheck, setCoordinatesToCheck] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [weatherForTrip, setWeatherForTrip] = useState();
  const [weatherObjects, setWeatherObjects] = useState([]);
  const [weatherData, setWeatherData] = useState([]);
  const [tripData, setTripData] = useState({
    startLocation: {
      name: "Columbus, OH",
      lat: "39.9612",
      lon: "-82.98333",
    },
    endLocation: {
      name: "Cincinnati, OH",
      lat: "39.103119",
      lon: "-84.512016",
    },
  });
  const [route, setRoute] = useState({
    start: "Columbus, OH",
    end: "Cincinnati, OH",
  });
  const [responseCount, setResponseCount] = useState(0);

  function handleSubmit() {
    console.log(tripData);
  }

  const map = (
    <MapboxMap
      responseCount={responseCount}
      setResponseCount={setResponseCount}
      route={route}
      coordinatesToCheck={coordinatesToCheck}
      weatherForTrip={weatherForTrip}
      setWeatherForTrip={setWeatherForTrip}
      weatherObjects={weatherObjects}
      setWeatherObjects={setWeatherObjects}
      weatherData={weatherData}
      setWeatherData={setWeatherData}
    />
  );
  const weather = (
    <WeatherResults
      responseCount={responseCount}
      setResponseCount={setResponseCount}
      tripData={tripData}
      route={route}
      setRoute={setRoute}
      coordinatesToCheck={coordinatesToCheck}
      setCoordinatesToCheck={setCoordinatesToCheck}
      weatherObjects={weatherObjects}
      setWeatherObjects={setWeatherObjects}
      weatherData={weatherData}
      setWeatherData={setWeatherData}
    />
  );

  return (
    <>
      <div className="app-wrapper">
        <div className="search-weather-wrapper">
          <div className="search-wrapper">
            <LocationSearchBar
              type="start"
              tripData={tripData}
              setTripData={setTripData}
            />
            <LocationSearchBar
              type="end"
              tripData={tripData}
              setTripData={setTripData}
            />
          </div>
          <div className="weather-wrapper">{weather}</div>
        </div>
        {map}
      </div>
      <Footer />
    </>
  );
}

export default App;
