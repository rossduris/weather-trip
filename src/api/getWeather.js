import axios from "axios";

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
      // setWeatherData(response.data);
      // console.log(response.data);
      console.log("checking data for hour", hour);
      const weatherText =
        response.data.forecast.forecastday[0].hour[hour].condition.text;
      console.log(weatherText);
    })
    .catch(function (error) {
      console.error(error);
    });
};

export default getWeather;
