function updateClock() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.toLocaleString('default', { month: 'long' });
    const day = now.getDate();
    const weekday = now.toLocaleString('default', { weekday: 'long' });
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    document.querySelector('.date').textContent = `Год: ${year}, Месяц: ${month}, День: ${day}, День недели: ${weekday}`;
    document.querySelector('.time').textContent = `${hours}:${minutes}:${seconds}`;
}

setInterval(updateClock, 1000);

document.addEventListener("DOMContentLoaded", function() {
    fetch('/api/schedule')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const schedule = data.schedule;
            const now = new Date();
            const currentDayIndex = now.getDay();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            let TimeRing = "Не определено";

            const todaySchedule = schedule.filter(pair => pair.dayofweek === currentDayIndex);
            const currentPair = todaySchedule.find(pair => {
                const startTime = pair.starttimefirsthalf ? pair.starttimefirsthalf.split(':').map(Number) : [0, 0];
                const endTime = pair.endtimesecondhalf ? pair.endtimesecondhalf.split(':').map(Number) : [0, 0];
                const startTimeMinutes = startTime[0] * 60 + startTime[1];
                const endTimeMinutes = endTime[0] * 60 + endTime[1];
                return currentTime >= startTimeMinutes && currentTime <= endTimeMinutes;
            });

            // Функция для преобразования времени из формата "часы:минуты" в минуты
            const timeToMinutes = (timeString) => {
                if (!timeString) {
                    return 0;
                }
                const [hours, minutes] = timeString.split(':').map(Number);
                return hours * 60 + minutes;
            };

            // Флаг который обозначает найдено ли ближайшее время
            let foundClosestTime = false;

            // Перебираем текущее расписание
            for (const pair of todaySchedule) {
                if (foundClosestTime) {
                    break;
                }

                const times = [
                    pair.starttimefirsthalf,
                    pair.endtimefirsthalf,
                    pair.starttimesecondhalf,
                    pair.endtimesecondhalf
                ];

                // Перебираем все элементы
                for (const time of times) {
                    const timeInMinutes = timeToMinutes(time);


                    // Если время в текущей паре больше текущего времени то сохраняем в переменную для будущего вывода
                    if (timeInMinutes > currentTime) {
                        TimeRing = time
                        foundClosestTime = true;
                        break;
                    }
                }
            }
            if (currentPair) {
                //console.log(currentPair)
                //console.log(`Предмет: ${currentPair.subject}, Аудитория: ${currentPair.auditorium}, Номер пары: ${currentPair.pairnumber}`);
                const pairElement = document.querySelector('.pair');
                pairElement.textContent = `Предмет: ${currentPair.subject}, Аудитория: ${currentPair.auditorium}, Номер пары: ${currentPair.pairnumber}, Ближайший звонок: ${TimeRing} `;
            }
            else {
                const pairElement = document.querySelector('.pair');
                pairElement.textContent = `Перемена\\Нет пар`;
            }
        })
        .catch(error => console.error('Fetch error:', error));
});

document.addEventListener("DOMContentLoaded", function() {
    const now = new Date();
    const currentDayOfWeek = now.getDay();

    fetch('/api/schedule')
        .then(response => response.json())
        .then(data => {

            const todaySchedule = data.schedule.filter(pair => pair.dayofweek === currentDayOfWeek); // Фильтруем пары по текущему дню недели

            if (todaySchedule.length > 0) { // Проверяем, есть ли пары в этот день
                todaySchedule.forEach(pair => {
                    const lessonId = `${pair.pairnumber}lesson_name`;
                    const auditoriumId = `${pair.pairnumber}auditorium`;

                    if (document.getElementById(lessonId) && document.getElementById(auditoriumId)) {
                        document.getElementById(lessonId).textContent = pair.subject;
                        document.getElementById(auditoriumId).textContent = pair.auditorium;
                    }
                });
            } else {
                //console.log('Пар нет');
                document.querySelector('.pair').textContent = 'Сегодня пар нет';
            }
        })
        .catch(error => console.error('Error fetching schedule:', error));
});

document.addEventListener('DOMContentLoaded', function() {
    const arrow = document.querySelector('.arrow');
    const startTime = new Date(1970, 0, 1, 9, 0, 0); // Начало движения стрелки в 9:00 каждый день

    function updateArrowPosition() {
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes(); // Текущее время в минутах
        const startMinutes = startTime.getHours() * 60 + startTime.getMinutes(); // Время начала в минутах

        if (nowMinutes >= startMinutes && nowMinutes <= (startMinutes + 7*60 + 20)) { // Если текущее время от 9:00 до 16:20
            const minutesPassed = nowMinutes - startMinutes; // Сколько минут прошло с 9:00
            let newPosition = minutesPassed * 2; // Новая позиция в пикселях (Отношение 1 минута - 2 пикселя)
            arrow.style.top = `${newPosition+30}px`;
        }
    }

    setInterval(updateArrowPosition, 600); // Обновляем позицию стрелки каждую секунду
});

function timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}


let alertFlag = false

document.addEventListener("DOMContentLoaded", function() {
    const notificationCheckbox = document.getElementById('notificationControl');

    // Синхронизируем состояние чекбокса с текущим разрешением уведомлений
    notificationCheckbox.checked = Notification.permission === "granted";

    notificationCheckbox.addEventListener('change', function() {
        if (!this.checked) {
            //console.log("Уведомления отключеныь.");
        } else {
            // Запрашиваем разрешение на уведомления
            Notification.requestPermission().then(permission => {
                //console.log("Статус разрешения:", permission);
                if (permission !== "granted") {
                    //console.log("Уведомления запрещены");
                    this.checked = false;
                }
            });
        }
    });

    fetch('/api/schedule').then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    }).then(data => {
        const scheduleData = data.schedule.map(item => ({
            starttimefirsthalf: item.starttimefirsthalf,
            endtimefirsthalf: item.endtimefirsthalf,
            starttimesecondhalf: item.starttimesecondhalf,
            endtimesecondhalf: item.endtimesecondhalf
        }));
        setInterval(() => {
            if (notificationCheckbox.checked && Notification.permission === "granted") {
                checkScheduleTime(scheduleData);
            }
        }, 1000);
    }).catch(error => {
        console.error('Error:', error);
    });
});

function checkScheduleTime(schedule) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let foundEvent = false;

    schedule.forEach(item => {
        Object.keys(item).forEach(key => {
            const eventTime = timeToMinutes(item[key]);
            if (currentMinutes >= eventTime - 2 && currentMinutes < eventTime) {
                foundEvent = true;
                if (!window.alertFlag) {
                    new Notification("Скоро звонок");
                    window.alertFlag = true;
                }
            }
        });
    });

    if (!foundEvent && window.alertFlag) {
        window.alertFlag = false;
    }
}
