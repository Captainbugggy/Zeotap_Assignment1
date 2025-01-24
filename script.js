let selectedCell = null;

// Initialize a 64x64 grid on page load
window.onload = function initializeGrid() {
    const spreadsheet = document.getElementById('spreadsheet');

    // Create headers
    const headerRow = document.createElement('div');
    headerRow.classList.add('header-row');
    headerRow.innerHTML = `<div class="cell header"></div>`;
    for (let col = 0; col < 64; col++) {
        const columnLabel = getColumnLabel(col);
        headerRow.innerHTML += `<div class="cell header">${columnLabel}</div>`;
    }
    spreadsheet.appendChild(headerRow);

    // Create rows
    for (let row = 1; row <= 64; row++) {
        const newRow = document.createElement('div');
        newRow.classList.add('row');
        newRow.innerHTML = `<div class="cell header">${row}</div>`;

        for (let col = 0; col < 64; col++) {
            const columnLabel = getColumnLabel(col);
            const cellId = `${columnLabel}${row}`;
            newRow.innerHTML += `<div class="cell" contenteditable="true" data-cell="${cellId}" data-type="text"></div>`;
        }
        spreadsheet.appendChild(newRow);
    }

    // Attach cell listeners
    attachCellListeners();
};


// Helper to get column labels (A, B, ..., Z, AA, AB, ...)
function getColumnLabel(index) {
    let label = '';
    while (index >= 0) {
        label = String.fromCharCode((index % 26) + 65) + label;
        index = Math.floor(index / 26) - 1;
    }
    return label;
}

// Apply formula or value from the formula bar
function applyFormula() {
    const formulaBarValue = document.getElementById('formulaBar').value.trim();

    if (!selectedCell) {
        alert('Select a cell to apply the formula.');
        return;
    }
    // alert('je');
    if (formulaBarValue.startsWith('=')) {
        // Handle formula evaluation
        const operation = formulaBarValue.slice(1).toUpperCase();
        
        try {
            if (operation.startsWith('SUM(')) {
                selectedCell.textContent = handleSUM(operation);
                console.log('Error in formula: ');
            } else if (operation.startsWith('AVERAGE(')) {
                console.log('Error in f2ormula: ');
                selectedCell.textContent = handleAVERAGE(operation);
            } else if (operation.startsWith('MAX(')) {
                selectedCell.textContent = handleMAX(operation);
            } else if (operation.startsWith('MIN(')) {
                selectedCell.textContent = handleMIN(operation);
            } else if (operation.startsWith('COUNT(')) {
                selectedCell.textContent = handleCOUNT(operation);
            } else if (operation.startsWith('UPPER(')) {
                selectedCell.textContent = handleUPPER(operation);
            } else if (operation.startsWith('LOWER(')) {
                selectedCell.textContent = handleLOWER(operation);
            } else if (operation.startsWith('TRIM(')) {
                selectedCell.textContent = handleTRIM(operation);
            } else if (operation.startsWith('REMOVE_DUPLICATES(')) {
                handleREMOVE_DUPLICATES(operation);
            }
            else if (operation.startsWith('FIND_AND_REPLACE(')){
                console.log("ejubejb");
                handleFIND_AND_REPLACE(operation);
            } 
            else {
                selectedCell.textContent = evalFormula(formulaBarValue.slice(1));
            }
        } catch (err) {
            alert('Error in formula: ' + err.message);
        }
    } else {
        // Save the plain value (non-formula)
        selectedCell.textContent = formulaBarValue;
    }

    // Sync the formula bar with the updated cell content
    document.getElementById('formulaBar').value = selectedCell.textContent;
}

// Evaluate simple mathematical formulas
function evalFormula(expression) {
    try {
        return eval(expression);
    } catch (error) {
        alert('Invalid mathematical expression.');
        return '';
    }
}
// Handle FIND_AND_REPLACE formula (in-place find and replace within range or multiple individual cells)
// Handle FIND_AND_REPLACE formula (in-place find and replace within range or multiple individual cells)
// Handle FIND_AND_REPLACE formula (in-place find and replace within range or individual cells)
function handleFIND_AND_REPLACE(operation) {
    console.log(operation); 
    console.log('hello'); 
    const match = operation.match(/\((.*?)\)/);
    if (!match) throw new Error("Invalid FIND_AND_REPLACE formula. Expected format: FIND_AND_REPLACE(A1:B2, 'find', 'replace')");

    // Split the parameters and trim whitespace
    const params = match[1].split(',').map(param => param.trim());
    
    // Need at least 3 parameters: range, find text, replace text
    if (params.length < 3) {
        throw new Error("FIND_AND_REPLACE requires three parameters: range, find text, and replace text");
    }

    const rangeOrCells = params[0];
    // Remove quotes if present for find and replace text
    const findText = params[1].replace(/^['"]|['"]$/g, '');
    const replaceText = params[2].replace(/^['"]|['"]$/g, '');

    let range;
    if (rangeOrCells.includes(':')) {
        // Handle range (e.g., A1:B2)
        range = parseRange(rangeOrCells);
    } else {
        // Handle individual cells (e.g., A1, B2, C3)
        range = rangeOrCells.split(',').map(cell => cell.trim());
    }

    range.forEach(cell => {
        const cellElement = document.querySelector(`[data-cell="${cell}"]`);
        if (cellElement) {
            // Create a regular expression for global replacement
            const regex = new RegExp(findText, 'g');
            // Apply find and replace to the content of each cell in the range
            cellElement.textContent = cellElement.textContent.replace(regex, replaceText);
        }
    });
}


// Handle SUM formula
function handleSUM(operation) {
    // Extract the range or cells from the formula
    const match = operation.match(/\((.*?)\)/);
    
    if (!match) {
        throw new Error("Invalid SUM formula. Expected format: SUM(A1:B2) or SUM(A1, A2, ...)");
    }

    const rangeOrCells = match[1]; // Extract the content inside the parentheses

    if (rangeOrCells.includes(':')) {
        // Handle range (e.g., A1:B2)
        const range = parseRange(rangeOrCells);
        return range.reduce((sum, cell) => sum + getCellValue(cell), 0);
    } else {
        // Handle individual cells (e.g., A1, A2, A3)
        const cells = rangeOrCells.split(',').map(cell => cell.trim());
        return cells.reduce((sum, cell) => sum + getCellValue(cell), 0);
    }
}


function handleAVERAGE(operation) {
    // Extract the range or cells from the formula
    const match = operation.match(/\((.*?)\)/);

    if (!match) {
        throw new Error("Invalid AVERAGE formula. Expected format: AVERAGE(A1:B2) or AVERAGE(A1, A2, ...)");
    }

    const rangeOrCells = match[1]; // Extract the content inside parentheses

    if (rangeOrCells.includes(':')) {
        // Handle range (e.g., A1:B2)
        const range = parseRange(rangeOrCells);
        const values = range.map(cell => getCellValue(cell));
        const sum = values.reduce((a, b) => a + b, 0);
        return sum / values.length;
    } else {
        // Handle individual cells (e.g., A1, A2, A3)
        const cells = rangeOrCells.split(',').map(cell => cell.trim());
        const values = cells.map(cell => getCellValue(cell));
        const sum = values.reduce((a, b) => a + b, 0);
        return sum / values.length;
    }
}


// Handle MAX formula
function handleMAX(operation) {
    const match = operation.match(/\((.*?)\)/);
    if (!match) throw new Error("Invalid MAX formula. Expected format: MAX(A1:B2) or MAX(A1, A2, ...)");
    
    const rangeOrCells = match[1].trim();

    if (rangeOrCells.includes(':')) {
        const range = parseRange(rangeOrCells);
        const values = range.map(cell => getCellValue(cell));
        return Math.max(...values);
    } else {
        const cells = rangeOrCells.split(',').map(cell => cell.trim());
        const values = cells.map(cell => getCellValue(cell));
        return Math.max(...values);
    }
}

function handleMIN(operation) {
    const match = operation.match(/\((.*?)\)/);
    if (!match) throw new Error("Invalid MIN formula. Expected format: MIN(A1:B2) or MIN(A1, A2, ...)");
    
    const rangeOrCells = match[1].trim();

    if (rangeOrCells.includes(':')) {
        const range = parseRange(rangeOrCells);
        const values = range.map(cell => getCellValue(cell));
        return Math.min(...values);
    } else {
        const cells = rangeOrCells.split(',').map(cell => cell.trim());
        const values = cells.map(cell => getCellValue(cell));
        return Math.min(...values);
    }
}

function handleCOUNT(operation) {
    const match = operation.match(/\((.*?)\)/);
    if (!match) throw new Error("Invalid COUNT formula. Expected format: COUNT(A1:B2) or COUNT(A1, A2, ...)");
    
    const rangeOrCells = match[1].trim();

    if (rangeOrCells.includes(':')) {
        const range = parseRange(rangeOrCells);
        return range.filter(cell => !isNaN(getCellValue(cell))).length;
    } else {
        const cells = rangeOrCells.split(',').map(cell => cell.trim());
        return cells.filter(cell => !isNaN(getCellValue(cell))).length;
    }
}

// Handle UPPER formula (in-place transformation)
// Handle UPPER formula (in-place transformation for range)
// Handle UPPER formula (in-place transformation for range or multiple individual cells)
function handleUPPER(operation) {
    const match = operation.match(/\((.*?)\)/);
    if (!match) throw new Error("Invalid UPPER formula. Expected format: UPPER(A1:B2) or UPPER(A1, B2, C3)");

    const rangeOrCells = match[1].trim();

    let range;
    if (rangeOrCells.includes(':')) {
        // Handle range (e.g., A1:B2)
        range = parseRange(rangeOrCells);
    } else {
        // Handle individual cells (e.g., A1, B2, C3)
        range = rangeOrCells.split(',').map(cell => cell.trim());
    }

    range.forEach(cell => {
        const cellElement = document.querySelector(`[data-cell="${cell}"]`);
        if (cellElement) {
            // Apply UPPER transformation to the content of each cell in the range
            cellElement.textContent = cellElement.textContent.toUpperCase();
        }
    });
}

// Handle LOWER formula (in-place transformation for range or multiple individual cells)
function handleLOWER(operation) {
    const match = operation.match(/\((.*?)\)/);
    if (!match) throw new Error("Invalid LOWER formula. Expected format: LOWER(A1:B2) or LOWER(A1, B2, C3)");

    const rangeOrCells = match[1].trim();

    let range;
    if (rangeOrCells.includes(':')) {
        // Handle range (e.g., A1:B2)
        range = parseRange(rangeOrCells);
    } else {
        // Handle individual cells (e.g., A1, B2, C3)
        range = rangeOrCells.split(',').map(cell => cell.trim());
    }

    range.forEach(cell => {
        const cellElement = document.querySelector(`[data-cell="${cell}"]`);
        if (cellElement) {
            // Apply LOWER transformation to the content of each cell in the range
            cellElement.textContent = cellElement.textContent.toLowerCase();
        }
    });
}




function handleTRIM(operation) {
    const match = operation.match(/\((.*?)\)/);
    if (!match) throw new Error("Invalid TRIM formula. Expected format: TRIM(A1:B2)");

    const rangeOrCells = match[1].trim();

    let range;
    if (rangeOrCells.includes(':')) {
        // Handle range (e.g., A1:B2)
        range = parseRange(rangeOrCells);
    } else {
        // Handle individual cells (e.g., A1, B2, C3)
        range = rangeOrCells.split(',').map(cell => cell.trim());
    }

    range.forEach(cell => {
        const cellElement = document.querySelector(`[data-cell="${cell}"]`);
        if (cellElement) {
            // Apply trim to the content of each cell in the range
            cellElement.textContent = cellElement.textContent.trim();
        }
    });
}

function parseRange(range) {
    // Extract start and end cells (e.g., "A1:B3")
    const [start, end] = range.split(':').map(cell => cell.trim());

    // Parse row and column for start and end
    const startCol = start[0];
    const startRow = parseInt(start.slice(1));
    const endCol = end[0];
    const endRow = parseInt(end.slice(1));

    const cells = [];
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol.charCodeAt(0); col <= endCol.charCodeAt(0); col++) {
            cells.push(String.fromCharCode(col) + row); // e.g., "A1", "B2"
        }
    }
    return cells;
}
// Handle REMOVE_DUPLICATES formula
function handleREMOVE_DUPLICATES(operation) {
    const match = operation.match(/\((.*?)\)/);
    if (!match) throw new Error("Invalid REMOVE_DUPLICATES formula. Expected format: REMOVE_DUPLICATES(A1:B2)");

    const rangeOrCells = match[1].trim();

    let range;
    if (rangeOrCells.includes(':')) {
        range = parseRange(rangeOrCells);
    } else {
        range = rangeOrCells.split(',').map(cell => cell.trim());
    }

    const seen = new Set();
    range.forEach(cell => {
        const cellElement = document.querySelector(`[data-cell="${cell}"]`);
        const value = cellElement.textContent.trim();
        if (seen.has(value)) {
            cellElement.textContent = ''; // Clear duplicate
        } else {
            seen.add(value);
        }
    });
}
function promptUserForFindAndReplace() {
    const range = prompt("Enter the range (e.g., A1:B2 or A1, B2, C3):");
    if (range === null) return;  // Exit if the user cancels

    const findText = prompt("Enter the word to find:");
    if (findText === null) return;  // Exit if the user cancels

    const replaceText = prompt("Enter the word to replace it with:");
    if (replaceText === null) return;  // Exit if the user cancels

    if (range && findText && replaceText) {
        const operation = `FIND_AND_REPLACE(${range}, '${findText}', '${replaceText}')`;
        handleFIND_AND_REPLACE(operation);
    } else {
        alert("Please provide all the required inputs.");
    }
}


// Get cell value by reference
function getCellValue(cellReference) {
    const cell = document.querySelector(`[data-cell="${cellReference.trim()}"]`);
    return cell && cell.textContent ? parseFloat(cell.textContent) || 0 : 0;
}

// Move to the next cell on Enter key press
function moveToNextCell() {
    const cells = Array.from(document.querySelectorAll('.cell[contenteditable="true"]'));
    const currentIndex = cells.indexOf(selectedCell);
    const nextCell = cells[currentIndex + 1];
    if (nextCell) {
        nextCell.focus();
    }
}

// Save spreadsheet data and charts into an Excel file
function saveSpreadsheet() {
    // Extract spreadsheet data
    const rows = Array.from(document.querySelectorAll('.row'));
    const data = rows.map(row => {
        const cells = Array.from(row.querySelectorAll('.cell'));
        return cells.map(cell => cell.textContent.trim());
    });

    // Create a workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Spreadsheet');

    // Check if a chart exists and export it
    const chartCanvas = document.getElementById('chartCanvas');
    if (chartCanvas) {
        const chartDataUrl = chartCanvas.toDataURL('image/png'); // Export chart as a data URL
        const chartImageSheet = XLSX.utils.aoa_to_sheet([['Chart Data'], ['Image Below']]);
        XLSX.utils.book_append_sheet(workbook, chartImageSheet, 'Charts');

        // Save the image URL in a separate file (or link to the Excel sheet if using advanced tools)
        alert("Note: Excel doesn't natively embed images. You can reference the exported image.");
    }

    // Save the workbook
    XLSX.writeFile(workbook, 'spreadsheet.xlsx');
}

// Function to run test cases and save results
function testFunctions() {
    const testData = [
        { formula: '=SUM(A1:A5)', expected: '15' },
        { formula: '=UPPER(A1)', expected: 'HELLO' },
        { formula: '=TRIM(A2)', expected: 'World' },
    ];

    const resultsDiv = document.getElementById('testResults');
    resultsDiv.innerHTML = '<h3>Test Results:</h3>';

    const testResults = testData.map(test => {
        const result = applyFormulaTest(test.formula);
        const passed = result == test.expected ? '✅ Passed' : `❌ Failed (Expected: ${test.expected}, Got: ${result})`;
        resultsDiv.innerHTML += `<p>${test.formula}: ${passed}</p>`;
        return { formula: test.formula, result, expected: test.expected, status: passed };
    });

    // Append test results to the workbook
    const workbook = XLSX.utils.book_new();
    const testSheetData = testResults.map(test => [test.formula, test.result, test.expected, test.status]);
    const testSheet = XLSX.utils.aoa_to_sheet([['Formula', 'Result', 'Expected', 'Status'], ...testSheetData]);
    XLSX.utils.book_append_sheet(workbook, testSheet, 'Test Results');

    XLSX.writeFile(workbook, 'test_results.xlsx');
}

// Function to simulate formula application for tests
function applyFormulaTest(formula) {
    const testCell = document.createElement('div');
    testCell.textContent = '';
    selectedCell = testCell;

    document.body.appendChild(testCell);
    document.getElementById('formulaBar').value = formula;
    applyFormula();

    const result = testCell.textContent;
    document.body.removeChild(testCell);
    return result;
}
let isDragging = false;
let dragStartCell = null;
let dragEndCell = null;


function findAndReplace(findText, replaceText, range) {
    range.forEach(cellRef => {
        const cell = document.querySelector(`[data-cell="${cellRef}"]`);
        if (cell && cell.textContent.includes(findText)) {
            cell.textContent = cell.textContent.replace(findText, replaceText);
        }
    });
}
// Apply styles like Bold, Italic, Underline to the selected cell
function applyStyle(style) {
    if (selectedCell) {
        document.execCommand(style, false, null);
    } else {
        alert('Select a cell to apply the style.');
    }
}
// Apply a color to the text of the selected cell
function applyColor(color) {
    if (selectedCell) {
        selectedCell.style.color = color;
    } else {
        alert('Select a cell to apply the color.');
    }
}
function addRow() {
    const spreadsheet = document.getElementById('spreadsheet');
    const rowCount = spreadsheet.querySelectorAll('.row').length + 1;

    const newRow = document.createElement('div');
    newRow.classList.add('row');
    newRow.innerHTML = `<div class="cell header">${rowCount}</div>`;

    for (let i = 0; i < 64; i++) {
        const cellId = `${getColumnLabel(i)}${rowCount}`;
        newRow.innerHTML += `<div class="cell" contenteditable="true" data-cell="${cellId}" data-type="text"></div>`;
    }

    spreadsheet.appendChild(newRow);
    attachCellListeners(); // Reattach listeners for new cells
}
function addColumn() {
    const spreadsheet = document.getElementById('spreadsheet');
    const colCount = spreadsheet.querySelector('.header-row').children.length - 1;

    const newHeader = document.createElement('div');
    newHeader.classList.add('cell', 'header');
    newHeader.textContent = getColumnLabel(colCount);
    spreadsheet.querySelector('.header-row').appendChild(newHeader);

    const rows = spreadsheet.querySelectorAll('.row');
    rows.forEach((row, index) => {
        const newCell = document.createElement('div');
        newCell.classList.add('cell');
        newCell.setAttribute('contenteditable', 'true');
        newCell.setAttribute('data-cell', `${getColumnLabel(colCount)}${index + 1}`);
        newCell.setAttribute('data-type', 'text');
        row.appendChild(newCell);
    });

    attachCellListeners(); // Reattach listeners for new cells
}
// Data validation function
function validateCell(cell, value) {
    const type = cell.dataset.type;
    let isValid = true;
    let message = '';

    if (type === 'number') {
        isValid = !isNaN(value) && value.trim() !== '';
        message = 'Please enter a valid number';
    } else if (type === 'date') {
        isValid = !isNaN(Date.parse(value));
        message = 'Please enter a valid date';
    }

    const messageDiv = document.getElementById('dataValidationMessage');
    messageDiv.textContent = isValid ? '' : message;
    return isValid;
}

// Set cell data type
function setCellType(cell, type) {
    cell.dataset.type = type;
    validateCell(cell, cell.textContent);
}

// Load spreadsheet function
function loadSpreadsheet(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        // Clear existing data
        const spreadsheet = document.getElementById('spreadsheet');
        spreadsheet.innerHTML = '';

        // Recreate the header row
        const headerRow = document.createElement('div');
        headerRow.classList.add('header-row');
        headerRow.innerHTML = `<div class="cell header"></div>`;
        for (let col = 0; col < jsonData[0].length; col++) {
            headerRow.innerHTML += `<div class="cell header">${getColumnLabel(col)}</div>`;
        }
        spreadsheet.appendChild(headerRow);

        // Populate data
        jsonData.forEach((rowData, rowIndex) => {
            const row = document.createElement('div');
            row.classList.add('row');
            row.innerHTML = `<div class="cell header">${rowIndex + 1}</div>`;

            rowData.forEach((cellData, colIndex) => {
                const cellId = `${getColumnLabel(colIndex)}${rowIndex + 1}`;
                row.innerHTML += `
                    <div class="cell" 
                         contenteditable="true" 
                         data-cell="${cellId}" 
                         data-type="text">${cellData || ''}</div>`;
            });
            spreadsheet.appendChild(row);
        });

        attachCellListeners();
    };

    reader.readAsArrayBuffer(file);
}

// Create chart function
function createChart() {
    if (!selectedCell) {
        alert('Please select a range of cells to create a chart');
        return;
    }

    // Get the selected range (assuming it's stored in a variable)
    const range = getSelectedRange(); // You'll need to implement this
    const data = [];
    const labels = [];

    // Extract data from the selected range
    range.forEach(cellRef => {
        const cell = document.querySelector(`[data-cell="${cellRef}"]`);
        if (cell) {
            const value = parseFloat(cell.textContent);
            if (!isNaN(value)) {
                data.push(value);
                labels.push(cellRef);
            }
        }
    });

    // Create the chart
    const ctx = document.getElementById('chartCanvas').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cell Values',
                data: data,
                backgroundColor: 'rgba(66, 133, 244, 0.5)',
                borderColor: 'rgb(66, 133, 244)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Get selected range helper function
function getSelectedRange() {
    if (!dragStartCell || !dragEndCell) return [];

    const startCol = dragStartCell.dataset.cell.match(/[A-Z]+/)[0];
    const startRow = parseInt(dragStartCell.dataset.cell.match(/\d+/)[0]);
    const endCol = dragEndCell.dataset.cell.match(/[A-Z]+/)[0];
    const endRow = parseInt(dragEndCell.dataset.cell.match(/\d+/)[0]);

    const range = [];
    for (let col = startCol.charCodeAt(0); col <= endCol.charCodeAt(0); col++) {
        for (let row = startRow; row <= endRow; row++) {
            range.push(`${String.fromCharCode(col)}${row}`);
        }
    }
    return range;
}



let selectedRowIndex = null; // Track selected row
let selectedColumnIndex = null; // Track selected column

function deleteRow(index) {
    if (index === null) {
        alert('Please select a row to delete');
        return;
    }

    if (confirm('Are you sure you want to delete this row?')) {
        const spreadsheet = document.getElementById('spreadsheet');
        const rows = spreadsheet.querySelectorAll('.row');
        
        if (index < rows.length) {
            const rowToDelete = rows[index];
            spreadsheet.removeChild(rowToDelete);
            // Update row numbers
            updateRowNumbers();
            
            // Reset selection
            selectedRowIndex = null;
            selectedCell = null;
            
            // Clear formula bar
            document.getElementById('formulaBar').value = '';
        }
    }
}


function updateRowNumbers() {
    const rows = document.querySelectorAll('.row');
    rows.forEach((row, index) => {
        const headerCell = row.querySelector('.cell.header');
        if (headerCell) {
            headerCell.textContent = index + 1;
        }
    });
}





function deleteColumn(colIndex) {
    if (colIndex === null) {
        alert('Please select a column to delete');
        return;
    }

    if (!confirm('Are you sure you want to delete this column?')) {
        return;
    }

    const spreadsheet = document.getElementById('spreadsheet');
    
    // Delete from header row first
    const headerRow = spreadsheet.querySelector('.header-row');
    if (headerRow) {
        const headerCells = headerRow.querySelectorAll('.cell');
        // Add 1 to colIndex because first cell is empty corner cell
        if (colIndex + 1 < headerCells.length) {
            headerRow.removeChild(headerCells[colIndex + 1]);
        }
    }

    // Delete from data rows
    const rows = spreadsheet.querySelectorAll('.row');
    rows.forEach(row => {
        const cells = row.querySelectorAll('.cell');
        // Add 1 to colIndex because first cell is row header
        if (colIndex + 1 < cells.length) {
            row.removeChild(cells[colIndex + 1]);
        }
    });

    // Update column labels
    updateColumnLabels();
    
    // Reset selection
    selectedColumnIndex = null;
    selectedCell = null;
    document.getElementById('formulaBar').value = '';
}

// Modified column label update function
function updateColumnLabels() {
    const headerRow = document.querySelector('.header-row');
    const headers = headerRow.querySelectorAll('.cell.header');
    
    // Skip first header cell (corner cell)
    for (let i = 1; i < headers.length; i++) {
        headers[i].textContent = getColumnLabel(i - 1);
    }

    // Update data cell references
    const rows = document.querySelectorAll('.row');
    rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll('.cell[contenteditable="true"]');
        cells.forEach((cell, colIndex) => {
            const newCellId = `${getColumnLabel(colIndex)}${rowIndex + 1}`;
            cell.setAttribute('data-cell', newCellId);
        });
    });
}

// Update the cell selection handling to track column index correctly
function attachCellListeners() {
    document.querySelectorAll('.cell[contenteditable="true"]').forEach(cell => {
        cell.addEventListener('focus', () => {
            selectedCell = cell;
            
            // Get row index
            const row = cell.closest('.row');
            const allRows = Array.from(document.querySelectorAll('.row'));
            selectedRowIndex = allRows.indexOf(row);

            // Get column index by finding position within row (subtract 1 for row header)
            const cells = Array.from(cell.parentElement.querySelectorAll('.cell'));
            selectedColumnIndex = cells.indexOf(cell) - 1;

            // Update formula bar
            document.getElementById('formulaBar').value = cell.textContent;
        });

        // Keep your existing cell event listeners here
        cell.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const formulaBarValue = document.getElementById('formulaBar').value.trim();
                cell.innerHTML = formulaBarValue;
                applyFormula();
                moveToNextCell();
            }
        });

        cell.addEventListener('input', () => {
            if (selectedCell === cell) {
                document.getElementById('formulaBar').value = cell.textContent;
            }
        });
    });
}

// Add keyboard shortcut for delete
document.addEventListener('keydown', function(e) {
    if (e.key === 'Delete') {
        if (selectedColumnIndex !== null) {
            deleteColumn(selectedColumnIndex);
        } else if (selectedRowIndex !== null) {
            deleteRow(selectedRowIndex);
        }
    }
});
