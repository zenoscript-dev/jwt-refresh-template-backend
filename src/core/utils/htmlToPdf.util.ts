import puppeteer from 'puppeteer';
import { Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs'; // Ensure correct import of fs module
import { Workbook } from 'exceljs';

// generate pdf from html
export const generatePdfFromHtml = async () => {
  try {
    // Set margins (optional, adjust as needed)
    const margins = {
      top: '1cm',
      right: '1cm',
      bottom: '1cm',
      left: '1cm',
    };

    // Set HTML content
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>User Data</title>
        <style>
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th, td {
                border: 1px solid #000;
                padding: 8px;
                text-align: left;
            }
            th {
                background-color: #f2f2f2;
            }
        </style>
    </head>
    <body>
        <h1>User Data</h1>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Age</th>
                    <th>Country</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>John Doe</td>
                    <td>john.doe@example.com</td>
                    <td>30</td>
                    <td>USA</td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>Jane Smith</td>
                    <td>jane.smith@example.com</td>
                    <td>25</td>
                    <td>Canada</td>
                </tr>
                <tr>
                    <td>3</td>
                    <td>Mike Johnson</td>
                    <td>mike.johnson@example.com</td>
                    <td>35</td>
                    <td>UK</td>
                </tr>
                <tr>
                    <td>4</td>
                    <td>Emily Davis</td>
                    <td>emily.davis@example.com</td>
                    <td>28</td>
                    <td>Australia</td>
                </tr>
                <tr>
                    <td>5</td>
                    <td>David Wilson</td>
                    <td>david.wilson@example.com</td>
                    <td>40</td>
                    <td>Germany</td>
                </tr>
            </tbody>
        </table>
    </body>
    </html>`;

    // Ensure the public directory exists
    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    } else {
    }

    // Resolve file path to the public folder
    const filePath = path.join(publicDir, 'output.pdf');

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true, // Ensure headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Useful for some environments
    });

    // Create a new page
    const page = await browser.newPage();

    // Set content with a higher timeout
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 60000,
    });

    // Generate PDF with a higher timeout
    await page.pdf({ path: filePath, format: 'A4', margin: margins });

    // Close the browser
    await browser.close();
  } catch (error) {
    Logger.error('Error during PDF generation:', error); // Log the actual error
    throw new Error(error); // Re-throw the error
  }
};

// generate csv from html

// Sample data - replace this with data from your database
const databaseColumns = [
  { id: 1, name: 'John', age: 30, country: 'USA' },
  { id: 2, name: 'Jane', age: 25, country: 'Canada' },
  { id: 3, name: 'Mike', age: 35, country: 'UK' },
  { id: 4, name: 'Emily', age: 28, country: 'Australia' },
  { id: 5, name: 'David', age: 40, country: 'Germany' },
];

// Function to generate Excel file
export const generateExcelFile = async (data?: []) => {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet('Database Columns');

  // Define columns
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Name', key: 'name', width: 20 },
    { header: 'Age', key: 'age', width: 10 },
    { header: 'Country', key: 'country', width: 20 },
  ];

  // Add rows from database columns
  databaseColumns.forEach((row) => {
    worksheet.addRow(row);
  });

  // Generate Excel file
  const filePath = 'database_columns.xlsx';
  await workbook.xlsx.writeFile(filePath);
  console.log(`Excel file generated: ${filePath}`);
};
