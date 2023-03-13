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

  async function getWeather() {
    const options = {
      method: "GET",
      url: "https://visual-crossing-weather.p.rapidapi.com/forecast",
      params: {
        location:
          tripData != null
            ? `${coordinatesToCheck[0][1]},${coordinatesToCheck[0][0]}`
            : "",

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
    // Find trip distance in hours
    // Add together trip length parts and every hour add to coordinates to check
    if (tripResults) {
      tripCoords.push(tripResults.features[0].geometry.coordinates[0][0]);

      tripCoords.push(
        tripResults.features[0].geometry.coordinates[0][
          Math.round(
            tripResults.features[0].geometry.coordinates[0].length * 0.2
          )
        ]
      );

      tripCoords.push(
        tripResults.features[0].geometry.coordinates[0][
          Math.round(
            tripResults.features[0].geometry.coordinates[0].length * 0.4
          )
        ]
      );

      tripCoords.push(
        tripResults.features[0].geometry.coordinates[0][
          Math.round(
            tripResults.features[0].geometry.coordinates[0].length * 0.6
          )
        ]
      );
      tripCoords.push(
        tripResults.features[0].geometry.coordinates[0][
          Math.round(
            tripResults.features[0].geometry.coordinates[0].length * 0.8
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
  }, [tripResults]);

  useEffect(() => {
    if (tripResults != null) {
      // tripResults.features[0].properties.legs[0].steps.map((step) => {
      //   return console.log(step);
      // });
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
          console.log(steps[i]);
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
        {coordinatesToCheck.map((coordinate) => {
          return <div>{coordinate}</div>;
        })}
      </div>
      {/* <div>
        {tripResults
          ? `${JSON.stringify(tripResults)}`
          : "Loading directions..."}
      </div> */}
      <div>
        {weatherData ? (
          <div>{JSON.stringify(weatherData.split("03/")[1])}</div>
        ) : (
          "Loading weather..."
        )}
      </div>
    </>
  );
};

export default WeatherResults;
