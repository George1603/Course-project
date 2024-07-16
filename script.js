import { CountryAPI } from './CountryAPI.js';
import { HolidaysAPI } from './HolidaysAPI.js';

const tabsBtn = document.querySelectorAll(".tabs__nav-btn");
const tabsItems = document.querySelectorAll(".tabs__item");
const startDayInput = document.querySelector('#startDay');
const endDayInput = document.querySelector('#endDay');
const presetSelect = document.querySelector('#preset');
const dayOptionsSelect = document.querySelector('#dayOptions');
const calcOptionsSelect = document.querySelector('#calcOptions');
const calcButton = document.querySelector('.calcBTN button');
const resultTable = document.querySelector('.book-list');
const deleteButton = document.querySelector('.deleteAllResults');
const secondTab = document.querySelector('#tab_2_btn');
const selectElement = document.querySelector('#countryOption');
const yearOptionInput = document.querySelector('#yearOptionInput');
const getHolidaysBTN = document.querySelector('.getHolidaysBTN button');
const holidaysListBody = document.querySelector('.holidays-list');

tabsBtn.forEach(onTabClick);

function onTabClick(item) {
    item.addEventListener("click", function () {
        let currentBtn = item;
        let tabId = currentBtn.getAttribute("data-tab");
        let currentTab = document.querySelector(tabId);

        if (!currentBtn.classList.contains('active')) {
            tabsBtn.forEach(function (item) {
                item.classList.remove('active');
            });

            tabsItems.forEach(function (item) {
                item.classList.remove('active');
            });

            currentBtn.classList.add('active');
            currentTab.classList.add('active');
        }
    });
}

document.querySelector('.tabs__nav-btn').click();

function storeObjectInLocalStorage(tableRow) {
    const countResults = localStorage.getItem('countResults') !== null ? JSON.parse(localStorage.getItem('countResults')) : [];

    if (countResults.length >= 10) {
        countResults.shift();
    }
    
    countResults.push(tableRow)

    localStorage.setItem('countResults', JSON.stringify(countResults));
};

function updateTable() {
    resultTable.innerHTML = '';
    const countResults = localStorage.getItem('countResults') !== null ? JSON.parse(localStorage.getItem('countResults')) : [];
    countResults.forEach((table) => {
        addResultsToList(table);
    });
}

function calculateDays(startDate, endDate, dayType) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const day = d.getDay();
        if (dayType === "All days" || (dayType === "Working days" && day >= 1 && day <= 5) || (dayType === "Weekend" && (day === 0 || day === 6))) {
            count++;
        }
    }
    return count;
}

function calculateTime(startDate, endDate, calcType, dayType) {
    const daysCount = calculateDays(startDate, endDate, dayType);
    let result;

    switch (calcType) {
        case "days":
            result = daysCount;
            break;
        case "hours":
            result = daysCount * 24;
            break;
        case "minutes":
            result = daysCount * 24 * 60;
            break;
        case "seconds":
            result = daysCount * 24 * 60 * 60;
            break;
    }

    return result;
}

document.addEventListener("DOMContentLoaded", function () {
       
    updateTable();    
    endDayInput.disabled = true;
    
    function startDateChange() {
        if (startDayInput.value) {
            endDayInput.disabled = false;
            endDayInput.min = startDayInput.value;
            
            if (endDayInput.value && new Date(startDayInput.value) > new Date(endDayInput.value)) {
                endDayInput.value = startDayInput.value;
            }
        } else {
            endDayInput.disabled = true;
            endDayInput.value = '';
        }
    }
    
    startDayInput.addEventListener('change', startDateChange);
    
    function presetChange() {
        const startDate = new Date(startDayInput.value);
        const presetValue = parseInt(presetSelect.value);

        if (startDayInput.value && presetValue) {
            const newEndDate = new Date(startDate);
            newEndDate.setDate(startDate.getDate() + presetValue);
            
            const year = newEndDate.getFullYear();
            const month = (newEndDate.getMonth() + 1).toString().padStart(2, '0');
            const day = newEndDate.getDate().toString().padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;

            endDayInput.value = formattedDate;
            // endDayInput.min = startDayInput.value;
        }
    }
    
    presetSelect.addEventListener('change', presetChange);
    
    function handleEndDateChange() {
        if (endDayInput.value) {
            startDayInput.max = endDayInput.value;
            
            if (startDayInput.value && new Date(endDayInput.value) < new Date(startDayInput.value)) {
                startDayInput.value = endDayInput.value;
            }
        } else {
            startDayInput.max = '';
        }
    }
    
    endDayInput.addEventListener('change', handleEndDateChange);
});   

class Table {
    constructor (startDate, endDate, result, resultType) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.result = result;
        this.resultType = resultType;
    }
}

function addResultsToList (table) {    
    const row = document.createElement('tr');
        row.innerHTML = `
            <td>${table.startDate}</td>
            <td>${table.endDate}</td>
            <td>${table.result}</td>
            <td>${table.resultType}</td>                  
        `;
    resultTable.appendChild(row);
}

calcButton.addEventListener('click', (event) => {
    event.preventDefault();    
    const startDate = startDayInput.value;
    const endDate = endDayInput.value;
    if (!startDate || !endDate) {
        alert('Please, select a date in both inputs');
        return;
    }

    const calcType = calcOptionsSelect.value;
    const dayType = dayOptionsSelect.value;
    const result = calculateTime(startDate, endDate, calcType, dayType);
    const resultType = `Number of ${calcType} of the following type: "${dayType}"`;    
    
    const table = new Table(startDate, endDate, result, resultType);
    
    addResultsToList(table);
    storeObjectInLocalStorage(table);
    updateTable();        
});

deleteButton.addEventListener('click', () => {
    if (confirm('Are you sure?')) {
        localStorage.clear();
        resultTable.innerHTML = '';
    }
});

function populateYearOptions() {
    const currentYear = new Date().getFullYear();
    for (let year = 2001; year <= 2049; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true;
        }
        yearOptionInput.appendChild(option);
    }
}

secondTab.addEventListener('click', async () => {
    
    selectElement.value = '';
    yearOptionInput.innerHTML = ''; 
    populateYearOptions(); 
    yearOptionInput.disabled = true; 
    
    try {
        const countryAPI = new CountryAPI();
        const data = await countryAPI.getData();
        const countryList = data.response.countries;        

        countryList.forEach(country => {
            const option = document.createElement('option');
            option.value = country['iso-3166'];
            option.textContent = country.country_name;
            selectElement.appendChild(option);
        })
        
    } catch (error) {
        console.log('Fetch error');
        alert('Some trouble with getting data, please - restart the page');            
        throw new Error('Some trouble with getting data, please - restart the page');                     
    }    
});

selectElement.addEventListener('change', () => {
    if (selectElement.value !== 'defaultCountryInput') {
        yearOptionInput.disabled = false; 
    } else {
        yearOptionInput.disabled = true; 
    }
});

class HolidaysList {
    constructor (date, holidayName, iso) {
        this.date = date;
        this.holidayName = holidayName;
        this.iso = iso;
    }
}

function addHolidaysToList (data) {    
    const row = document.createElement('tr');
        row.innerHTML = `
            <td data-iso="${data.iso}">${data.date}</td>
            <td>${data.holidayName}</td>              
        `;
    holidaysListBody.appendChild(row);
}

getHolidaysBTN.addEventListener("click", async (event) => {
    event.preventDefault();
    holidaysListBody.innerHTML = ''; 
    const country = selectElement.value;
    const year = yearOptionInput.value;
    
    if (country === "defaultCountryInput" || !year) {
        alert("Please select both a country and a year.");
        return;
    }
    
    try {
        const holidaysAPI = new HolidaysAPI();
        const holidays = await holidaysAPI.getData(country, year);
        const holidaysList = holidays.response.holidays;
        console.log(holidaysList);      

        holidaysList.forEach(holiday => {
            const { year, month, day } = holiday.date.datetime;
            const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;        
            const holidayName = holiday.name;
            const iso = holiday.date.iso; 
            const holidaysData = new HolidaysList(formattedDate, holidayName, iso);        
            addHolidaysToList(holidaysData); 
        })
        
    } catch (error) {
        console.log('Fetch error');
        alert('Some trouble with getting data, please - restart the page');          
        throw new Error('Some trouble with getting data, please - restart the page');                
    }
});

document.addEventListener("DOMContentLoaded", function () {    
    const sortBtn = document.querySelector('#sortDateBtn');     
    let ascending = true;
    sortBtn.addEventListener('click', function () {
        let rows = Array.from(holidaysListBody.rows);        
        rows.sort(function (a, b) {
            let dateA = new Date(a.cells[0].getAttribute('data-iso'));
            let dateB = new Date(b.cells[0].getAttribute('data-iso'));
            if (ascending) {
                return dateA - dateB;
            } else {
                return dateB - dateA;
            }            
        });

        rows.forEach(function (row) {
            holidaysListBody.appendChild(row);
        });

        ascending = !ascending;      
    });
});