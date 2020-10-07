$(document).ready(function() {

    let previousArr = JSON.parse(localStorage.getItem("previous")) || [];;
    if (previousArr.length > 0) {
        for (let i = 0; i < previousArr.length; i++) {
            createListItem(previousArr[i]);
        }; 
        getWeather(previousArr[previousArr.length -1])
    };

    // On-Click Functions 

    // configure on click to getWeather and subsequently five day forecast etc. based on cityVal in search box
    $("#cityBtn").on("click", function(){
        let cityInput = $("#cityInput").val();

        // clear cityInput box 
        $("#cityInput").val("");

        getWeather(cityInput);
    });

    // configure ability to press previous list items and have that search for that city weather
    $("#previous").on("click", "li", function() {
        getWeather($(this).text());
    });

    
    // Functions
    function createListItem(city) {
        let listItem = $("<li>");
        listItem.addClass("list-group-item list-group-item-action").text(city);
        $("#previous").append(listItem);
    }; 


    function getWeather(cityInput) {
        let apiKey     = "&appid=abc55e6cb263d661248d6c9673c54a5b";
        let currentURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityInput + apiKey;
        // ajaxCall for current weather based on search cityInput             
        $.ajax({
            url: currentURL,
            method: "GET"
        }).done(function(response) {
            // assign variables from endpoint response
            let resTempK         = response.main.temp;
            let resTemp          = Math.round(((resTempK - 273.15) * 9/5 + 32));
            let resHumidity      = response.main.humidity;
            let resWindSpeed     = response.wind.speed;
            let resCityName      = response.name;
            let weatherIcon      = response.weather[0].icon;
            let lat              = response.coord.lat;
            let long             = response.coord.lon;

            // create list item for the search within "#previous section" by calling createListItem function

            if (previousArr.indexOf(cityInput) === -1) {
                previousArr.push(cityInput);
                window.localStorage.setItem("previous", JSON.stringify(previousArr));

                // call function to create a list item on the list group ("#previous")
                createListItem(cityInput);
            };

            // create html for current city weather
            let curDiv      = $("#curWeatherDiv");
            // clear weather for "#curWeatherDiv"
            curDiv.empty();
            // create html for current city weather
            let card        = $("<div>").addClass("card");
            let cityTitle   = $("<h4>").addClass("card-title").text(resCityName + " (" + new Date().toLocaleDateString() + ") ");
            let curCardBody = $("<div>").addClass("card-body").attr("id", "curCardBody");

            let temp        = $("<p>").addClass("card-text").text("Temperature: " + resTemp + " deg. F");
            let windSpeed   = $("<p>").addClass("card-text").text("Wind Speed: " + resWindSpeed + " MPH");
            let humdity     = $("<p>").addClass("card-text").text("Humidity: " + resHumidity + "%");
            let cardImg     = $("<img>").attr("src", "http://openweathermap.org/img/w/" + weatherIcon + ".png");

            // append to page 
            curDiv.append(card);
            cityTitle.append(cardImg);
            curCardBody.append(cityTitle, temp, windSpeed, humdity);
            card.append(curCardBody);

            // additional ajaxCalls 
            getFiveDayForecast(cityInput);
            getUVIndex(lat, long);
        
        });
    };

    function getFiveDayForecast(cityInput) {
        // ajaxCall for five day weather forecast based on search input value
        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/forecast?q="+ cityInput + "&appid=abc55e6cb263d661248d6c9673c54a5b",
            method: "GET"
        }).done(function(response) {
            // look for forecasts for 6:00pm each day as defined in endpoint
            // assign= Div for fiveDayWeather to variable and empty upon new search
            let fiveDayDiv  = $("#fiveDayWeather");
            fiveDayDiv.empty();
            for (i = 0; i < response.list.length; i++) {
                if (response.list[i].dt_txt.indexOf("18:00:00") !== -1) {
                    let maxTempK    = response.list[i].main.temp_max;
                    let maxTemp     = Math.round(((maxTempK - 273.15) * 9/5 + 32));
                    let humidity    = response.list[i].main.humidity;

                    // create html for bootstrap card (there will be five total)
                    let col         = $("<div>").addClass("col-md-2");
                    let card        = $("<div>").addClass("card border-dark mb-3 ml-2")
                    let cardBody    = $("<div>").addClass("card-body p-2");
                    
                    let cardTitle   = $("<h6>").addClass("card-title").text(new Date(response.list[i].dt_txt).toLocaleDateString());
                    let cardImg     = $("<img>").attr("src", "http://openweathermap.org/img/w/" + response.list[i].weather[0].icon + ".png");

                    let lineOne     = $("<p>").addClass("card-text").text("Temp: " + maxTemp + " F");
                    let lineTwo     = $("<p>").addClass("card-text").text("Humidity: " + humidity + "%");

                    // append to page 
                    fiveDayDiv.append(col);
                    col.append(card);
                    card.append(cardBody);
                    cardBody.append(cardTitle, cardImg, lineOne, lineTwo);
                    
                };
            }

        });

    };

    function getUVIndex(lat,long) {
        let curCardBody = $("#curCardBody");
        let latitude  = "?lat=" + lat;
        let longitude = "&lon=" + long;
        // ajaxCall to get UV index based on coordinates 
        $.ajax({
            url: "http://api.openweathermap.org/data/2.5/uvi" + latitude + longitude + "&appid=abc55e6cb263d661248d6c9673c54a5b",
            method: "GET"
        }).done(function(response) {
            // create html for UV Index and associated button with UV Value
            let UVIndex = $("<p>");
            UVIndex.text("UV Index: ");
            let span    = $("<span>");
            span.addClass("btn bt-sm").attr("id", "uvBtn").text(response.value);
            let UVValue = span.text();

            // append to page 
            curCardBody.append(UVIndex.append(span));

            // modify color of UV button based on its returned value
            if (UVValue < 3) {
                span.addClass("btn-success")
            } else if (UVValue > 6) {
                span.addClass("btn-danger");
            } else span.addClass("btn-warning");
        });
    };
    
}); // end document.ready function
    