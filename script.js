import { apiKey } from "./cred.js"

$(document).ready(function() {
    localStorage.setItem("apiKey", apiKey)
    
    $("#startSearchBtn").click(function() {
        addLoading()
        $("#startCard").css("display", "none")
        $("#startCard p").remove()
        searchCity($("#startSearchInput"))
    })

    $("#searchBtn").click(function() {
        addLoading()
        searchCity($("#searchInput"))
    })
    //console.log(new Date().toISOString().slice(0,13))

    $("#nextDays .fd-col").click(function() {
        let h2 = $(this).children("div:first").text()
        $("#hourlyWeather").css("display", "flex")
        $("#hourlyWeather h2").text(h2)
    })

    $("#hourlyWeather i").click(function() {
        $("#hourlyWeather").css("display", "none")
    })

    /*$("#weatherImg").click(function() {
        $("#nextDays").css("display", "flex")
    })*/

    /*$("#wrapper").click(function() {
        setTimeout(() => {
            $("#weatherCard").css("display", "flex")
            removeLoading()
        },3000)
    })*/

    
})

function addLoading(status) {
    /*if(status === "success") {
        setTimeout(removeLoadingSuccess, 2000)
    } else {
        setTimeout(removeLoadingFailed, 2000)
    }*/
    
    $("#wrapper").css("display", "grid")
    for(let i = 0; i < 3; i++) {
        $("<li/>", {
            class: "ball"
        }).appendTo(".loader")
    }
}

function removeLoadingSuccess() {
    $("#weatherCard").css("display", "flex")
    $("#wrapper").css("display", "none")
    $(".loader").empty()
}

function removeLoadingFailed() {
    $("#weatherCard").css("display", "none")
    $("#startCard").css("display", "flex")
    $("<p/>", {
        text: "Nessun risultato"
    }).appendTo("#startCard")
    $("#wrapper").css("display", "none")
    $(".loader").empty()
}

function searchCity(input) {
    let city = input.val()
    input.val("")
    const options = {method: 'GET', headers: {accept: 'application/json'}};

    fetch(`https://api.tomorrow.io/v4/weather/forecast?location=${city}&apikey=${localStorage.getItem("apiKey")}`, options)
    .then(handleErrors)
    .then(response => response.json())
    .then(response => {
        //responseJson = response
        console.log(response)
        $("#info1 p:first span").text(capitalize(city))
        console.log(response.timelines.hourly[0].time.slice(0,13))
        //response.timelines.hourly
        
        let timeToFind = new Date()
        timeToFind = getCurrentTimeIso(timeToFind).slice(0,13)

        const pos = binarySearch(timeToFind, response.timelines.hourly)

        /*console.log("Temp:" + Math.round(response.timelines.hourly[pos].values.temperature) + "°C")
        console.log("Rain prob:" + Math.round(response.timelines.hourly[pos].values.precipitationProbability) + "%")
        console.log("Humidity:" + Math.round(response.timelines.hourly[pos].values.humidity) + "%")
        console.log("Wind speed:" + Math.round(response.timelines.hourly[pos].values.windSpeed))*/

        $("#currentTemperature").text(Math.round(response.timelines.hourly[pos].values.temperature) + "°C")
        $("#currentRainProb").text(Math.round(response.timelines.hourly[pos].values.precipitationProbability) + "%")
        $("#currentHumidity").text(Math.round(response.timelines.hourly[pos].values.humidity) + "%")
        $("#currentWindSpeed").text(Math.round(response.timelines.hourly[pos].values.windSpeed))
        let weatherCode = response.timelines.hourly[pos].values.weatherCode
        $("#weatherImg").attr("src", getCurrentWeatherFromCode(weatherCode))
        $("#currentDay").text(getCurrentDayFormatted())
        /*updateNextDaysDate()
        getNextDaysTemperature(response)
        getNextDaysWeatherImage(response)*/
        getNextDaysInfo(response)
        removeLoadingSuccess()
        populateNextDays(response)
        console.log(timeToFind.slice(0,10))
    })
    .catch(error => {
        removeLoadingFailed()
        console.error("Error : " + error)
        throw new Error
    })
}

function handleErrors(response) {
    if (!response.ok) {
      console.log('ERROR: ' + response)
      throw Error(response.statusText)
    }
    return response
  }

function binarySearch(num, arr) {
    if(!Array.isArray) {
        return -1
    }
    let start = 0
    let end = arr.length - 1
    while(start <= end) {
        let mid = Math.floor((start + end) / 2)
        if(arr[mid].time.slice(0,13) === num) {
            return mid
        }
        if(arr[mid] < num) {
            start = mid + 1
        } else {
            end = mid - 1
        }
    }
    return -1
}


//GET TIME IN ISO FORMAT AND WITH TIMEZONE OFFSET

function getCurrentTimeIso(date) {
    var tzo = -date.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function(num) {
            return (num < 10 ? '0' : '') + num;
        };
  
    return date.getFullYear() +
        '-' + pad(date.getMonth() + 1) +
        '-' + pad(date.getDate()) +
        'T' + pad(date.getHours()) +
        ':' + pad(date.getMinutes()) +
        ':' + pad(date.getSeconds()) +
        dif + pad(Math.floor(Math.abs(tzo) / 60)) +
        ':' + pad(Math.abs(tzo) % 60);
}


//GET CURRENT DATE WITH LONG ITALIAN FORMAT

function getCurrentDayFormatted() {

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    }
    
    return capitalize(new Date().toLocaleString("it-IT", options))
    
}

function getNextDaysFormatted(offset) {
    const options = {
        weekday: "short",
        day: "numeric"
    }

    return capitalize(new Date(Date.now() + offset * 24 * 60 * 60 * 1000).toLocaleString("it-IT", options))
}
    
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}



function getCurrentWeatherFromCode(code) {
    
    let weatherIcon = ""

    switch(code) {
        case 1000 : 
        case 1100 :
            if(new Date().getHours() < "19") {
                weatherIcon = "img/sunny.png"
            } else {
                weatherIcon = "img/night.png"
            }
            break;
        case 1101 :
            if(new Date().getHours() < "19") {
                weatherIcon = "img/fewCloudsDay.png"
            } else {
                weatherIcon = "img/fewCloudsNight.png"
            }
            break;
        case 1101 :
        case 1102 :
        case 1001 :
            weatherIcon = "img/cloudy.png" 
            break;
        case 2000 :
        case 2100 :
            weatherIcon = "img/foggy.png"
            break;
        case 4000 :
        case 4001 :
        case 4200 :
        case 4201 :
            weatherIcon = "img/rainy.png"
            break;
        case 5000 :
        case 5001 :
        case 5100 :
        case 5101 :
            weatherIcon = "img/snowy.png"
            break;
        case 6000 :
        case 6001 :
        case 6200 :
        case 6201 :
            weatherIcon = "img/freezingRain.png"
            break;
        case 7000 :
        case 7101 :
        case 7102 :
            weatherIcon = "img/hail.png"
            break;
        case 8000 :
            weatherIcon = "img/thunderstorm.png"
            break;
        default :
            weatherIcon = "img/question-mark.png"
    }
    
    return weatherIcon
}

function getNextDaysInfo(response) {
    let nextDaysCount = 4
    for(let i = 1; i < nextDaysCount + 1; i++) {
        updateNextDaysDate(i)
        getNextDaysTemperature(response, i)
        getNextDaysWeatherImage(response, i)
    }
    getNextDaysWeatherImage(response, 0)
    getNextDaysTemperature(response, 0)
}

function updateNextDaysDate(i) {
    //nextDaysCount = 4
    //for(let i = 1; i < nextDaysCount + 1; i++) {
        $(`#nextDays div:nth-of-type(${i + 1}) div:nth-of-type(1)`).text(getNextDaysFormatted(i))
    //}
}

function getNextDaysTemperature(response, i) {
    //nextDaysCount = 4
    //for(let i = 1; i < nextDaysCount + 1; i++) {
        $(`#nextDays div:nth-of-type(${i + 1}) div:nth-of-type(2)`).text(`${Math.round(response.timelines.daily[i].values.temperatureMin)}°/${Math.round(response.timelines.daily[i].values.temperatureMax)}°`)
    //}
}

function getNextDaysWeatherImage(response, i) {
    //nextDaysCount = 4
    //for(let i = 1; i < nextDaysCount + 1; i++) {
        let weatherCode = getCurrentWeatherFromCode(response.timelines.daily[i].values.weatherCodeMin)
        if(weatherCode === "img/night.png") {
            weatherCode = "img/sunny.png"
        }
        if(weatherCode === "img/fewCloudsNight.png") {
            weatherCode = "img/fewCloudsDay.png"
        }
        $(`#nextDays div:nth-of-type(${i + 1}) img`).attr("src", weatherCode)
    //}
}

function populateNextDays(response) {

}




/*async function fetchWeather() {
    let city = input.val()
    input.val("")

    const options = {method: 'GET', headers: {accept: 'application/json'}};

    const response = await fetch(`https://api.tomorrow.io/v4/weather/forecast?location=${city}&apikey=woOktjIkxO80AhN99nSqdCTk5iRp4oW3`, options)

    return response.json()
}*/
