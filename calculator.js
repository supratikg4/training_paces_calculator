/**
 * Takes the user's race time/distance, calculates VDot score,
 * and outputs NCSU Club XC/TF training paces
 * 
 * Each pace is listed as XX-XX seconds slower per mile than 5k fitness
 * - Critical Velocity (CV): 12-20s
 * - Lactic Threshold (LT) : 25-35s
 * - Movin'/Marathon (MP)  : 45-55s
 * - Steady Tempo (ST)     : 60-70s
 * - Endurance Tempo (ET)  : 75-90s
 */

MAX = 500000000;
AU = 149600000000; // 1 Astronomical Unit in meters

/**
 * Updates distance text entry field with selected dropdown option
 */
function updateTextField() {
    const value = document.getElementById('distance-dropdown').value;
    document.getElementById('distance-input').value = value;
}

/**
 * Uses the Jack Daniel's oxygen consumption (VO2) and sustained effort (%VO2) equations
 * to calculate VDot score
 * @param {number} distance distance of race (in meters)
 * @param {number} time race time (in minutes)
 * @returns VDot score for the distance and time
 */
function getVDotScore(distance, time) {
    var v = distance / time;
    var vo2 = -4.6 + (0.182258 * v) + (0.000104 * Math.pow(v, 2));
    var sus_eff = 0.8 + (0.1894393 * Math.exp(-0.012778 * time)) + (0.2989558 * Math.exp(-0.1932605 * time));
    return vo2 / sus_eff;
}

/**
 * Gets equivalent race time for any distance based off VDot score.
 * Uses the Bisection Method (binary search) for lightweight client-side calculation.
 * @param {number} distance distance (in meters) of effort to convert to
 * @param {number} vdot VDot score
 * @returns Race time for distance (in minutes)
 */
function equivalentTimeFromVDot(distance, vdot) {
    var low = 0.1;
    //var high;
    //if (distance != AU) {high = 600;} else {high = MAX;}

    var high = distance != AU ? 600 : MAX;

    var tolerance = 0.00001;
    for (let i = 0; i < 1000; i++) {
        let mid = (low + high) / 2;
        let curVDot = getVDotScore(distance, mid);

        // Check if equivalent time found
        if (Math.abs(high - low) < tolerance) {
            return mid;
        }

        // If calculated VDot higher than true VDot, estimated time is too fast
        // Slower (longer) time needed, so bring lower bound up (remove faster times)
        if (curVDot > vdot) {
            low = mid;
        } else {
            high = mid;
        }
    }
    return (low + high) / 2;
}

/**
 * Converts total time in seconds to pace in minutes/mile
 * @param {number} seconds total seconds of time
 * @returns Formatted pace of time
 */
function formatPace(seconds) {
    seconds = Math.round(seconds);
    var hrs = Math.floor(seconds / 3600);
    var min = Math.floor((seconds % 3600) / 60);
    var sec = Math.round(seconds % 60);
    if (sec === 60) {
        min += 1;
        sec = 0;
    }

    if (hrs > 0) {
        return hrs + ":" + (min < 10 ? "0" : "") + min + ":" + (sec < 10 ? "0" : "") + sec;
    } else {
        return min + ":" + (sec < 10 ? "0" : "") + sec;
    }
}

/**
 * Gets training paces from user entered values
 */
function calculatePaces() {
    // Get values from input
    var d = parseFloat(document.getElementById('distance-input').value);
    if (isNaN(d) || d <= 0) return alert("Please enter a valid race distance.");

    var h = parseInt(document.getElementById('hours').value) || 0;
    var m = parseInt(document.getElementById('minutes').value) || 0;
    var s = parseInt(document.getElementById('seconds').value) || 0;

    var minutes = (h * 60) + m + (s / 60);
    if (minutes <= 0) return alert("Please enter a valid time.");

    // Calculate VDot explicitly
    var vdot = getVDotScore(d, minutes);
    document.getElementById('vdotScore').innerText = vdot.toFixed(1);

    // If not 5k, convert to 5k fitness
    var seconds = minutes * 60;
    if (d != 5000) {
        seconds = equivalentTimeFromVDot(5000, vdot) * 60;
    }

    // Convert 5k time to mile
    seconds /= 3.106856;

    // Output 5k training paces
    document.getElementById('pace-5k').innerText = formatPace(seconds);
    document.getElementById('pace-CV').innerText = formatPace(seconds + 12) + " - " + formatPace(seconds + 20);
    document.getElementById('pace-LT').innerText = formatPace(seconds + 25) + " - " + formatPace(seconds + 35);
    document.getElementById('pace-MP').innerText = formatPace(seconds + 45) + " - " + formatPace(seconds + 55);
    document.getElementById('pace-ST').innerText = formatPace(seconds + 60) + " - " + formatPace(seconds + 70);
    document.getElementById('pace-ET').innerText = formatPace(seconds + 75) + " - " + formatPace(seconds + 90);

    const equivalentDistances = [
        {name: "800m",          meters: 800},
        {name: "1000m",         meters: 1000},
        {name: "1500m",         meters: 1500},
        {name: "1 Mile",        meters: 1609.34},
        {name: "3000m",         meters: 3000},
        {name: "2 Mile",        meters: 3218.68},
        {name: "5K",            meters: 5000},
        {name: "8K",            meters: 8000},
        {name: "10K",           meters: 10000},
        {name: "Half Marathon", meters: 21097.5},
        {name: "Marathon",      meters: 42195},
    ];

    var leftBody = document.getElementById('equivalent-times-left');
    var rightBody = document.getElementById('equivalent-times-right');
    leftBody.innerHTML = "";
    rightBody.innerHTML = "";

    var index = 0;
    equivalentDistances.forEach(function(target) {
        var formattedTime = formatPace(equivalentTimeFromVDot(target.meters, vdot) * 60);

        var row = document.createElement('tr');
        row.innerHTML = `
            <td class="zone-title">${target.name}</td>
            <td class="pace-value" style="color: var(--ncsu-red); text-align: right;">${formattedTime}</td>
        `;

        if (index++ < 6) {
            leftBody.appendChild(row);
        } else {
            rightBody.appendChild(row);
        }
    });
    createAURow(vdot);
    
    // Render dynamic table view
    document.getElementById('results-box').style.display = 'block';
}

function createAURow(vdot) {
    // 1 astronomical unit. Better get training.
    var auRow = document.createElement('tr');
    auRow.innerHTML = `
        <td class="zone-title">1 Astronomical Unit</td>
        <td class="pace-value" style="color: var(--ncsu-red); text-align: right;">
        ${(equivalentTimeFromVDot(AU, vdot) / (60 * 24 * 365.25)).toFixed(0) + " years,<br>you got it!"}</td>
    `;
    document.getElementById('equivalent-times-right').appendChild(auRow);
}