# PulseSales — Enterprise Sales Analytics Dashboard

A lightweight, single-page enterprise sales analytics dashboard built with vanilla HTML5, CSS3, and JavaScript. Zero frameworks, zero build tools, zero external backends, and zero CSS variables.

All transaction data is persisted client-side using browser Web Storage (`localStorage`), with full CRUD capabilities, responsive interactive charts, dynamic KPI cards, and CSV export.

---

## Features

- **Executive KPI Cards**: Real-time calculations for Gross Revenue, Net Profit (estimated), Total Orders, Average Order Value (AOV), and Target Attainment (%) with period-over-period trend comparisons.
- **Interactive Visualizations (Chart.js)**:
  - **Revenue & Net Margin Trend**: Dual-axis line and area curve tracking daily performance.
  - **Sales by Category**: Donut chart detailing distribution across product lines.
  - **Sales by Channel**: Bar breakdown across Online Store, Retail, B2B Wholesale, and Social Media.
  - **Top Performing Items Leaderboard**: Ranked top 5 items by gross sales volume.
- **Client-Side Persistence (`localStorage`)**:
  - Automatically initializes with realistic demonstration records.
  - Synchronizes all additions, edits, and deletions instantly.
  - One-click **Reset Data** button to restore sample records.
- **Transaction Management**:
  - **Record New Sale**: Modal dialog with dynamic `Quantity × Unit Price` calculation and form validation.
  - **Receipt Inspector**: Itemized transaction breakdown with one-click print functionality.
  - **Live Filter & Search**: Search across customer name, email, product, or order ID with category, channel, and status filters.
  - **Export CSV**: Download active filtered transactions directly into a CSV file.
- **Design & Palette**:
  - **Background**: Modern Off-White (`#f7f8fc`)
  - **Primary Color**: Deep Purple (`#4A148C`)
  - **Secondary Color**: Skyblue (`#38bdf8`)
  - **CSS Architecture**: Pure standard CSS without CSS variables (`var(--...)`), ensuring direct cross-browser reliability.

---

## Quick Start

No package manager or build step is required:

1. Clone the repository:
   ```bash
   git clone https://github.com/Jubilant360/sales-analytics-dashboard.git
   cd sales-analytics-dashboard
   ```
2. Open `index.html` in any modern web browser:
   - On Windows: double-click `index.html` or run `start index.html` in PowerShell.
   - On macOS: `open index.html`
   - On Linux: `xdg-open index.html`

---

## Project Structure

```text
├── index.html        # Single-page dashboard markup and modal dialogs
├── style.css         # Styling (Off-white, Deep Purple, Skyblue - zero CSS variables)
├── app.js            # Analytics calculations, Chart.js configuration, localStorage sync
├── .gitignore        # Git ignore rules
└── README.md         # Project documentation
```

---

## License

MIT License. Free for personal and commercial use.
