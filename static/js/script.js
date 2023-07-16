document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.indexOf("/challenge/") > -1) {
    const foundItButton = document?.querySelector(".found-it");
    foundItButton.addEventListener("click", async () => {
      try {
        toggleLoadingSpinner();
        const challengeCoordinates = await getChallengeCoordinates();
        const userCoordinates = await getLocation();

        const distance = getDistanceFromLatLonInKm(
          challengeCoordinates.latitude,
          challengeCoordinates.longitude,
          userCoordinates.latitude,
          userCoordinates.longitude
        );

        if (distance < 0.05) {
          alert("You found it!");
        } else {
          alert("You are not close enough to the challenge!");
        }

        console.log(distance.toFixed(2));
      } catch (error) {
        console.error(error);
        // Handle error appropriately
      }
      toggleLoadingSpinner();
    });
  }
});

/*
 * Function that requests access to
 * the user's location and returns
 * the coordinates
 */
const getLocation = () =>
  new Promise((resolve, reject) => {
    const showPosition = (position) => {
      const { latitude, longitude } = position.coords;
      resolve({ latitude, longitude });
    };

    const showError = (error) => reject(error);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
      reject(new Error("Geolocation is not supported by this browser."));
    }
  });

/*
 * Function that fetches the coordinates
 * of the challenge
 */
const getChallengeCoordinates = async () => {
  let urlNum = window.location.pathname.split("/")[2];

  const response = await fetch(`http://127.0.0.1:8000/json/${urlNum}/`, {
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
  });

  const data = await response.json();
  let [latitude, longitude] = data.coordinates.split(",");

  // convert latitude and longitude to floats
  latitude = parseFloat(latitude);
  longitude = parseFloat(longitude);

  return { latitude, longitude };
};

/*
 * Function that calculates the distance
 * between two coordinates
 * Source: https://stackoverflow.com/a/27943/12327909
 */
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const radius = 6371; // Radius of the earth in km
  const distanceLat = deg2rad(lat2 - lat1); // deg2rad below
  const distanceLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(distanceLat / 2) * Math.sin(distanceLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(distanceLon / 2) *
      Math.sin(distanceLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = radius * c; // Distance in km

  return distance;
};

/*
 * Function that converts degrees to radians
 * Source: https://stackoverflow.com/a/27943/12327909
 */
const deg2rad = (deg) => deg * (Math.PI / 180);

/*
 * Function that toggles a loading spinner
 * overlay on the page
 */
const toggleLoadingSpinner = () => {
  if (document.querySelector(".overlay")) {
    document.querySelector(".overlay").remove();
  } else {
    // create overlay
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");

    // spinner container
    const spinnerContainer = document.createElement("div");
    spinnerContainer.classList.add("spinner-container");

    // create spinner
    const spinner = document.createElement("div");
    spinner.classList.add("spinner");

    // spinner text
    let spinnerText = document.createElement("p");
    spinnerText.classList.add("spinner-text");
    spinnerText.innerText = "Checking your location";

    setInterval(() => {
      if (spinnerText.innerText == "Checking your location...") {
        spinnerText.innerText = "Checking your location";
      } else {
        spinnerText.innerText += ".";
      }
    }, 500);

    // append spinner to spinner container
    spinnerContainer.appendChild(spinner);

    // append spinner text to spinner container
    spinnerContainer.appendChild(spinnerText);

    // append spinner to overlay
    overlay.appendChild(spinnerContainer);

    // append overlay to body
    document.body.appendChild(overlay);
  }
};
