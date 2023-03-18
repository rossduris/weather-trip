import axios from "axios";

function getDistance(point1, point2) {
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

export default getDistance;
