const habitInput = document.getElementById("habitInput");
const habitCategory = document.getElementById("habitCategory");
const habitTime = document.getElementById("habitTime");
const addHabitBtn = document.getElementById("addHabitBtn");
const habits = document.getElementById("habits");
const totalHabitsDisplay = document.getElementById("totalHabits");
const completedTodayDisplay = document.getElementById("completedToday");
const totalDaysDisplay = document.getElementById("totalDays");
const completionRateDisplay = document.getElementById("completionRate");
const longestStreakDisplay = document.getElementById("longestStreak");

if ("Notification" in window) {
    Notification.requestPermission();
}

// Get saved habits from the browser
let savedHabits = JSON.parse(localStorage.getItem("habits")) || [];


savedHabits.forEach(function (habit) {

    if (habit.longestStreak === undefined) {
        habit.longestStreak = habit.currentStreak;
    }

    if (habit.completionDates === undefined) {
        habit.completionDates = [];
    }

    if (habit.createdDate === undefined) {

        if (habit.completionDates.length > 0) {
            habit.createdDate = habit.completionDates[0];
        } else {
            habit.createdDate = new Date().toDateString();
        }

    }

});



// Display saved habits when the page loads
savedHabits.forEach(function (habitData) {
    createHabitElement(habitData);
});

updateDashboard();

// Add a new habit
addHabitBtn.addEventListener("click", function () {

    const habitName = habitInput.value;
    const time = habitTime.value;
    const category = habitCategory.value;

    if (habitName === "" || time === "" || category === "") {
        alert("Please enter a habit, choose a category, and choose a time.");
        return;
    }

    const habitData = {
        name: habitName,
        time: time,
        category: habitCategory.value,
        daysCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: null,
        completionDates: [],
        createdDate: new Date().toDateString()

    };

    savedHabits.push(habitData);

    // Save the updated habits
    localStorage.setItem("habits", JSON.stringify(savedHabits));

    createHabitElement(habitData);

    // Update the dashboard

    updateDashboard();

    habitInput.value = "";
    habitTime.value = "";
    habitCategory.value = "";
});


// Create the habit on the webpage
function createHabitElement(habitData) {

    const habit = document.createElement("div");
    
    const isDashboard =document.body.classList.contains("page-dashboard") &&
    document.getElementById("todayHabitsList");

   habit.innerHTML = `
    <div class="habit-card ${isDashboard ? "dashboard-habit-card" : ""}">

        <div class="habit-info">
            <h3>${habitData.name}</h3>

            <p class="habit-time">
                ⏰ Reminder: ${habitData.time || "Not set"}
            </p>

            <p class="habit-category">
                🏷️ ${habitData.category}
            </p>

            ${isDashboard ? `
                <label class="dashboard-checkbox-label">
                    <input
                        type="checkbox"
                        class="dashboard-complete-toggle"
                        aria-label="Mark habit complete"
                    >
                </label>
            ` : ""}

            <div class="${isDashboard ? "dashboard-hidden-details" : ""}">

                <p>
                    📅 Days completed:
                    <strong class="days">${habitData.daysCompleted}</strong>
                </p>

                <p>
                    🔥 Current streak:
                    <strong class="streak">${habitData.currentStreak}</strong> days
                </p>

                <p>
                    🏆 Longest streak:
                    <strong class="longestStreak">${habitData.longestStreak}</strong> days
                </p>

                <div class="progress-section">
                    <p>📈 Progress</p>

                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>

                    <p class="progress-text">0%</p>
                </div>

                <p>📅 Completion History:</p>

                <div class="completion-history">
                    ${
                        habitData.completionDates.length === 0
                            ? "No completions yet."
                            : habitData.completionDates
                                .map(function (date) {
                                    return `<span>✅ ${date}</span>`;
                                })
                                .join("<br>")
                    }
                </div>

            </div>
        </div>

        <div class="habit-actions ${isDashboard ? "dashboard-hidden-actions" : ""}">
            <button class="completeBtn">Complete</button>
            <button class="calendarBtn">Show Calendar</button>
            <button class="deleteBtn">Delete</button>
            <button class="editBtn">Edit</button>
        </div>

        <div class="habit-calendar"></div>

    </div>
`;

    const dashboardHabitList = document.getElementById("todayHabitsList");

    const habitListTarget = document.body.classList.contains("page-dashboard") && dashboardHabitList
    ? dashboardHabitList
    : habits;

    habitListTarget.appendChild(habit);

    const completeBtn = habit.querySelector(".completeBtn");
    const dashboardCompleteToggle = habit.querySelector(
    ".dashboard-complete-toggle"
    );

        if (dashboardCompleteToggle) {
            dashboardCompleteToggle.checked =
                habitData.lastCompletedDate === new Date().toDateString();

            dashboardCompleteToggle.disabled =
                dashboardCompleteToggle.checked;

            dashboardCompleteToggle.addEventListener("change", function () {
                if (dashboardCompleteToggle.checked) {
                    completeBtn.click();

                    if (habitData.lastCompletedDate === new Date().toDateString()) {
                        dashboardCompleteToggle.checked = true;
                        dashboardCompleteToggle.disabled = true;
                    } else {
                        dashboardCompleteToggle.checked = false;
                    }
                }
            });
        }
    const calendarBtn = habit.querySelector(".calendarBtn");
    const deleteBtn = habit.querySelector(".deleteBtn");
    const editBtn = habit.querySelector(".editBtn");
    const calendarDisplay = habit.querySelector(".habit-calendar");
    const daysDisplay = habit.querySelector(".days");
    const streakDisplay = habit.querySelector(".streak");
    const longestStreakDisplay = habit.querySelector(".longestStreak");
    const progressFill = habit.querySelector(".progress-fill");
    const progressText = habit.querySelector(".progress-text");
    function updateProgress() {

     const today = new Date();

     const dayOfWeek = today.getDay();

     const startOfWeek = new Date(today);

      startOfWeek.setDate(
        today.getDate() - dayOfWeek
    );

      startOfWeek.setHours(0, 0, 0, 0);

      const completedThisWeek =
        habitData.completionDates.filter(function (date) {

            const completionDate = new Date(date);

            return completionDate >= startOfWeek &&
                   completionDate <= today;

        }).length;

      const progress =
        Math.round(
            (completedThisWeek / 7) * 100
        );

      progressFill.style.width = progress + "%";
      progressText.textContent =
        progress + "% this week";
    }
     updateProgress();        
    const today = new Date().toDateString();

    calendarBtn.addEventListener("click", function () {

    if (calendarDisplay.innerHTML.trim() !== "" &&
        calendarDisplay.style.display !== "none") {

        calendarDisplay.style.display = "none";
        calendarDisplay.innerHTML = "";
        calendarBtn.textContent = "Show Calendar";
        return;
    }

    const today = new Date();

    calendarDisplay.style.display = "block";

    renderCalendar(
        habitData,
        calendarDisplay,
        today.getFullYear(),
        today.getMonth()
    );

    calendarBtn.textContent = "Hide Calendar";

});


    deleteBtn.addEventListener("click", function () {

    const confirmDelete = confirm(
        `Are you sure you want to delete "${habitData.name}"?`
    );

    if (!confirmDelete) {
        return;
    }

    const index = savedHabits.indexOf(habitData);

    if (index !== -1) {
        savedHabits.splice(index, 1);
    }

    localStorage.setItem("habits", JSON.stringify(savedHabits));

    habit.remove();

    updateDashboard();
});


editBtn.addEventListener("click", function () {

    const newName = prompt(
        "Enter the new habit name:",
        habitData.name
    );

    if (newName === null || newName.trim() === "") {
        return;
    }

    const newTime = prompt(
        "Enter the new reminder time (HH:MM):",
        habitData.time
    );

    if (newTime === null || newTime.trim() === "") {
        return;
    }

    const newCategory = prompt(
    "Enter the new category (Exercise, Study, Health, Worship, or Chores):",
    habitData.category
   );

   if (newCategory === null || newCategory.trim() === "") {
    return;
   }

    habitData.name = newName.trim();
    habitData.time = newTime.trim();
    habitData.category = newCategory.trim();
    localStorage.setItem("habits", JSON.stringify(savedHabits));

    habit.querySelector(".habit-info h3").textContent =
        habitData.name;

    habit.querySelector(".habit-info p").textContent =
        `⏰ Reminder: ${habitData.time}`;

    habit.querySelector(".habit-info p:nth-of-type(2)").textContent =
        `🏷️ Category: ${habitData.category}`;

});


    if (habitData.lastCompletedDate === today) {
        completeBtn.textContent = "Completed ✅";
        completeBtn.disabled = true;
    }

    completeBtn.addEventListener("click", function () {

        const today = new Date();
        const todayString = today.toDateString();

        // Prevent completing twice today
        if (habitData.lastCompletedDate === todayString) {
            alert("You have already completed this habit today.");
            return;
        }


        // First completion
        if (habitData.lastCompletedDate === null) {

            habitData.daysCompleted++;
            habitData.currentStreak = 1;

        
            } else {

            const lastDate = new Date(habitData.lastCompletedDate);

            const difference =
                today.setHours(0, 0, 0, 0) -
                lastDate.setHours(0, 0, 0, 0);

            const daysDifference =
                difference / (1000 * 60 * 60 * 24);


            if (daysDifference === 1) {

                // Completed yesterday
                habitData.daysCompleted++;
                habitData.currentStreak++;

            } else {

                // Missed one or more days
                habitData.daysCompleted++;
                habitData.currentStreak = 1;
            }
        }

        if (habitData.currentStreak > habitData.longestStreak) {
            habitData.longestStreak = habitData.currentStreak;
        }

        habitData.lastCompletedDate = todayString;

        if (!habitData.completionDates.includes(todayString)) {
            
            habitData.completionDates.push(todayString);
        }   


        // Update the webpage
        daysDisplay.textContent = habitData.daysCompleted;
        streakDisplay.textContent = habitData.currentStreak;
        longestStreakDisplay.textContent = habitData.longestStreak;
        updateProgress();
        completeBtn.textContent = "Completed ✅";
        completeBtn.disabled = true;

        const historyDisplay = habit.querySelector(".completion-history");

        historyDisplay.innerHTML = habitData.completionDates
         .map(function (date) {
            return `<span>✅ ${date}</span>`;
          })
          .join("<br>");



        // Save the updated progress
        localStorage.setItem("habits", JSON.stringify(savedHabits));

        // Update the dashboard
        updateDashboard();
    });
}
// Check reminders every minute
setInterval(checkReminders, 1000);


// Check if it is time for any habit
function checkReminders() {

    const now = new Date();

    const currentTime = now.toTimeString().slice(0, 5);
    const today = now.toDateString();

    savedHabits.forEach(function (habit) {

        if (
            habit.time === currentTime &&
            habit.lastCompletedDate !== today&&
            habit.lastReminderDate !== today
        ) {
            showReminder(habit);
        }

    });
}


// Show the reminder
function showReminder(habit) {

    habit.lastReminderDate = new Date().toDateString();

    localStorage.setItem("habits", JSON.stringify(savedHabits));

    if (Notification.permission === "granted") {

        new Notification("Daily Habit Tracker 🔔", {
            body: `Time to: ${habit.name}`,
            icon: "🔔"
        });

    } else {
        alert(`🔔 Reminder!\n\nTime to: ${habit.name}`);
    }
}

function updateDashboard() {

    const today = new Date().toDateString();

    const totalHabits = savedHabits.length;

    let completedToday = 0;
    let totalDays = 0;
    let longestStreak = 0;
    let weeklyCompleted = 0;
    let weeklyPossible = 0;

    savedHabits.forEach(function (habit) {

       const todayDate = new Date();
       const dayOfWeek = todayDate.getDay();

       const startOfWeek = new Date(todayDate);

       startOfWeek.setDate(
        todayDate.getDate() - dayOfWeek
       );

       startOfWeek.setHours(0, 0, 0, 0);

       const completedThisWeek =
          habit.completionDates.filter(function (date) {

        const completionDate = new Date(date);

        return completionDate >= startOfWeek &&
               completionDate <= todayDate;

        }).length;

          weeklyCompleted += completedThisWeek;
          weeklyPossible += 7; 

        totalDays += habit.daysCompleted;

        if (habit.lastCompletedDate === today) {
            completedToday++;
        }

        if (habit.longestStreak > longestStreak) {
          longestStreak = habit.longestStreak;
    }

    });

    
    let completionRate = 0;

    if (weeklyPossible > 0) {
      completionRate =
        Math.round(
            (weeklyCompleted / weeklyPossible) * 100
        );
    }


    totalHabitsDisplay.textContent = totalHabits;
    completedTodayDisplay.textContent = completedToday;
    totalDaysDisplay.textContent = totalDays;
    completionRateDisplay.textContent = completionRate + "%";
    longestStreakDisplay.textContent = longestStreak;
    updateHomeSummary();
}

function updateHomeSummary() {
    const today = new Date().toDateString();

    const totalHabits = savedHabits.length;

    const completedToday = savedHabits.filter(function (habit) {
        return habit.lastCompletedDate === today;
    }).length;

    const currentStreak = savedHabits.reduce(function (best, habit) {
        return Math.max(best, habit.currentStreak || 0);
    }, 0);

    const progress = totalHabits === 0
        ? 0
        : Math.round((completedToday / totalHabits) * 100);

    const completedElement = document.getElementById("homeCompletedToday");
    const streakElement = document.getElementById("homeCurrentStreak");
    const progressElement = document.getElementById("homeProgress");

    if (completedElement) {
        completedElement.textContent = completedToday + "/" + totalHabits;
    }

    if (streakElement) {
        streakElement.textContent = currentStreak + " days";
    }

    if (progressElement) {
        progressElement.textContent = progress + "%";
    }
}


function renderCalendar(habitData, calendarDisplay, year, month) {

    const today = new Date();

    const firstDay = new Date(year, month, 1).getDay();

    const daysInMonth =
        new Date(year, month + 1, 0).getDate();

    const monthName =
        new Date(year, month, 1)
            .toLocaleString("default", { month: "long" });

    let calendarHTML = `
        <div class="calendar-header">

            <button class="previousMonth">◀</button>

            <h3>${monthName} ${year}</h3>

            <button class="nextMonth">▶</button>

        </div>

        <button class="todayBtn">Today</button>

        <div class="calendar-grid">

            <div class="calendar-day-name">Sun</div>
            <div class="calendar-day-name">Mon</div>
            <div class="calendar-day-name">Tue</div>
            <div class="calendar-day-name">Wed</div>
            <div class="calendar-day-name">Thu</div>
            <div class="calendar-day-name">Fri</div>
            <div class="calendar-day-name">Sat</div>
    `;

    // Empty spaces before the first day
    for (let i = 0; i < firstDay; i++) {

        calendarHTML += `
            <div class="calendar-empty"></div>
        `;

    }

    // Create each day
    for (let day = 1; day <= daysInMonth; day++) {

        const date = new Date(year, month, day);

        const dateString = date.toDateString();

        const completed =
            habitData.completionDates.includes(dateString);

        const isFuture = date > today;

        const createdDate =
            new Date(habitData.createdDate);

        const isBeforeHabitStarted =
            date < createdDate;

        let dayClass = "calendar-date";

        let symbol = "";

        if (completed) {

            dayClass += " completed-day";
            symbol = "✅";

        } else if (
            !isFuture &&
            !isBeforeHabitStarted
        ) {

            dayClass += " missed-day";
            symbol = "❌";

        }

        calendarHTML += `
            <div class="${dayClass}">
                ${day}
                ${symbol}
            </div>
        `;

    }

    calendarHTML += `
        </div>

        <div class="calendar-legend">

            <span>✅ Completed</span>

            <span>❌ Missed</span>

            <span>🔥 Current streak: ${habitData.currentStreak}</span>

        </div>
    `;

    calendarDisplay.innerHTML = calendarHTML;


    // Today button
    const todayBtn =
    calendarDisplay.querySelector(".todayBtn");

    todayBtn.addEventListener("click", function () {

    const today = new Date();

    renderCalendar(
        habitData,
        calendarDisplay,
        today.getFullYear(),
        today.getMonth()
    );
  });

// Calendar navigation

const previousMonth = calendarDisplay.querySelector(".previousMonth");
const nextMonth = calendarDisplay.querySelector(".nextMonth");

previousMonth.addEventListener("click", function () {

    month--;

    if (month < 0) {
        month = 11;
        year--;
    }

    renderCalendar(
        habitData,
        calendarDisplay,
        year,
        month
    );

});


nextMonth.addEventListener("click", function () {

    month++;

    if (month > 11) {
        month = 0;
        year++;
    }

    renderCalendar(
        habitData,
        calendarDisplay,
        year,
        month
    );

});

}

function renderAllHabitsCalendar() {
    const calendarSection = document.getElementById("allHabitsCalendar");

    if (!calendarSection) {
        return;
    }

    calendarSection.innerHTML = "";

    if (savedHabits.length === 0) {
        calendarSection.innerHTML =
            "<p>Add a habit first to see its completion calendar.</p>";
        return;
    }

    savedHabits.forEach(function (habitData) {
        const habitSection = document.createElement("section");
        habitSection.className = "calendar-habit-section";

        const habitHeading = document.createElement("h3");
        habitHeading.textContent = habitData.name;

        const habitCalendar = document.createElement("div");
        habitCalendar.className = "habit-calendar";

        habitSection.appendChild(habitHeading);
        habitSection.appendChild(habitCalendar);
        calendarSection.appendChild(habitSection);

        const today = new Date();

        renderCalendar(
            habitData,
            habitCalendar,
            today.getFullYear(),
            today.getMonth()
        );
    });
}

if (document.body.classList.contains("page-calendar")) {
    renderAllHabitsCalendar();
}

function updateAnalytics() {
    const totalHabits = savedHabits.length;

    const totalDays = savedHabits.reduce(function (total, habit) {
        return total + (habit.daysCompleted || 0);
    }, 0);

    const bestStreak = savedHabits.reduce(function (best, habit) {
        return Math.max(best, habit.longestStreak || 0);
    }, 0);

    const today = new Date().toDateString();

    const completedToday = savedHabits.filter(function (habit) {
        return habit.lastCompletedDate === today;
    }).length;

    const totalHabitsCard =
        document.getElementById("analyticsTotalHabits");
    const totalDaysCard =
        document.getElementById("analyticsTotalDays");
    const bestStreakCard =
        document.getElementById("analyticsBestStreak");
    const completedTodayCard =
        document.getElementById("analyticsCompletedToday");

    if (totalHabitsCard) {
        totalHabitsCard.textContent = totalHabits;
    }

    if (totalDaysCard) {
        totalDaysCard.textContent = totalDays;
    }

    if (bestStreakCard) {
        bestStreakCard.textContent = bestStreak;
    }

    if (completedTodayCard) {
        completedTodayCard.textContent = completedToday;
    }
}
if (document.body.classList.contains("page-progress")) {
    updateAnalytics();
}

function renderWeeklyChart() {
    const chart = document.getElementById("weeklyChart");

    if (!chart) {
        return;
    }

    chart.innerHTML = "";

    const today = new Date();
    const days = [];

    // Get the last 7 days, including today
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        days.push({
            date: date,
            label: date.toLocaleDateString("en", {
                weekday: "short"
            }),
            dateLabel: date.getDate(),
            count: 0
        });
    }

    // Count completions for each day
    savedHabits.forEach(function (habit) {
        (habit.completionDates || []).forEach(function (completedDate) {
            const completedDay = new Date(completedDate);

            if (isNaN(completedDay.getTime())) {
                return;
            }

            days.forEach(function (day) {
                if (
                    completedDay.toDateString() ===
                    day.date.toDateString()
                ) {
                    day.count++;
                }
            });
        });
    });

    const maxCount = Math.max(
        1,
        ...days.map(function (day) {
            return day.count;
        })
    );

    // Calculate the weekly summary
    const weeklyTotal = days.reduce(function (total, day) {
        return total + day.count;
    }, 0);

    const bestDay = days.reduce(function (best, day) {
        return day.count > best.count ? day : best;
    }, days[0]);

    const weeklyAverage = (weeklyTotal / 7).toFixed(1);

    const weeklyTotalElement = document.getElementById("weeklyTotal");
    const weeklyBestDayElement = document.getElementById("weeklyBestDay");
    const weeklyAverageElement = document.getElementById("weeklyAverage");

    if (weeklyTotalElement) {
        weeklyTotalElement.textContent = weeklyTotal;
    }

    if (weeklyBestDayElement) {
        weeklyBestDayElement.textContent =
            weeklyTotal === 0 ? "—" : bestDay.label;
    }

    if (weeklyAverageElement) {
        weeklyAverageElement.textContent = weeklyAverage;
    }

    days.forEach(function (day) {
        const barItem = document.createElement("div");
        barItem.className = "weekly-chart-day";

        if(weeklyTotal > 0 && day.count === bestDay.count) {
            barItem.classList.add("best-day");
        }

        const count = document.createElement("span");
        count.className = "weekly-chart-count";
        count.textContent = day.count;

        const barTrack = document.createElement("div");
        barTrack.className = "weekly-chart-track";

        const bar = document.createElement("div");
        bar.className = "weekly-chart-bar";
        bar.style.height =
            Math.max(5, (day.count / maxCount) * 100) + "%";
        
        bar.title = `${day.count} completion${day.count === 1 ? "" : "s"} on ${day.label} ${day.dateLabel}`;    

        const label = document.createElement("span");
        label.className = "weekly-chart-label";
        label.textContent = day.label;

        const dateLabel = document.createElement("span")
        dateLabel.className = "weekly-chart-date";
        dateLabel.textContent = day.dateLabel;

        barTrack.appendChild(bar);
        barItem.appendChild(count);
        barItem.appendChild(barTrack);
        barItem.appendChild(label);
        barItem.appendChild(dateLabel);

        chart.appendChild(barItem);
    });
}

if (document.body.classList.contains("page-progress")) {
    renderWeeklyChart();
}

function updateMostConsistentHabit() {
    const habitCard = document.getElementById("mostConsistentHabit");

    if (!habitCard) {
        return;
    }

    if (savedHabits.length === 0) {
        habitCard.innerHTML = `
            <p>No habits yet.</p>
            <span>Add a habit to start tracking your consistency.</span>
        `;
        return;
    }

let mostConsistentHabit = null;
let highestConsistencyRate = -1;

savedHabits.forEach(function (habit) {
    const completionCount = (habit.completionDates || []).length;

    const createdDate = habit.createdDate
        ? new Date(habit.createdDate)
        : new Date();

    const today = new Date();

    createdDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const daysTracked = Math.max(
        1,
        Math.floor((today - createdDate) / (1000 * 60 * 60 * 24)) + 1
    );

    const consistencyRate = Math.min(
        100,
        (completionCount / daysTracked) * 100
    );

    if (consistencyRate > highestConsistencyRate) {
        highestConsistencyRate = consistencyRate;
        mostConsistentHabit = habit;
    }
});

 habitCard.innerHTML = `
    <h3>${escapeHTML(mostConsistentHabit.name)}</h3>

    <p>${(mostConsistentHabit.completionDates || []).length} recorded completions</p>

    <div class="consistency-rate">
        <span>Consistency Rate</span>
        <strong>${Math.round(highestConsistencyRate)}%</strong>
    </div>

    <div class="consistency-track">
        <div class="consistency-fill"
             style="width: ${highestConsistencyRate}%"></div>
    </div>

    <div class="streak-insights">
        <div class="streak-item">
            <span>Current Streak</span>
            <strong>${mostConsistentHabit.currentStreak || 0} days</strong>
        </div>

        <div class="streak-item">
            <span>Longest Streak</span>
            <strong>${mostConsistentHabit.longestStreak || 0} days</strong>
        </div>
    </div>

    <span>Your most consistent habit based on days tracked.</span>
`;
}

function escapeHTML(value) {
    const element = document.createElement("span");
    element.textContent = value;
    return element.innerHTML;
}

if (document.body.classList.contains("page-progress")) {
    updateMostConsistentHabit();
}