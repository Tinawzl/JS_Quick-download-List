# JS_Quick-download-list

JavaScript console scripts for automating data extraction from the  
**HSA Closed Applications** portal.

> ✅ All scripts are designed to be run directly in the **browser DevTools Console**.

---

## Overview

This repository contains **three small JavaScript automation scripts** that help reduce repetitive manual work on the HSA Closed Applications list, including filtering, record navigation, and data extraction.

---

## Scripts Overview

### 1) Step1 – Automated Classification (Auto Filter)

**Goal:**  
Automatically apply standard filters on the **Closed Applications** list page.

**What it does:**
- Clicks the top **Search** button to open the filter panel
- Sets:
  - **Application Type** → `Distribution Records`
  - **Submission Type** → `Special Access Route`
- Clicks the bottom **Search** button to run the filter

**Use when:**  
You want to standardise the Closed Applications list before further processing.

---

### 2) Step2 – Catch UDI  
*(Application No. + Licence Number)*

**Goal:**  
Batch extract key fields from each application’s **SAR Distribution Record** page.

**What it does:**
- Iterates through cards in the filtered list
- Opens each record and navigates to **SAR Distribution Record**
- Extracts:
  - `Application No.`
  - `Licence Number`
- Stores results in `window.sarResults`
- Outputs results as CSV (Excel-compatible)

**Note:**  
This script handles page navigation issues by keeping the main list page alive and processing details in a controlled way.

---

### 3) Step3 – Catch Application No + Closure Date  
*(List Page Only)*

**Goal:**  
Extract data directly from the list view **without entering “View” pages**.

**What it does:**
- Automatically scrolls until all cards are fully loaded
- Extracts from each card:
  - `Application No`
  - `Closure Date`
- Generates a downloadable CSV file (can be opened in Excel)

**Use when:**  
You only need list-level data and want the fastest possible extraction.

---

## How to Use

### Prerequisites
- Chrome / Edge browser
- Logged in to the HSA portal
- Navigate to **Closed Applications**
- Open DevTools:
  - **Windows:** `F12` or `Ctrl + Shift + I`
  - **Mac:** `Cmd + Option + I`
- Switch to the **Console** tab

---

### Running a Script
1. Open the required HSA page
2. Copy the script content
3. Paste it into the **Console**
4. Press **Enter**

---

## Recommended Workflow

1. Run **Step1 – Automated Classification**  
2. Run **Step2 – Catch UDI** *(if Licence Number is required)*  
   **or**  
3. Run **Step3 – Catch Application No + Closure Date** *(list-only, faster)*

---

## Output

- Results are printed using `console.table(...)`
- Data is stored in:
  - `window.sarResults` or `window.cardResults`
- CSV files are automatically generated for Excel use

---

## Notes

- Allow pop-ups for the HSA site if prompted
- Lazy loading is handled via automatic scrolling
- If the HSA UI structure changes, selectors may need minor updates

---

*For internal efficiency and automation purposes only.*
