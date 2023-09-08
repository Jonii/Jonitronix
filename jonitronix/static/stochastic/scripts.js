function gaussianRandom(mean=0, stdev=1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}

function randomNumbers(count, rngMean, rngStdev) {
    let numbers = [];
    for (let i = 0; i < count; i++) {
        numbers.push(gaussianRandom(rngMean, rngStdev));
    }
    return numbers;
}

function stocRound(number, scale) {
    let scaledNum = number / scale;
    let scaledNumMin = Math.floor(scaledNum);
    let scaledNumMax = Math.ceil(scaledNum);
    let distanceToMin = scaledNum - scaledNumMin;
    if (Math.random() > distanceToMin) {
        return scale * scaledNumMin;
    }
    return scale * scaledNumMax;
}

function calculate(count, rngMean, rngStdev) {
    const randomNums = randomNumbers(count, rngMean, rngStdev);

    let total = randomNums.reduce((acc, curr) => acc + stocRound(curr, 1000), 0);
    let actualTotal = randomNums.reduce((acc, curr) => acc + Math.floor(curr), 0);
    let regularRoundingTotal = randomNums.reduce((acc, curr) => acc + Math.round(curr / 1000) * 1000, 0);

    return {
        actual: actualTotal / count,
        regular: regularRoundingTotal / count,
        stochastic: total / count
    };
}

function updateTable() {
    const numberCount = parseInt(document.getElementById('numberCount').value);
    const mean = parseInt(document.getElementById('mean').value);
    const stdev = parseInt(document.getElementById('stdev').value);
    const results = calculate(numberCount,  mean, stdev);

    const table = document.getElementById('result-table');
    
    // Clear previous results except for headers
    while(table.rows.length > 1) {
        table.deleteRow(1);
    }
    
    const newRow = table.insertRow(-1);

    newRow.insertCell(0).innerHTML = results.actual.toFixed(2);
    newRow.insertCell(1).innerHTML = results.regular.toFixed(2);
    newRow.insertCell(2).innerHTML = results.stochastic.toFixed(2);
}

// Initialize the table on page load
document.addEventListener("DOMContentLoaded", updateTable);
