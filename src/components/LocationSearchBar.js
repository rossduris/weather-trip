import { useEffect, useState } from "react";
import axios from "axios";

const LocationSearchBar = ({ type, tripData, setTripData }) => {
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState();

  function handleChange(event) {
    setIsSearching(true);
    setSearchValue(event.target.value);
  }

  function handleLocationClick() {
    setIsSearching(false);
    switch (type) {
      case "start":
        console.log("updating start location");
        setTripData((prevState) => ({
          ...prevState,
          startLocation: {
            name: searchResults.features[0].properties.address_line1,
            lat: searchResults.features[0].properties.lat,
            lon: searchResults.features[0].properties.lon,
          },
        }));
        setSearchValue(searchResults.features[0].properties.address_line1);
        break;
      case "end":
        console.log("updating end location");
        setTripData((prevState) => ({
          ...prevState,
          endLocation: {
            name: searchResults.features[0].properties.address_line1,
            lat: searchResults.features[0].properties.lat,
            lon: searchResults.features[0].properties.lon,
          },
        }));
        setSearchValue(searchResults.features[0].properties.address_line1);
        break;

      default:
        break;
    }
  }

  function getAutoComplete() {
    const options = {
      method: "GET",
      url: "https://address-completion.p.rapidapi.com/v1/geocode/autocomplete",
      params: {
        text: searchValue,
        limit: "1",
        lang: "en",
        countrycodes: "us",
      },
      headers: {
        "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
        "X-RapidAPI-Host": "address-completion.p.rapidapi.com",
      },
    };

    axios
      .request(options)
      .then(function (response) {
        console.log("getting search response", response.data);
        setSearchResults(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  function debounce(func, delay = 1000) {
    let timeoutId;

    return function (...args) {
      clearTimeout(timeoutId);
      console.log("debounce running");
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  useEffect(() => {
    if (searchValue.length > 0) {
      debounce(getAutoComplete());
    }
  }, [searchValue]);

  document.body.addEventListener("click", () => setIsSearching(false));

  return (
    <div className="locationSearch">
      <input
        type="text"
        placeholder={type === "start" ? "Start Location" : "End Location"}
        onChange={handleChange}
        maxLength={50}
        required
        value={
          !searchValue && type === "start"
            ? ""
            : !searchValue && type === "end"
            ? ""
            : searchValue
        }
      />
      {isSearching ? (
        searchResults && searchResults.features && searchResults.features[0] ? (
          <span className="searchResults" onClick={handleLocationClick}>
            <div>
              <div>{searchResults.features[0].properties.address_line1}</div>
              <div>
                {searchResults.features[0].properties.lat},
                {searchResults.features[0].properties.lon}
              </div>
            </div>
          </span>
        ) : (
          ""
        )
      ) : (
        ""
      )}
    </div>
  );
};

export default LocationSearchBar;
