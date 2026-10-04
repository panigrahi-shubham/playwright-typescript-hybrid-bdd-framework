// ============================================================================
// WEB TABLES: row count, column count, cell data, read whole table,
//             search and verify, click buttons inside a row
// ============================================================================
//
// HOW AN HTML TABLE IS BUILT (this is the most important picture):
//
//   <table>
//     <thead>                      <- the header part
//       <tr>                       <- tr = ONE ROW
//         <th>Name</th>            <- th = one HEADER cell (column title)
//         <th>Age</th>
//       </tr>
//     </thead>
//     <tbody>                      <- the data part
//       <tr>                       <- one data ROW
//         <td>Cierra</td>          <- td = one DATA cell
//         <td>39</td>
//       </tr>
//     </tbody>
//   </table>
//
//   Row    = tr      Column title = th      Cell = td
//
// So in Playwright:
//   count rows    -> count the  tr  inside tbody
//   count columns -> count the  th  inside thead
//   read a cell   -> pick a tr, then pick a td inside it

import { test, expect } from '@playwright/test';

// ----------------------------------------------------------------------------
// OUR PRACTICE PAGE
// We build a small table ourselves so the test needs NO internet and the data
// never changes. (Comments cannot go inside the string, so read them here.)
//
//   - a search box (#search) that hides rows which do not match what you type
//   - a table (#users) with 4 data rows and 5 columns
//   - the last column holds two buttons: Edit and Delete
//   - Edit   -> writes "Editing <name>" into the #message line
//   - Delete -> removes that whole row from the table
// ----------------------------------------------------------------------------
const tableHtml = `
<html><body>
  <input id="search" placeholder="Search">

  <table id="users" border="1">
    <thead>
      <tr><th>Name</th><th>Age</th><th>Email</th><th>Department</th><th>Action</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>Cierra Vega</td><td>39</td><td>cierra@example.com</td><td>Insurance</td>
        <td><button class="edit">Edit</button> <button class="delete">Delete</button></td>
      </tr>
      <tr>
        <td>Alden Cantrell</td><td>45</td><td>alden@example.com</td><td>Compliance</td>
        <td><button class="edit">Edit</button> <button class="delete">Delete</button></td>
      </tr>
      <tr>
        <td>Kierra Gentry</td><td>29</td><td>kierra@example.com</td><td>Legal</td>
        <td><button class="edit">Edit</button> <button class="delete">Delete</button></td>
      </tr>
      <tr>
        <td>Reyna Patel</td><td>34</td><td>reyna@example.com</td><td>Sales</td>
        <td><button class="edit">Edit</button> <button class="delete">Delete</button></td>
      </tr>
    </tbody>
  </table>

  <div id="message"></div>

  <script>
    // Search box: hide every row whose text does not contain what was typed
    document.getElementById('search').addEventListener('input', function (e) {
      var text = e.target.value.toLowerCase();
      document.querySelectorAll('#users tbody tr').forEach(function (tr) {
        tr.style.display = tr.textContent.toLowerCase().includes(text) ? '' : 'none';
      });
    });

    // Edit button: show "Editing <name of that row>"
    document.querySelectorAll('.edit').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var name = btn.closest('tr').children[0].textContent;
        document.getElementById('message').textContent = 'Editing ' + name;
      });
    });

    // Delete button: remove the row that the button is inside
    document.querySelectorAll('.delete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        btn.closest('tr').remove();
      });
    });
  </script>
</body></html>`;

// ----------------------------------------------------------------------------
// Runs before EACH test: load our practice page into the browser tab.
// For a REAL website, replace this line with:  await page.goto('https://...');
// ----------------------------------------------------------------------------
test.beforeEach(async ({ page }) => {
    await page.setContent(tableHtml);
});

// ============================================================================
// TEST 1: ROW COUNT
// ============================================================================
test('1. count rows', async ({ page }) => {
    // Find ALL data rows: every tr inside tbody.
    // (We use tbody so the header row is NOT counted.)
    const rows = page.locator('#users tbody tr');

    // Check there are exactly 4 rows.
    await expect(rows).toHaveCount(4);

    // If you need the number itself as a variable, use .count()
    const rowCount = await rows.count();
    console.log('Number of rows:', rowCount);   // prints 4
});

// ============================================================================
// TEST 2: COLUMN COUNT
// ============================================================================
test('2. count columns', async ({ page }) => {
    // Columns are counted from the header: every th inside thead.
    const headers = page.locator('#users thead th');

    // Name, Age, Email, Department, Action = 5 columns.
    await expect(headers).toHaveCount(5);

    // Read all the column titles at once as a list of text.
    const titles = await headers.allInnerTexts();
    console.log('Column titles:', titles);

    // Check the titles are what we expect, in this order.
    expect(titles).toEqual(['Name', 'Age', 'Email', 'Department', 'Action']);
});

// ============================================================================
// TEST 3: READ ONE CELL
// ============================================================================
test('3. read cell data', async ({ page }) => {
    const rows = page.locator('#users tbody tr');

    // nth(0) = FIRST row, nth(1) = SECOND row, nth(2) = THIRD ... (counting starts at 0!)
    // Then, inside that row, pick the cell (td) by its position the same way.
    //
    //   second row (index 1), first cell (index 0)  -> the Name
    //   second row (index 1), second cell (index 1) -> the Age
    const name = rows.nth(1).locator('td').nth(0);
    const age = rows.nth(1).locator('td').nth(1);

    // Check the cell text.
    await expect(name).toHaveText('Alden Cantrell');
    await expect(age).toHaveText('45');

    // To store the text in a variable, use .innerText()
    const email = await rows.nth(1).locator('td').nth(2).innerText();
    console.log('Email of row 2:', email);   // alden@example.com
});

// ============================================================================
// TEST 4: READ THE ENTIRE TABLE
// ============================================================================
test('4. read entire table', async ({ page }) => {
    const rows = page.locator('#users tbody tr');
    const rowCount = await rows.count();

    // This list will hold the whole table: a list of rows,
    // and each row is a list of cell texts.
    const tableData: string[][] = [];

    // Go through the rows one by one: row 0, row 1, row 2 ...
    for (let i = 0; i < rowCount; i++) {
        // allInnerTexts() returns the text of EVERY td in this row as a list.
        const cells = await rows.nth(i).locator('td').allInnerTexts();
        // Add that row to our big list.
        tableData.push(cells);
    }

    // Print the whole table in the terminal as a neat grid.
    console.table(tableData);

    // Check the size: 4 rows in total.
    expect(tableData).toHaveLength(4);

    // Check the first row. slice(0, 4) = take only the first 4 cells,
    // so we skip the "Action" cell that only holds buttons.
    expect(tableData[0].slice(0, 4)).toEqual([
        'Cierra Vega', '39', 'cierra@example.com', 'Insurance',
    ]);
});

// ============================================================================
// TEST 5: SEARCH AND VERIFY
// ============================================================================
test('5a. find a row by its text', async ({ page }) => {
    const rows = page.locator('#users tbody tr');

    // filter({ hasText }) keeps only the rows that contain this text.
    const alden = rows.filter({ hasText: 'Alden Cantrell' });

    // Exactly one row should match.
    await expect(alden).toHaveCount(1);

    // Now work INSIDE that row: its second cell (index 1) is the age.
    await expect(alden.locator('td').nth(1)).toHaveText('45');

    // A name that is NOT in the table should give 0 rows.
    await expect(rows.filter({ hasText: 'Nobody Here' })).toHaveCount(0);
});

test('5b. use the search box, then verify the table', async ({ page }) => {
    // ":visible" means: count only the rows the user can actually see.
    const visibleRows = page.locator('#users tbody tr:visible');

    // Type "legal" into the search box.
    await page.locator('#search').fill('legal');

    // Only ONE row should still be visible, and it must be Kierra's.
    await expect(visibleRows).toHaveCount(1);
    await expect(visibleRows.first()).toContainText('Kierra Gentry');

    // Type something that matches nothing: no rows should be visible.
    await page.locator('#search').fill('zzzz');
    await expect(visibleRows).toHaveCount(0);

    // Clear the box: all 4 rows come back.
    await page.locator('#search').fill('');
    await expect(visibleRows).toHaveCount(4);
});

// ============================================================================
// TEST 6: CLICK ACTION BUTTONS IN A ROW
// ============================================================================
test('6a. click Edit in a specific row', async ({ page }) => {
    // Step 1: find the ROW you want (by text). This is the key idea:
    //         first pick the row, THEN pick the button inside that row.
    const row = page.locator('#users tbody tr').filter({ hasText: 'Kierra Gentry' });

    // Step 2: click the Edit button INSIDE that row only.
    // (Every row has an Edit button, so we must not search the whole page.)
    await row.getByRole('button', { name: 'Edit' }).click();

    // Step 3: verify what happened.
    await expect(page.locator('#message')).toHaveText('Editing Kierra Gentry');
});

test('6b. click Delete in a specific row', async ({ page }) => {
    const rows = page.locator('#users tbody tr');
    const row = rows.filter({ hasText: 'Reyna Patel' });

    // Before: 4 rows, and Reyna's row exists.
    await expect(rows).toHaveCount(4);
    await expect(row).toHaveCount(1);

    // Click Delete inside Reyna's row.
    await row.getByRole('button', { name: 'Delete' }).click();

    // After: 3 rows, and Reyna's row is gone.
    await expect(rows).toHaveCount(3);
    await expect(row).toHaveCount(0);
});