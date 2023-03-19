import axios from "axios";

function getDistance(point1, point2) {
  const options = {
    method: "GET",
    url: "https://trueway-matrix.p.rapidapi.com/CalculateDrivingMatrix",
    params: {
      origins: point1,
      destinations: point2,
    },
    headers: {
      "X-RapidAPI-Key": "3ba367c919msh8d947653e42526cp1a49bfjsn21e4f7cb1630",
      "X-RapidAPI-Host": "trueway-matrix.p.rapidapi.com",
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
