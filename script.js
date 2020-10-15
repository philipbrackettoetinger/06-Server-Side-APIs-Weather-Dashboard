// Variable for the searched city
var city = "";

// Variables for conditions
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var clearButton = $("#clear-history");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidity = $("#humidity");
var currentWSpeed = $("#wind-speed");
var currentUvIndex = $("#uv-index");
var storedCity = [];

// Searches for city in the storage entries
function find (town) {
    for (var i = 0; i < storedCity.length; i++) {
        if (town.toUpperCase()===storedCity[i]) {
            return -1;
        }
    }
    return 1;
}

// Setup the API key
var apiKey = "f5f219508297940ebc49c5f89a410f0f";


// Display the curent and future weather to the user after grabing the city from the input text box.
function displayWeather(event){
    event.preventDefault();
    if(searchCity.val().trim()!==""){
        city = searchCity.val().trim();
        currentWeather(city);
    }
}

// Create the AJAX call that will retrieve information
function currentWeather(city){
    // Identify the URL so that we can retrieve information from the internet/server side
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey;
    $.ajax({
        url: queryURL,
        method: "Get",
    }).then(function(response){

        // Parse the response to display current weather including the city name, date and the weather icon
        // console.log(response);

        // Obtain a data object from the server side/internet for Icon property
        // var weatherIcon = response.weather[0].icon;
        // var iconURL = "https://openweathermap.org/img/wn/" + weatherIcon + "@2x.png";

        // Date format method is from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
        var date = new Date(response.dt*1000).toLocaleDateString();
        console.log(date);
        console.log(response);
        $("#current-city").html(response.name + " " + date);

        // Parse the response for name of city and link the date/icon
        // $(currentCity).html(response.name + "(" + date + ")" + "<img src =" + iconURL + ">");

        // Parse the response to display the current temp (convert temp to fahrenheit)
        var tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(currentTemperature).html((tempF).toFixed(2) + "&#8457");

        // Display the humidity
        $(currentHumidity).html(response.main.humidity + "%")

        // Display wind speed and convert to mph
        var windSpeed = response.wind.speed;
        var windMPH = (windSpeed*2.237).toFixed(1)
        $(currentWSpeed).html(windMPH + "MPH");

        // Display the UVIndex by geographic coordinate method and using app id and coords as a parameter build query URL inside the function below
        UVIndex(response.coord.lon,response.coord.lat);
        forecast(response.name);
        if (response.cod==200){
            storedCity=JSON.parse(localStorage.getItem("cityname"));
            // console.log(storedCity);
            if (storedCity==null){
                storedCity = [];
                storedCity.push(city.toUpperCase());
                localStorage.setItem("cityname",JSON.stringify(storedCity));
                addToList(city);
            }
            else {
                if(find(city)>0){
                    storedCity.push(city.toUpperCase());
                    localStorage.setItem("cityname",JSON.stringify(storedCity));
                    addToList(city);
                }
            }
        }
    });
}

// Function that returns the UVIndex response
function UVIndex(ln,lt){
    // Build the URL for UVIndex
    var uvqURL = "https://api.openweathermap.org/data/2.5/uvi?lat=" + lt + "&lon=" + ln + "&appid=" + apiKey;
    $.ajax({
        url: uvqURL,
        method: "Get",
    }).then(function(response){
        $(currentUvIndex).html(response.value);
    });
}

// Display the 5 day forecast for current city
function forecast(city){
    // var dayOver = false;
    var queryforcastURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=" + apiKey;
    $.ajax({
        url: queryforcastURL,
        method: "Get",
    }).then(function(response){
        for (i=0; i<5; i++){
            var date = new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            var iconcode = response.list[((i+1)*8)-1].weather[0].icon;
            var iconurl = "https://openweathermap.org/img/wn/" + iconcode + ".png";
            var tempK= response.list[((i+1)*8)-1].main.temp;
            var tempF=(((tempK-273.5)*1.80)+32).toFixed(2);
            var humidity= response.list[((i+1)*8)-1].main.humidity;

            $("#fDate"+i).html(date);
            $("#fImg"+i).html("<img src="+iconurl+">");
            $("#fTemp"+i).html(tempF+"&#8457");
            $("#fHumidity"+i).html(humidity+"%");
        }
        console.log(response)
        
    });
}

// Add the city to the search history
function addToList(c){
    var listEl= $("<li>"+c.toUpperCase()+"</li>");
    $(listEl).attr("class","list-group-item");
    $(listEl).attr("data-value",c.toUpperCase());
    $(".list-group").append(listEl);
}

// Display conditions for city when selected from search history
function invokePastSearch(event){
    var liEl=event.target;
    if (event.target.matches("li")){
        city=liEl.textContent.trim();
        currentWeather(city);
    }
}

// Render function
function loadlastCity(){
    $("ul").empty();
    var sCity = JSON.parse(localStorage.getItem("cityname"));
    if(sCity!==null){
        sCity=JSON.parse(localStorage.getItem("cityname"));
        for(i=0; i<sCity.length;i++){
            addToList(sCity[i]);
        }
        city=sCity[i-1];
        currentWeather(city);
    }
}

//Clear the search history from the page
function clearHistory(event){
    event.preventDefault();
    sCity=[];
    localStorage.removeItem("cityname");
    document.location.reload();
}

//Click Handlers
$("#search-button").on("click",displayWeather);
$(document).on("click",invokePastSearch);
$(window).on("load",loadlastCity);
$("#clear-history").on("click",clearHistory);
