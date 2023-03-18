import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";
import axios from "axios";
import LocationSearchBar from "./components/LocationSearchBar";
import WeatherResults from "./components/WeatherResults";
import Map from "./components/Map";

function App() {
  const [coordinatesToCheck, setCoordinatesToCheck] = useState([]);
  const [locationData, setLocationData] = useState([]);
  // const [weatherData, setWeatherData] = useState([]);
  const [tripData, setTripData] = useState({
    startLocation: { name: "", lat: "", lon: "" },
    endLocation: { name: "", lat: "", lon: "" },
  });
  const [route, setRoute] = useState({
    start: "",
    end: "",
  });
  const [responseCount, setResponseCount] = useState(0);

  function handleSubmit() {
    console.log(tripData);
  }

  const startSearch = (
    <LocationSearchBar
      type="start"
      tripData={tripData}
      setTripData={setTripData}
    />
  );
  const endSearch = (
    <LocationSearchBar
      type="end"
      tripData={tripData}
      setTripData={setTripData}
    />
  );
  const map = (
    <Map
      responseCount={responseCount}
      setResponseCount={setResponseCount}
      route={route}
      coordinatesToCheck={coordinatesToCheck}
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
    />
  );

  return (
    <>
      <div className="app-wrapper">
        {startSearch}
        {endSearch}
        {map}
        {weather}
      </div>
    </>
  );
}

export default App;
