document.addEventListener('DOMContentLoaded', () => {
    const countrySelect = document.getElementById('country-select');
    const spinner = document.getElementById('spinner-container');
    const dataName = document.getElementById('data-name');
    const dataOfficialName = document.getElementById('data-official-name');
    const dataCapital = document.getElementById('data-capital');
    const dataLanguage = document.getElementById('data-language');
    const dataMap = document.getElementById('data-map');
    const dataPopulation = document.getElementById('data-population');
    const dataFlag = document.getElementById('data-flag');
    const dataLatLng = document.getElementById('data-latlng');
    const dataRain = document.getElementById('data-rain');
    const dataTemp = document.getElementById('data-temp');
  
    const allDataCells = [
      dataName, dataOfficialName, dataCapital, dataLanguage,
      dataMap, dataPopulation, dataFlag, dataLatLng, dataRain, dataTemp
    ];
  
    countrySelect.addEventListener('change', handleCountrySelect);
  
    async function handleCountrySelect() {
      const countryName = countrySelect.value;
      if (countryName === '--select--') {
        clearTable();
        return;
      }
  
      try {
        clearTable();
        spinner.style.display = 'flex';
        const countryData = await fetchCountryData(countryName);
        const lat = countryData.capitalInfo.latlng[0];
        const lon = countryData.capitalInfo.latlng[1];
        const weatherData = await fetchWeatherData(lat, lon);
        const totalRain = calculateSum(weatherData.hourly.rain);
        const avgTemp = calculateAverage(weatherData.hourly.temperature_2m);
        displayData(countryData, weatherData, totalRain, avgTemp);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch country data. Please try again.');
      } finally {
        spinner.style.display = 'none';
      }
    }
    async function fetchCountryData(countryName) {
      const api_url = `https://restcountries.com/v3.1/name/${countryName.toLowerCase()}`;
      const response = await fetch(api_url);
      if (!response.ok) {
        throw new Error(`Country API request failed: ${response.statusText}`);
      }
      const data = await response.json();
      return data[0];
    }

    async function fetchWeatherData(lat, lon) {
      const api_url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,rain&forecast_days=1`;
      const response = await fetch(api_url);
      if (!response.ok) {
        throw new Error(`Weather API request failed: ${response.statusText}`);
      }
      return await response.json();
    }

    function displayData(country, weather, totalRain, avgTemp) {
      dataName.textContent = country.name.common;
      dataOfficialName.textContent = country.name.official;
      dataCapital.textContent = country.capital[0];
      dataLanguage.textContent = Object.values(country.languages).join(', ');
      dataMap.innerHTML = `<a href="${country.maps.googleMaps}" target="_blank">View on Map</a>`;
      dataPopulation.textContent = country.population.toLocaleString(); 
      dataFlag.innerHTML = `<img src="${country.flags.png}" alt="Flag of ${country.name.common}" width="100">`;
      dataLatLng.textContent = `${country.capitalInfo.latlng[0]}, ${country.capitalInfo.latlng[1]}`;
      dataRain.textContent = `${totalRain.toFixed(1)} mm`; 
      dataTemp.textContent = `${avgTemp.toFixed(1)} °C`; 
    }
  
    function clearTable() {
      allDataCells.forEach(cell => {
        cell.innerHTML = ''; 
      });
    }
    function calculateSum(arr) {
      return arr.reduce((acc, val) => acc + val, 0);
    }
  
    function calculateAverage(arr) {
      const sum = arr.reduce((acc, val) => acc + val, 0);
      return sum / arr.length;
    }
  });