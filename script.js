'use strict';

// імпортування CalendarAPI
// import { CalendarAPI } from './CalendarAPI.js';
//отримання даних з сервера по святах
// (async () => {
//     const calendarAPI = new CalendarAPI();
//     console.log(await calendarAPI.getData());
// })()

const tabsBtn = document.querySelectorAll(".tabs__nav-btn");
const tabsItems = document.querySelectorAll(".tabs__item");
const startDayInput = document.querySelector('#startDay');
const endDayInput = document.querySelector('#endDay');
const presetSelect = document.querySelector('#preset');
const dayOptionsSelect = document.querySelector('#dayOptions');
const calcOptionsSelect = document.querySelector('#calcOptions');
const calcButton = document.querySelector('.calcBTN button');
const resultTable = document.querySelector('.book-list');
const deleteButton = document.querySelector('.deleteAllResults')

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
    
    //підтягуємо локал при завантаженні ДОМу
    updateTable();
    
    // Блокую другий інпут при завантаженні сторінки
    endDayInput.disabled = true;

    // функція для першого інпуту та розблокування другого інпута
    function startDateChange() {
        if (startDayInput.value) {
            endDayInput.disabled = false;
            endDayInput.min = startDayInput.value;
            //запобіжник від зміни дати першого інпуту після встановлення значення другого інпуту 
            if (endDayInput.value && new Date(startDayInput.value) > new Date(endDayInput.value)) {
                endDayInput.value = startDayInput.value;
            }
        } else {
            endDayInput.disabled = true;
            endDayInput.value = '';
        }
    }

    // подія для розблокування другого інпуту
    startDayInput.addEventListener('change', startDateChange);

    // Пресет
    function presetChange() {
        const startDate = new Date(startDayInput.value);
        const presetValue = parseInt(presetSelect.value);

        if (startDayInput.value && presetValue) {
            const newEndDate = new Date(startDate);
            newEndDate.setDate(startDate.getDate() + presetValue);

            // Форматування дати для встановлення в інпут
            const year = newEndDate.getFullYear();
            const month = (newEndDate.getMonth() + 1).toString().padStart(2, '0');
            const day = newEndDate.getDate().toString().padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;

            endDayInput.value = formattedDate;
            // endDayInput.min = startDayInput.value;
        }
    }

    // обробник пресету
    presetSelect.addEventListener('change', presetChange);

    // другий інпут, встановлення обмежень
    function handleEndDateChange() {
        if (endDayInput.value) {
            startDayInput.max = endDayInput.value;
            //запобіжник
            if (startDayInput.value && new Date(endDayInput.value) < new Date(startDayInput.value)) {
                startDayInput.value = endDayInput.value;
            }
        } else {
            startDayInput.max = '';
        }
    }

    // обробник другого інпуту
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
