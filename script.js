const cityInput = document.getElementById('cityInput')
const searchBtn = document.getElementById('searchBtn')

// Convert weather code from API into something users can read
function getWeatherInfo(code){

    const weatherCodes = {
        0:['☀','Clear sky'],
        1:['⛅','Partly cloudy'],
        2:['⛅','Partly cloudy'],
        3:['⛅','Partly cloudy'],
        45:['🌫','Foggy'],
        48:['🌫','Foggy'],
        51:['🌦','Drizzle'],
        53:['🌦','Drizzle'],
        55:['🌦','Drizzle'],
        61:['🌧','Rain'],
        63:['🌧','Rain'],
        65:['🌧','Rain'],
        71:['❄','Snow'],
        73:['❄','Snow'],
        75:['❄','Snow'],
        80:['🌦','Rain showers'],
        81:['🌦','Rain showers'],
        82:['🌦','Rain showers'],
        95:['⛈','Thunderstorm']
    }

    return weatherCodes[code] || ['☀','Clear sky']
}

// Get latitude and longitude from city name
async function getCoordinates(city){

    const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`
    )

    const data = await res.json()

    if(!data.results){
        throw new Error('City not found')
    }

    return data.results[0]
}

// Fetch weather using coordinates
async function getWeather(lat, lon){

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,uv_index&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`
    const res = await fetch(url)

    return await res.json()
}

// Update the page with weather data
function showWeather(weatherData, cityName, country){

    const current = weatherData.current
    const weather = getWeatherInfo(current.weather_code)

    document.getElementById('weatherIcon').textContent = weather[0]
    document.getElementById('description').textContent = weather[1]

    document.getElementById('cityName').textContent =
        country ? `${cityName}, ${country}` : cityName

    document.getElementById('temperature').textContent =
        `${current.temperature_2m}°C`

    document.getElementById('humidity').textContent =
        current.relative_humidity_2m + '%'

    document.getElementById('wind').textContent =
        current.wind_speed_10m + ' km/h'

    document.getElementById('uv').textContent =
    current.uv_index

    const forecastDiv = document.getElementById('forecast')
    forecastDiv.innerHTML = ''

    // Create 5 forecast rows
    for(let i = 0; i < 5; i++){

        const day = new Date(weatherData.daily.time[i])
        .toLocaleDateString('en-US',{weekday:'long'})

        const icon =
        getWeatherInfo(weatherData.daily.weather_code[i])[0]

        const row = document.createElement('div')

        row.className = 'forecast-row'

        row.innerHTML = `
            <span>${day}</span>
            <span>${icon}</span>
            <span>${weatherData.daily.temperature_2m_max[i]}° / ${weatherData.daily.temperature_2m_min[i]}°</span>
        `

        forecastDiv.appendChild(row)
    }
}

// Search weather when user enters a city
async function searchWeather(){

    const city = cityInput.value.trim()

    if(city === '') return

    document.getElementById('loading').textContent = 'Loading...'

    try{

        const location = await getCoordinates(city)

        const weatherData = await getWeather(
            location.latitude,
            location.longitude
        )

        showWeather(
            weatherData,
            location.name,
            location.country
        )

        document.getElementById('error').textContent = ''

    }catch(err){

        document.getElementById('error').textContent =
            err.message
    }

    document.getElementById('loading').textContent = ''
}

// Automatically load local weather when page opens
window.addEventListener('load', () => {

    if(navigator.geolocation){

        navigator.geolocation.getCurrentPosition(

    async (position) => {

        const lat = position.coords.latitude
        const lon = position.coords.longitude

        const weatherData =
            await getWeather(lat, lon)

        showWeather(
            weatherData,
            'Current Location'
        )
    },

    () => {

        document.getElementById('error').textContent =
            'Location access denied. Please search for a city.'

    }

)
    }
})

searchBtn.addEventListener('click', searchWeather)

cityInput.addEventListener('keypress', function(e){

    if(e.key === 'Enter'){
        searchWeather()
    }

})
