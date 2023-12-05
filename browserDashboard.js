/* ----------------------------------------------------------------------
  GLOBAL VARs
/ --------------------------------------------------------------------- */
// Time
const lastRunTimestamp = localStorage.getItem('lastRunTimestamp');
const currentTime = new Date().getTime();
// Weather
const weatherBox = document.getElementById("weather");
const loadingSpinner = document.getElementById("loader");
// Notes
const textarea = document.getElementById('textarea');
const statusText = document.getElementById('status');
// Unsplash
const unsplashContainer = document.getElementById("unsplash-container");

/* ----------------------------------------------------------------------
  TIMEFRAME
  - FUNCTION FOR RUNNING CERTAIN FUNCTIONS ONLY ONCE DURING GIVEN TIMEFRAME
  - USED LATER FOR GETTING QUOTE AND BACKGROUND PICTURE.
/ --------------------------------------------------------------------- */
function runOnceInTimeFrame(timeFrame, ...functions) {
  if (!lastRunTimestamp || (currentTime - lastRunTimestamp) > timeFrame) {
    for (const singleFunction of functions) {
      singleFunction();
    }
    localStorage.setItem('lastRunTimestamp', currentTime);
  } else {
    // Quote
    const currentQuote = localStorage.getItem("currentQuote");
    const currentAuthor = localStorage.getItem("currentAuthor");
    document.getElementById("quote").innerHTML = 
        `<div>"${currentQuote}" -<span>${currentAuthor}</span></div>`;
    // Unsplash
    const currentBackground = localStorage.getItem("currentBackground");
    const currentBackgroundLocation = localStorage.getItem("currentBackgroundLocation");
    const currentBackgroundAuthor = localStorage.getItem("currentBackgroundAuthor");
    document.body.style.backgroundImage = `url(${currentBackground})`;
    unsplashContainer.innerHTML =
      `
      <div class="location">${currentBackgroundLocation}</div>
      <div class="author">by: ${currentBackgroundAuthor}</div>
      <div id="unsplash-logo">Powered by Unsplash <i class="fa-brands fa-unsplash"></i></div>
      `
  }
}

/* ----------------------------------------------------------------------
  UNSPLASH RANDOM BACKGROUND API
/ --------------------------------------------------------------------- */ 
async function getBackground() {
    const unsplashApiKey = "p7H3LtMj-Y4yZ4Y4I5nO0EBPhmHIb0P6428AJ8AzTF8";
    try {
      const response = await fetch(`https://api.unsplash.com/photos/random/?client_id=${unsplashApiKey}&orientation=landscape&query=landscape&count=1`)
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
      const data = await response.json();

      document.body.style.backgroundImage = `url(${data[0].urls.full})`

      // EXTRACTING PICTURE LOCATION
      function pictureLocation() {
        const location = data[0].location;

        if (location.name) {
          return location.name;
        } else if (location.city && location.country) {
          return `${location.city}, ${location.country}`;
        } else if (location.country) {
          return location.country;
        } else {
          return "Somewhere in the World";
        }
      }   

      const unsplashLocation = pictureLocation();

      unsplashContainer.innerHTML = 
        `
          <div class="location">${unsplashLocation}</div>
          <div class="author">by: ${data[0].user.name}</div>
          <div id="unsplash-logo">Powered by Unsplash <i class="fa-brands fa-unsplash"></i></div>
        `

      localStorage.setItem("currentBackground", data[0].urls.full);
      localStorage.setItem("currentBackgroundAuthor", data[0].user.name);
      localStorage.setItem("currentBackgroundLocation", unsplashLocation);
  
    }
    catch (error) {
      document.body.style.backgroundImage = 
      `url(unsplashOfflinePhoto.jpg)`
      
      unsplashContainer.innerHTML = 
        `
          <div class="location">Yili, Xinjiang, China</div>
          <div class="author">by: Qingbao Meng</div>
          <div id="unsplash-logo">Powered by Unsplash <i class="fa-brands fa-unsplash"></i></div>
        `
    }
  }

runOnceInTimeFrame(600000, getQuote, getBackground);

/* ----------------------------------------------------------------------
  CURRENT TIME
/ --------------------------------------------------------------------- */
function getCurrentTime() {
    const date = new Date();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    document.getElementById("time").innerHTML = 
        `
        <div>${timeString}</div>
        <div id="neflakejse">Do Something!</div>
        `
}
setInterval(getCurrentTime, 1000);
  
/* ----------------------------------------------------------------------
  RANDOM QUOTE API
/ --------------------------------------------------------------------- */
  async function getQuote() {
    try {
      const response = await fetch('https://api.quotable.io/random');
      const data = await response.json();
      
      // Store the current quote in localStorage
      localStorage.setItem("currentQuote", data.content);
      localStorage.setItem("currentAuthor", data.author);
      // Display the quote in the HTML
      document.getElementById("quote").innerHTML = 
          `<div>"${data.content}" -<span>${data.author}</span></div>`;
    } catch (error) {
      document.getElementById("quote").innerHTML = 
          `<div>"Today is a good day" -<span>Unknown</span></div>`;
    }
  }
  
/* ----------------------------------------------------------------------
  LOCATION API
  -  GET MY LOCATION NAME 
  -  NAVIGATOR.GEOLOCATION METHOD AND METEOSOURCE API DONT PROVIDE NAME OF USERS CITY, SO IPINFO API IS USED FOR THIS...
/ --------------------------------------------------------------------- */
  async function getMyLocationName() {
      try {
        const response = await fetch("https://ipinfo.io/json?token=4a336a71a0a9c6");
        if (!response.ok) {
          throw new Error("Failed to fetch IP information");
        }
        const data = await response.json();
        document.getElementById("location").innerHTML = `<p id="location-name"><i class="fa-solid fa-location-dot"></i></i> ${data.city} / ${data.country}</p>`
      } 
      catch (error) {
        console.error("Error:", error);
      }
    }
  getMyLocationName();
  
  // THIS FUNCTION EXTRACTS THE DAY NAME OF THE GIVEN DATE. ITS USED LATER IN GETWEATHER FUNCTION TO SHOW THE DAY INSTEAD OF THE DATE
  function getDayOfWeek(currentDate) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
    const date = new Date(currentDate);
    const dayOfWeekNumber = date.getDay();
    const dayOfWeek = daysOfWeek[dayOfWeekNumber];
    
    return dayOfWeek;
  }

/* ----------------------------------------------------------------------
  WEATHER API
/ --------------------------------------------------------------------- */  
// FETCHING WEATHER FROM METEOSOURCE AND DISPLAYING IT
// - THIS TIME USING .THEN BLOCKS BECAUSE THERE IS NAVIGATOR.GEOLOCATION METHOD INCLUDED INSIDE THE FUNCTION AND IT WOULD BE DIFFICULT TO USE IT INSIDE ASYNC FUNCTION
  function getWeather() {
      navigator.geolocation.getCurrentPosition(position => {
          fetch(`https://www.meteosource.com/api/v1/free/point?lat=${position.coords.latitude}&lon=${position.coords.longitude}&sections=current,daily&timezone=auto&language=en&units=metric&key=9h95mpw1iybim49gew8e37s7kdxete5ew9wuplfx`)    
              .then(response => {
                  if (!response.ok) {
                      throw Error("Weather data not available");
                  }
                  return response.json();
              })
              .then(data => {
                  
                  const forecast = data.daily.data.map(function(day,index) {
                      // Retrieve the day of the week out of the date string provided by API ("2023-11-23" > Thursday). 
                      // First two days are changed to "today" and "tommorow" using index and ternary operator.
                      const dayOfWeek = index === 0 ? "Today" : (index === 1 ? "Tomorrow" : getDayOfWeek(day.day));
  
                  
                      return `<div class="day-of-week-box" title="${day.summary}">
                                  <div class="day-of-week">${dayOfWeek}</div>
                                  <div>${Math.floor(day.all_day.temperature_min)} / 
                                  ${Math.floor(day.all_day.temperature_max)} °C </div>
                                  <img src="icons/set01/small/${day.icon}.png" alt="icon representing the weather"/> 
                              </div>`;
                  });
  
                  weatherBox.style.backdropFilter = "blur(2px)";
                  weatherBox.innerHTML = `${forecast.join("")}`;
                  weatherBox.innerHTML += 
                    `
                     <p id="meteosource">by MeteoSource ☀️</p>`;
                  
                     loadingSpinner.style.display = "none";
          
              })
              .catch(error => weatherBox.innerHTML = "Weather data currently not available :(");
              loadingSpinner.style.display = "none";
      });
  }

  getWeather();

/* ----------------------------------------------------------------------
  NOTES
/ --------------------------------------------------------------------- */
let savedText = localStorage.getItem('text');
  if (savedText) {
    textarea.value = savedText;
  }
  
  function save() { 
  // Save the contents of the textarea...
    console.log(textarea.value);
    localStorage.setItem('text', textarea.value);
    statusText.innerHTML = `<div>Saved <i class="fa-regular fa-circle-check"></i></div>`
  }
  
  let timeout; textarea.addEventListener('input', () => {
    statusText.innerHTML= `<div>Unsaved changes...</div>`
    clearTimeout(timeout);
    timeout = setTimeout(save, 1000);
  });


   
