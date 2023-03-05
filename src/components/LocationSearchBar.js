import { useEffect, useState } from "react";
import axios from "axios";

const LocationSearchBar = ({ type, tripData, setTripData }) => {
  const locations = ["Columbus, OH", "New York, New York", "Gahanna, Ohio"];
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState();
  const [results, setResults] = useState({});

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
        console.log(response.data);
        setSearchResults(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  useEffect(() => {
    // Get autocomplete search value
    searchValue.length > 0 ? getAutoComplete() : console.log("empty");
  }, [searchValue]);

  document.body.addEventListener("click", () => setIsSearching(false));

  return (
    <div className="locationSearch">
      <input
        type="text"
        placeholder={type === "start" ? "Start Location" : "End Location"}
        onChange={handleChange}
        value={searchValue}
      />
      {isSearching ? (
        searchResults && searchResults.features && searchResults.features[0] ? (
          <div className="searchResults" onClick={handleLocationClick}>
            <div>{searchResults.features[0].properties.address_line1}</div>
            <div>
              {searchResults.features[0].properties.lat},
              {searchResults.features[0].properties.lat}
            </div>
            {/* <div>
            {searchResults.features.map((prop) => {
              return <div>{JSON.stringify(prop)}</div>;
            })}
          </div> */}
          </div>
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
