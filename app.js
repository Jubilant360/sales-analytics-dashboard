/**
 * PulseSales — Enterprise Sales Analytics Dashboard
 * Vanilla JavaScript implementation
 * Pure Web Storage (localStorage) persistence
 * Color Palette: Deep Purple (#4A148C) and Skyblue (#38bdf8)
 */

(function () {
  'use strict';

  // --- Constants & Storage Keys ---
  const STORAGE_KEY = 'pulse_sales_dashboard_records_v1';
  const MONTHLY_TARGET = 85000;

  // Primary: Deep Purple, Secondary: Skyblue palette constants for Chart.js
  const COLORS = {
    deepPurple: '#4A148C',
    deepPurpleRgba: 'rgba(74, 20, 140, 1)',
    deepPurpleAlpha: 'rgba(74, 20, 140, 0.15)',
    deepPurpleLight: '#7c3aed',
    skyblue: '#38bdf8',
    skyblueRgba: 'rgba(56, 189, 248, 1)',
    skyblueAlpha: 'rgba(56, 189, 248, 0.2)',
    skyblueDark: '#0284c7',
    purpleAccent: '#9333ea',
    lightPurple: '#c084fc',
    grayBorder: '#e2e8f0',
    textDark: '#1e293b',
    textMuted: '#64748b'
  };

  // Generate Seed Data based on today's date so date filters (7D, 30D, 90D, 1Y) work realistically
  function generateSeedData() {
    const today = new Date();
    const categories = ['Electronics', 'Software', 'Hardware', 'Apparel', 'Services'];
    const channels = ['Online Store', 'Retail Store', 'B2B Wholesale', 'Social Media'];
    const statuses = ['Completed', 'Completed', 'Completed', 'Completed', 'Pending', 'Refunded'];

    const mockCatalog = [
      { product: 'Quantum Ultra Laptop 16"', category: 'Electronics', price: 1899.99 },
      { product: 'Enterprise Cloud Suite (Annual)', category: 'Software', price: 2400.00 },
      { product: 'Ergonomic Standing Desk Pro', category: 'Hardware', price: 749.50 },
      { product: 'Wireless Noise-Canceling Headphones', category: 'Electronics', price: 349.00 },
      { product: 'Cybersecurity Threat Audit', category: 'Services', price: 3200.00 },
      { product: 'Team Collaboration Hub License', category: 'Software', price: 650.00 },
      { product: 'Executive Office Mesh Chair', category: 'Hardware', price: 420.00 },
      { product: 'Developer Performance Workstation', category: 'Hardware', price: 2850.00 },
      { product: 'Premium Corporate Branded Hoodie', category: 'Apparel', price: 85.00 },
      { product: 'Cloud DevOps Migration Consultation', category: 'Services', price: 4500.00 },
      { product: 'Dual 4K IPS HDR Monitor Set', category: 'Electronics', price: 890.00 },
      { product: 'AI Data Analytics Platform API', category: 'Software', price: 1500.00 }
    ];

    const mockCustomers = [
      { name: 'Sarah Jenkins', email: 'sarah.j@acme-corp.com' },
      { name: 'Marcus Sterling', email: 'marcus@sterlingtech.io' },
      { name: 'Elena Rostova', email: 'elena.rostova@quantum.ai' },
      { name: 'David Chen', email: 'dchen@innovate.co' },
      { name: 'Amara Okafor', email: 'amara.okafor@zenithlabs.org' },
      { name: 'Lucas Vance', email: 'lvance@horizonpartners.com' },
      { name: 'Chloe Dubois', email: 'chloe@luxedesign.fr' },
      { name: 'Benjamin Hayes', email: 'b.hayes@apexlogistics.com' },
      { name: 'Priya Sharma', email: 'psharma@cloudsphere.net' },
      { name: 'Gabriel Santana', email: 'gabriel@vortexmedia.br' },
      { name: 'Hannah Wright', email: 'hwright@summitfinancial.com' },
      { name: 'Liam O’Connor', email: 'liam.oc@emeraldtech.ie' }
    ];

    const records = [];
    let counter = 1042;

    // Distribute 32 transactions across the past 75 days
    const dayOffsets = [
      0, 1, 1, 2, 3, 4, 5, 7, 8, 10, 12, 14, 15, 18, 20, 22, 24, 27, 29, 31, 35, 38, 42, 45, 50, 54, 58, 62, 65, 70, 72, 75
    ];

    dayOffsets.forEach((daysAgo, idx) => {
      const d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      const dateStr = d.toISOString().split('T')[0];

      const item = mockCatalog[idx % mockCatalog.length];
      const customer = mockCustomers[idx % mockCustomers.length];
      const channel = channels[idx % channels.length];
      const status = statuses[idx % statuses.length];
      const qty = (idx % 3 === 0) ? 2 : (idx % 5 === 0 ? 3 : 1);
      const total = parseFloat((item.price * qty).toFixed(2));

      records.push({
        id: `ORD-${counter++}`,
        customer: customer.name,
        email: customer.email,
        product: item.product,
        category: item.category,
        quantity: qty,
        unitPrice: item.price,
        total: total,
        channel: channel,
        status: status,
        date: dateStr
      });
    });

    return records;
  }

  // --- Application State ---
  const state = {
    sales: [],
    dateRange: '30', // '7', '30', '90', '365', 'all'
    searchQuery: '',
    categoryFilter: 'all',
    channelFilter: 'all',
    statusFilter: 'all',
    sortField: 'date',
    sortOrder: 'desc',
    currentPage: 1,
    itemsPerPage: 8,
    charts: {
      trend: null,
      category: null,
      channel: null
    }
  };

  // --- DOM Elements Cache ---
  const elements = {
    // KPI elements
    kpiRevenue: document.getElementById('kpiRevenue'),
    kpiRevenueGrowth: document.getElementById('kpiRevenueGrowth'),
    kpiRevenueTrend: document.getElementById('kpiRevenueTrend'),
    kpiNetProfit: document.getElementById('kpiNetProfit'),
    kpiOrders: document.getElementById('kpiOrders'),
    kpiOrdersGrowth: document.getElementById('kpiOrdersGrowth'),
    kpiAvgItems: document.getElementById('kpiAvgItems'),
    kpiAov: document.getElementById('kpiAov'),
    kpiAovGrowth: document.getElementById('kpiAovGrowth'),
    kpiMedianSale: document.getElementById('kpiMedianSale'),
    kpiTargetRate: document.getElementById('kpiTargetRate'),
    targetProgressBar: document.getElementById('targetProgressBar'),

    // Date filters & Toolbar
    dateFilterGroup: document.getElementById('dateFilterGroup'),
    filterBanner: document.getElementById('filterBanner'),
    filterBannerText: document.getElementById('filterBannerText'),
    clearFiltersBtn: document.getElementById('clearFiltersBtn'),
    exportCsvBtn: document.getElementById('exportCsvBtn'),
    resetDataBtn: document.getElementById('resetDataBtn'),
    openNewSaleModalBtn: document.getElementById('openNewSaleModalBtn'),

    // Table elements
    salesTableBody: document.getElementById('salesTableBody'),
    tableEmptyState: document.getElementById('tableEmptyState'),
    transactionCountBadge: document.getElementById('transactionCountBadge'),
    tableSearchInput: document.getElementById('tableSearchInput'),
    categoryFilterSelect: document.getElementById('categoryFilterSelect'),
    channelFilterSelect: document.getElementById('channelFilterSelect'),
    statusFilterSelect: document.getElementById('statusFilterSelect'),
    paginationInfo: document.getElementById('paginationInfo'),
    prevPageBtn: document.getElementById('prevPageBtn'),
    nextPageBtn: document.getElementById('nextPageBtn'),
    pageNumbers: document.getElementById('pageNumbers'),
    tableHeaders: document.querySelectorAll('.sales-table th[data-sort]'),

    // Top Products List
    topProductsList: document.getElementById('topProductsList'),

    // Add Sale Modal
    saleModalBackdrop: document.getElementById('saleModalBackdrop'),
    closeSaleModalBtn: document.getElementById('closeSaleModalBtn'),
    cancelSaleModalBtn: document.getElementById('cancelSaleModalBtn'),
    saleForm: document.getElementById('saleForm'),
    modalTitle: document.getElementById('modalTitle'),
    saleEditId: document.getElementById('saleEditId'),
    customerNameInput: document.getElementById('customerNameInput'),
    customerEmailInput: document.getElementById('customerEmailInput'),
    productNameInput: document.getElementById('productNameInput'),
    categoryInput: document.getElementById('categoryInput'),
    quantityInput: document.getElementById('quantityInput'),
    unitPriceInput: document.getElementById('unitPriceInput'),
    totalAmountDisplay: document.getElementById('totalAmountDisplay'),
    channelInput: document.getElementById('channelInput'),
    statusInput: document.getElementById('statusInput'),
    saleDateInput: document.getElementById('saleDateInput'),

    // View Details Modal
    viewModalBackdrop: document.getElementById('viewModalBackdrop'),
    closeViewModalBtn: document.getElementById('closeViewModalBtn'),
    closeViewModalBtn2: document.getElementById('closeViewModalBtn2'),
    viewOrderId: document.getElementById('viewOrderId'),
    receiptContent: document.getElementById('receiptContent'),
    printReceiptBtn: document.getElementById('printReceiptBtn'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer')
  };

  // --- Web Storage Helper Functions ---
  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse localStorage data, restoring sample dataset:', e);
    }
    const seed = generateSeedData();
    saveToStorage(seed);
    return seed;
  }

  function saveToStorage(records) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      showToast('Web storage quota exceeded or unavailable', 'error');
    }
  }

  // --- Formatters ---
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return dateStr;
  };

  // --- Toast Notifications ---
  function showToast(message, type = 'info') {
    if (!elements.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-solid fa-circle-info';
    if (type === 'success') iconClass = 'fa-solid fa-circle-check';
    if (type === 'error') iconClass = 'fa-solid fa-triangle-exclamation';
    if (type === 'purple') iconClass = 'fa-solid fa-bolt';

    toast.innerHTML = `<i class="${iconClass}"></i><span>${message}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(30px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3200);
  }

  // --- Date Range Filter Logic ---
  function getFilteredByDateRange(records, rangeKey) {
    if (rangeKey === 'all') return records;

    const days = parseInt(rangeKey, 10);
    if (isNaN(days)) return records;

    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - days);

    return records.filter(item => {
      const itemDate = new Date(item.date + 'T00:00:00');
      return itemDate >= cutoff;
    });
  }

  function getPreviousPeriodRange(records, rangeKey) {
    if (rangeKey === 'all') return [];

    const days = parseInt(rangeKey, 10);
    if (isNaN(days)) return [];

    const endCutoff = new Date();
    endCutoff.setHours(0, 0, 0, 0);
    endCutoff.setDate(endCutoff.getDate() - days);

    const startCutoff = new Date(endCutoff);
    startCutoff.setDate(startCutoff.getDate() - days);

    return records.filter(item => {
      const itemDate = new Date(item.date + 'T00:00:00');
      return itemDate >= startCutoff && itemDate < endCutoff;
    });
  }

  // --- Filtering & Sorting Data Pipeline ---
  function getComputedSales() {
    // 1. Date Range Filter
    let list = getFilteredByDateRange(state.sales, state.dateRange);

    // 2. Category Filter
    if (state.categoryFilter !== 'all') {
      list = list.filter(item => item.category === state.categoryFilter);
    }

    // 3. Channel Filter
    if (state.channelFilter !== 'all') {
      list = list.filter(item => item.channel === state.channelFilter);
    }

    // 4. Status Filter
    if (state.statusFilter !== 'all') {
      list = list.filter(item => item.status === state.statusFilter);
    }

    // 5. Search Query
    if (state.searchQuery.trim() !== '') {
      const q = state.searchQuery.toLowerCase().trim();
      list = list.filter(item =>
        item.id.toLowerCase().includes(q) ||
        item.customer.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.product.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.channel.toLowerCase().includes(q)
      );
    }

    // 6. Sorting
    list.sort((a, b) => {
      let valA = a[state.sortField];
      let valB = b[state.sortField];

      if (state.sortField === 'amount' || state.sortField === 'total') {
        valA = a.total;
        valB = b.total;
      }

      if (typeof valA === 'string') {
        return state.sortOrder === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        return state.sortOrder === 'asc' ? valA - valB : valB - valA;
      }
    });

    return list;
  }

  // --- KPI Cards Update ---
  function updateKPIs(currentSales) {
    // Filter completed or valid revenue items (exclude refunded)
    const activeSales = currentSales.filter(s => s.status !== 'Refunded');
    const grossRevenue = activeSales.reduce((acc, cur) => acc + cur.total, 0);
    const totalOrders = activeSales.length;

    // Estimated Net Profit (~70% of gross)
    const netProfit = grossRevenue * 0.70;

    // Average Order Value
    const aov = totalOrders > 0 ? grossRevenue / totalOrders : 0;

    // Total Items & Average items per order
    const totalItems = activeSales.reduce((acc, cur) => acc + (cur.quantity || 1), 0);
    const avgItems = totalOrders > 0 ? (totalItems / totalOrders).toFixed(1) : '0.0';

    // Median Sale Amount
    let median = 0;
    if (activeSales.length > 0) {
      const sortedTotals = [...activeSales].map(s => s.total).sort((a, b) => a - b);
      const mid = Math.floor(sortedTotals.length / 2);
      median = sortedTotals.length % 2 !== 0
        ? sortedTotals[mid]
        : (sortedTotals[mid - 1] + sortedTotals[mid]) / 2;
    }

    // Attainment of Target
    const attainmentPercent = Math.min(Math.round((grossRevenue / MONTHLY_TARGET) * 100), 100);

    // Compute previous period comparison for growth badges
    const prevSales = getPreviousPeriodRange(state.sales, state.dateRange).filter(s => s.status !== 'Refunded');
    const prevRevenue = prevSales.reduce((acc, cur) => acc + cur.total, 0);
    const prevOrders = prevSales.length;

    let revenueGrowthStr = '+14.2%';
    let ordersGrowthStr = '+8.5%';
    let revenueGrowthIsPos = true;
    let ordersGrowthIsPos = true;

    if (prevRevenue > 0) {
      const growth = ((grossRevenue - prevRevenue) / prevRevenue) * 100;
      revenueGrowthIsPos = growth >= 0;
      revenueGrowthStr = `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
    }

    if (prevOrders > 0) {
      const growthOrders = ((totalOrders - prevOrders) / prevOrders) * 100;
      ordersGrowthIsPos = growthOrders >= 0;
      ordersGrowthStr = `${growthOrders >= 0 ? '+' : ''}${growthOrders.toFixed(1)}%`;
    }

    // Render KPI values
    elements.kpiRevenue.textContent = formatCurrency(grossRevenue);
    elements.kpiNetProfit.textContent = formatCurrency(netProfit);
    elements.kpiRevenueGrowth.textContent = revenueGrowthStr;

    // Update trend badge color classes
    const trendBadgeRev = elements.kpiRevenueTrend.querySelector('.trend-badge');
    if (trendBadgeRev) {
      trendBadgeRev.className = `trend-badge ${revenueGrowthIsPos ? 'positive' : 'negative'}`;
      trendBadgeRev.querySelector('i').className = `fa-solid ${revenueGrowthIsPos ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`;
    }

    elements.kpiOrders.textContent = totalOrders.toLocaleString();
    elements.kpiAvgItems.textContent = avgItems;
    elements.kpiOrdersGrowth.textContent = ordersGrowthStr;

    elements.kpiAov.textContent = formatCurrency(aov);
    elements.kpiMedianSale.textContent = formatCurrency(median);

    elements.kpiTargetRate.textContent = `${attainmentPercent}%`;
    elements.targetProgressBar.style.width = `${attainmentPercent}%`;
  }

  // --- Charts Update ---
  function updateCharts(salesData) {
    if (typeof Chart === 'undefined') return;

    updateRevenueTrendChart(salesData);
    updateCategoryChart(salesData);
    updateChannelChart(salesData);
  }

  // 1. Revenue & Margin Timeline Trend Chart
  function updateRevenueTrendChart(salesData) {
    const ctx = document.getElementById('revenueTrendChart');
    if (!ctx) return;

    // Group sales by date
    const dateMap = {};
    const validSales = salesData.filter(s => s.status !== 'Refunded');

    validSales.forEach(item => {
      if (!dateMap[item.date]) {
        dateMap[item.date] = { revenue: 0, profit: 0 };
      }
      dateMap[item.date].revenue += item.total;
      dateMap[item.date].profit += item.total * 0.70;
    });

    // Sort ascending by date
    const sortedDates = Object.keys(dateMap).sort();

    // If few dates or empty, provide placeholder points
    let labels = [];
    let revenueData = [];
    let profitData = [];

    if (sortedDates.length === 0) {
      labels = ['No Data'];
      revenueData = [0];
      profitData = [0];
    } else {
      labels = sortedDates.map(d => {
        const parts = d.split('-');
        return `${parts[1]}/${parts[2]}`;
      });
      revenueData = sortedDates.map(d => Math.round(dateMap[d].revenue));
      profitData = sortedDates.map(d => Math.round(dateMap[d].profit));
    }

    if (state.charts.trend) {
      state.charts.trend.destroy();
    }

    state.charts.trend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Revenue ($)',
            data: revenueData,
            borderColor: COLORS.deepPurple,
            backgroundColor: COLORS.deepPurpleAlpha,
            borderWidth: 2.8,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: COLORS.deepPurple,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Net Profit ($)',
            data: profitData,
            borderColor: COLORS.skyblue,
            backgroundColor: 'transparent',
            borderWidth: 2.2,
            borderDash: [5, 5],
            fill: false,
            tension: 0.35,
            pointBackgroundColor: COLORS.skyblue,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 3.5,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { family: 'Inter', size: 12 },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false, drawBorder: false },
            ticks: {
              font: { family: 'Inter', size: 11 },
              color: COLORS.textMuted
            }
          },
          y: {
            grid: { color: '#f1f5f9', drawBorder: false },
            ticks: {
              font: { family: 'Inter', size: 11 },
              color: COLORS.textMuted,
              callback: function (val) {
                return '$' + (val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val);
              }
            }
          }
        }
      }
    });
  }

  // 2. Sales by Category Donut Chart
  function updateCategoryChart(salesData) {
    const ctx = document.getElementById('categoryDonutChart');
    if (!ctx) return;

    const catMap = {
      Electronics: 0,
      Software: 0,
      Hardware: 0,
      Apparel: 0,
      Services: 0
    };

    salesData.forEach(item => {
      if (item.status !== 'Refunded') {
        const cat = item.category || 'Other';
        catMap[cat] = (catMap[cat] || 0) + item.total;
      }
    });

    const labels = Object.keys(catMap);
    const dataValues = Object.values(catMap);

    const donutColors = [
      '#4A148C', // Deep Purple
      '#38bdf8', // Skyblue
      '#7c3aed', // Purple accent
      '#0284c7', // Skyblue dark
      '#c084fc'  // Light Purple
    ];

    if (state.charts.category) {
      state.charts.category.destroy();
    }

    state.charts.category = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: dataValues,
          backgroundColor: donutColors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 12,
              font: { family: 'Inter', size: 11, weight: '500' },
              color: COLORS.textDark
            }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                return ` ${context.label}: ${formatCurrency(context.parsed)} (${pct}%)`;
              }
            }
          }
        },
        cutout: '68%'
      }
    });
  }

  // 3. Sales by Channel Bar Chart
  function updateChannelChart(salesData) {
    const ctx = document.getElementById('channelBarChart');
    if (!ctx) return;

    const channelMap = {
      'Online Store': 0,
      'Retail Store': 0,
      'B2B Wholesale': 0,
      'Social Media': 0
    };

    salesData.forEach(item => {
      if (item.status !== 'Refunded') {
        const ch = item.channel || 'Other';
        channelMap[ch] = (channelMap[ch] || 0) + item.total;
      }
    });

    const labels = Object.keys(channelMap);
    const dataValues = Object.values(channelMap);

    if (state.charts.channel) {
      state.charts.channel.destroy();
    }

    state.charts.channel = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Channel Revenue',
          data: dataValues,
          backgroundColor: [
            '#4A148C',
            '#38bdf8',
            '#7c3aed',
            '#0284c7'
          ],
          borderRadius: 8,
          barThickness: 28
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            cornerRadius: 8,
            padding: 10,
            callbacks: {
              label: function (context) {
                return ` Revenue: ${formatCurrency(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: 'Inter', size: 11, weight: '500' },
              color: COLORS.textDark
            }
          },
          y: {
            grid: { color: '#f1f5f9' },
            ticks: {
              font: { family: 'Inter', size: 11 },
              color: COLORS.textMuted,
              callback: function (val) {
                return '$' + (val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val);
              }
            }
          }
        }
      }
    });
  }

  // --- Top Products Leaderboard Update ---
  function updateTopProducts(salesData) {
    if (!elements.topProductsList) return;

    const productMap = {};
    salesData.forEach(item => {
      if (item.status !== 'Refunded') {
        if (!productMap[item.product]) {
          productMap[item.product] = {
            name: item.product,
            category: item.category,
            revenue: 0,
            orders: 0
          };
        }
        productMap[item.product].revenue += item.total;
        productMap[item.product].orders += (item.quantity || 1);
      }
    });

    const topItems = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    if (topItems.length === 0) {
      elements.topProductsList.innerHTML = `
        <div style="padding: 24px; text-align: center; color: #94a3b8; font-size: 13px;">
          No item revenue in current selection
        </div>
      `;
      return;
    }

    elements.topProductsList.innerHTML = topItems.map((item, idx) => {
      const rankClass = idx === 0 ? 'item-rank' : (idx === 1 ? 'item-rank rank-secondary' : 'item-rank');
      return `
        <div class="leaderboard-item">
          <div class="${rankClass}">#${idx + 1}</div>
          <div class="item-info">
            <div class="item-name" title="${item.name}">${item.name}</div>
            <div class="item-sub">
              <span>${item.category}</span>
              <span>•</span>
              <span>${item.orders} units sold</span>
            </div>
          </div>
          <div class="item-metric">
            <div class="item-revenue">${formatCurrency(item.revenue)}</div>
            <div class="item-orders">Gross Sales</div>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- Table & Pagination Rendering ---
  function renderTable(computedList) {
    const totalCount = computedList.length;
    elements.transactionCountBadge.textContent = `${totalCount} record${totalCount === 1 ? '' : 's'}`;

    if (totalCount === 0) {
      elements.salesTableBody.innerHTML = '';
      elements.tableEmptyState.style.display = 'block';
      elements.paginationInfo.textContent = 'Showing 0 of 0 entries';
      elements.pageNumbers.innerHTML = '';
      elements.prevPageBtn.disabled = true;
      elements.nextPageBtn.disabled = true;
      return;
    }

    elements.tableEmptyState.style.display = 'none';

    // Pagination calculations
    const totalPages = Math.ceil(totalCount / state.itemsPerPage);
    if (state.currentPage > totalPages) state.currentPage = totalPages;
    if (state.currentPage < 1) state.currentPage = 1;

    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const pageItems = computedList.slice(startIndex, startIndex + state.itemsPerPage);

    // Build Table Rows
    elements.salesTableBody.innerHTML = pageItems.map(item => {
      let statusBadgeClass = 'status-completed';
      let statusIcon = 'fa-check';
      if (item.status === 'Pending') {
        statusBadgeClass = 'status-pending';
        statusIcon = 'fa-clock';
      } else if (item.status === 'Refunded') {
        statusBadgeClass = 'status-refunded';
        statusIcon = 'fa-rotate-left';
      }

      let channelIcon = 'fa-globe';
      if (item.channel === 'Retail Store') channelIcon = 'fa-shop';
      if (item.channel === 'B2B Wholesale') channelIcon = 'fa-building';
      if (item.channel === 'Social Media') channelIcon = 'fa-share-nodes';

      return `
        <tr data-id="${item.id}">
          <td class="order-id-cell">#${item.id}</td>
          <td>
            <div class="customer-cell">
              <span class="customer-name">${escapeHtml(item.customer)}</span>
              <span class="customer-email">${escapeHtml(item.email || '—')}</span>
            </div>
          </td>
          <td>
            <div class="product-cell">
              <span class="product-name">${escapeHtml(item.product)}</span>
              <span class="product-category-tag">${escapeHtml(item.category)} (${item.quantity}x)</span>
            </div>
          </td>
          <td>
            <span class="channel-tag">
              <i class="fa-solid ${channelIcon}"></i>
              ${escapeHtml(item.channel)}
            </span>
          </td>
          <td>${formatDate(item.date)}</td>
          <td class="text-right amount-cell">${formatCurrency(item.total)}</td>
          <td>
            <span class="status-badge ${statusBadgeClass}">
              <i class="fa-solid ${statusIcon}"></i>
              ${escapeHtml(item.status)}
            </span>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn-icon view-btn" data-id="${item.id}" title="View Receipt">
                <i class="fa-solid fa-eye"></i>
              </button>
              <button class="btn-icon delete-btn" data-id="${item.id}" title="Delete Record">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Pagination info
    const endCount = Math.min(startIndex + state.itemsPerPage, totalCount);
    elements.paginationInfo.textContent = `Showing ${startIndex + 1} to ${endCount} of ${totalCount} entries`;

    // Pagination buttons state
    elements.prevPageBtn.disabled = state.currentPage === 1;
    elements.nextPageBtn.disabled = state.currentPage === totalPages;

    // Render Page Number Buttons
    renderPaginationButtons(totalPages);
  }

  function renderPaginationButtons(totalPages) {
    let html = '';
    const maxButtons = 5;
    let startPage = Math.max(1, state.currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      html += `<div class="page-num ${i === state.currentPage ? 'active' : ''}" data-page="${i}">${i}</div>`;
    }
    elements.pageNumbers.innerHTML = html;
  }

  // --- Main Render Function ---
  function renderAll() {
    const computedSales = getComputedSales();

    // Check if any filters are active
    const isFiltered = state.dateRange !== 'all' ||
      state.categoryFilter !== 'all' ||
      state.channelFilter !== 'all' ||
      state.statusFilter !== 'all' ||
      state.searchQuery.trim() !== '';

    if (elements.filterBanner) {
      if (isFiltered) {
        let label = `Filtered by: Range (${state.dateRange === 'all' ? 'All' : state.dateRange + 'D'})`;
        if (state.categoryFilter !== 'all') label += ` • Category: ${state.categoryFilter}`;
        if (state.channelFilter !== 'all') label += ` • Channel: ${state.channelFilter}`;
        if (state.statusFilter !== 'all') label += ` • Status: ${state.statusFilter}`;
        if (state.searchQuery.trim() !== '') label += ` • Search: "${state.searchQuery}"`;

        elements.filterBannerText.textContent = label;
        elements.filterBanner.style.display = 'flex';
      } else {
        elements.filterBanner.style.display = 'none';
      }
    }

    // Update Components
    updateKPIs(computedSales);
    updateCharts(computedSales);
    updateTopProducts(computedSales);
    renderTable(computedSales);
  }

  // --- Modal Helpers ---
  function openSaleModal(editRecord = null) {
    elements.saleForm.reset();

    // Auto-fill today's date
    const today = new Date().toISOString().split('T')[0];
    elements.saleDateInput.value = today;
    elements.totalAmountDisplay.value = '$0.00';

    if (editRecord) {
      elements.modalTitle.textContent = 'Edit Sale Transaction';
      elements.saleEditId.value = editRecord.id;
      elements.customerNameInput.value = editRecord.customer;
      elements.customerEmailInput.value = editRecord.email || '';
      elements.productNameInput.value = editRecord.product;
      elements.categoryInput.value = editRecord.category;
      elements.quantityInput.value = editRecord.quantity;
      elements.unitPriceInput.value = editRecord.unitPrice;
      elements.channelInput.value = editRecord.channel;
      elements.statusInput.value = editRecord.status;
      elements.saleDateInput.value = editRecord.date;
      calculateModalTotal();
    } else {
      elements.modalTitle.textContent = 'Record New Sale';
      elements.saleEditId.value = '';
    }

    elements.saleModalBackdrop.style.display = 'flex';
    elements.customerNameInput.focus();
  }

  function closeSaleModal() {
    elements.saleModalBackdrop.style.display = 'none';
    elements.saleForm.reset();
  }

  function calculateModalTotal() {
    const qty = parseFloat(elements.quantityInput.value) || 0;
    const price = parseFloat(elements.unitPriceInput.value) || 0;
    const total = qty * price;
    elements.totalAmountDisplay.value = formatCurrency(total);
  }

  function openReceiptModal(record) {
    if (!record) return;

    elements.viewOrderId.textContent = `#${record.id}`;
    elements.receiptContent.innerHTML = `
      <div class="receipt-item-row">
        <span class="receipt-label">Customer Name</span>
        <span class="receipt-val">${escapeHtml(record.customer)}</span>
      </div>
      <div class="receipt-item-row">
        <span class="receipt-label">Customer Email</span>
        <span class="receipt-val">${escapeHtml(record.email || 'N/A')}</span>
      </div>
      <div class="receipt-item-row">
        <span class="receipt-label">Product / Service</span>
        <span class="receipt-val">${escapeHtml(record.product)}</span>
      </div>
      <div class="receipt-item-row">
        <span class="receipt-label">Category</span>
        <span class="receipt-val">${escapeHtml(record.category)}</span>
      </div>
      <div class="receipt-item-row">
        <span class="receipt-label">Sales Channel</span>
        <span class="receipt-val">${escapeHtml(record.channel)}</span>
      </div>
      <div class="receipt-item-row">
        <span class="receipt-label">Transaction Date</span>
        <span class="receipt-val">${formatDate(record.date)}</span>
      </div>
      <div class="receipt-item-row">
        <span class="receipt-label">Unit Price & Qty</span>
        <span class="receipt-val">${formatCurrency(record.unitPrice)} × ${record.quantity}</span>
      </div>
      <div class="receipt-item-row">
        <span class="receipt-label">Payment Status</span>
        <span class="receipt-val">${escapeHtml(record.status)}</span>
      </div>
      <div class="receipt-total-highlight">
        <span class="total-label">Total Amount</span>
        <span class="total-number">${formatCurrency(record.total)}</span>
      </div>
    `;

    elements.viewModalBackdrop.style.display = 'flex';
  }

  function closeReceiptModal() {
    elements.viewModalBackdrop.style.display = 'none';
  }

  // --- Export to CSV ---
  function exportToCSV() {
    const currentData = getComputedSales();
    if (currentData.length === 0) {
      showToast('No sales records to export for current filter', 'error');
      return;
    }

    const headers = ['Order ID', 'Customer Name', 'Email', 'Product', 'Category', 'Quantity', 'Unit Price ($)', 'Total ($)', 'Sales Channel', 'Status', 'Date'];
    const rows = currentData.map(item => [
      item.id,
      `"${item.customer.replace(/"/g, '""')}"`,
      `"${(item.email || '').replace(/"/g, '""')}"`,
      `"${item.product.replace(/"/g, '""')}"`,
      item.category,
      item.quantity,
      item.unitPrice.toFixed(2),
      item.total.toFixed(2),
      item.channel,
      item.status,
      item.date
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateStamp = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `pulsesales_analytics_${dateStamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Successfully exported ${currentData.length} records to CSV`, 'success');
  }

  // --- Reset Data ---
  function resetDataToDefault() {
    if (confirm('Reset sales data back to default demo dataset? Any manually added transactions will be replaced.')) {
      const seed = generateSeedData();
      state.sales = seed;
      saveToStorage(seed);
      state.currentPage = 1;
      renderAll();
      showToast('Sales database restored to default demo records', 'purple');
    }
  }

  // --- Utility: Escape HTML for security ---
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // 1. Date Range Filter Buttons
    elements.dateFilterGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-pill');
      if (!btn) return;

      elements.dateFilterGroup.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      state.dateRange = btn.getAttribute('data-range');
      state.currentPage = 1;
      renderAll();
    });

    // 2. Clear All Filters Banner Button
    if (elements.clearFiltersBtn) {
      elements.clearFiltersBtn.addEventListener('click', () => {
        state.dateRange = 'all';
        state.categoryFilter = 'all';
        state.channelFilter = 'all';
        state.statusFilter = 'all';
        state.searchQuery = '';

        elements.tableSearchInput.value = '';
        elements.categoryFilterSelect.value = 'all';
        elements.channelFilterSelect.value = 'all';
        elements.statusFilterSelect.value = 'all';

        elements.dateFilterGroup.querySelectorAll('.filter-pill').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-range') === 'all');
        });

        state.currentPage = 1;
        renderAll();
        showToast('All filters cleared', 'info');
      });
    }

    // 3. Search Bar Live Filtering
    elements.tableSearchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      state.currentPage = 1;
      renderAll();
    });

    // 4. Dropdown Filters
    elements.categoryFilterSelect.addEventListener('change', (e) => {
      state.categoryFilter = e.target.value;
      state.currentPage = 1;
      renderAll();
    });

    elements.channelFilterSelect.addEventListener('change', (e) => {
      state.channelFilter = e.target.value;
      state.currentPage = 1;
      renderAll();
    });

    elements.statusFilterSelect.addEventListener('change', (e) => {
      state.statusFilter = e.target.value;
      state.currentPage = 1;
      renderAll();
    });

    // 5. Column Sorting
    elements.tableHeaders.forEach(th => {
      th.addEventListener('click', () => {
        const field = th.getAttribute('data-sort');
        if (state.sortField === field) {
          state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
          state.sortField = field;
          state.sortOrder = 'desc';
        }

        // Update header sort icons
        elements.tableHeaders.forEach(h => {
          const icon = h.querySelector('i');
          if (icon) {
            icon.className = 'fa-solid fa-sort';
            icon.classList.remove('active');
          }
        });

        const activeIcon = th.querySelector('i');
        if (activeIcon) {
          activeIcon.className = `fa-solid ${state.sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} active`;
        }

        renderAll();
      });
    });

    // 6. Pagination Navigation
    elements.prevPageBtn.addEventListener('click', () => {
      if (state.currentPage > 1) {
        state.currentPage--;
        renderTable(getComputedSales());
      }
    });

    elements.nextPageBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(getComputedSales().length / state.itemsPerPage);
      if (state.currentPage < totalPages) {
        state.currentPage++;
        renderTable(getComputedSales());
      }
    });

    elements.pageNumbers.addEventListener('click', (e) => {
      const pageBtn = e.target.closest('.page-num');
      if (!pageBtn) return;
      state.currentPage = parseInt(pageBtn.getAttribute('data-page'), 10);
      renderTable(getComputedSales());
    });

    // 7. Table Actions: View Details & Delete Record Delegation
    elements.salesTableBody.addEventListener('click', (e) => {
      const viewBtn = e.target.closest('.view-btn');
      if (viewBtn) {
        const id = viewBtn.getAttribute('data-id');
        const item = state.sales.find(s => s.id === id);
        if (item) openReceiptModal(item);
        return;
      }

      const deleteBtn = e.target.closest('.delete-btn');
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        if (confirm(`Are you sure you want to delete transaction #${id}?`)) {
          state.sales = state.sales.filter(s => s.id !== id);
          saveToStorage(state.sales);
          renderAll();
          showToast(`Transaction #${id} deleted`, 'info');
        }
        return;
      }
    });

    // 8. Add Sale Modal triggers & Form Submit
    elements.openNewSaleModalBtn.addEventListener('click', () => {
      openSaleModal();
    });

    elements.closeSaleModalBtn.addEventListener('click', closeSaleModal);
    elements.cancelSaleModalBtn.addEventListener('click', closeSaleModal);

    elements.quantityInput.addEventListener('input', calculateModalTotal);
    elements.unitPriceInput.addEventListener('input', calculateModalTotal);

    elements.saleForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const editId = elements.saleEditId.value;
      const qty = parseInt(elements.quantityInput.value, 10) || 1;
      const price = parseFloat(elements.unitPriceInput.value) || 0;
      const total = parseFloat((qty * price).toFixed(2));

      if (editId) {
        // Update existing record
        const index = state.sales.findIndex(s => s.id === editId);
        if (index !== -1) {
          state.sales[index] = {
            ...state.sales[index],
            customer: elements.customerNameInput.value.trim(),
            email: elements.customerEmailInput.value.trim(),
            product: elements.productNameInput.value.trim(),
            category: elements.categoryInput.value,
            quantity: qty,
            unitPrice: price,
            total: total,
            channel: elements.channelInput.value,
            status: elements.statusInput.value,
            date: elements.saleDateInput.value
          };
          saveToStorage(state.sales);
          closeSaleModal();
          renderAll();
          showToast(`Transaction #${editId} updated`, 'success');
        }
      } else {
        // Generate new sequential Order ID
        const maxIdNum = state.sales.reduce((max, cur) => {
          const num = parseInt(cur.id.replace('ORD-', ''), 10);
          return !isNaN(num) && num > max ? num : max;
        }, 1000);

        const newSale = {
          id: `ORD-${maxIdNum + 1}`,
          customer: elements.customerNameInput.value.trim(),
          email: elements.customerEmailInput.value.trim(),
          product: elements.productNameInput.value.trim(),
          category: elements.categoryInput.value,
          quantity: qty,
          unitPrice: price,
          total: total,
          channel: elements.channelInput.value,
          status: elements.statusInput.value,
          date: elements.saleDateInput.value
        };

        state.sales.unshift(newSale);
        saveToStorage(state.sales);
        closeSaleModal();
        renderAll();
        showToast(`Recorded new sale #${newSale.id} (${formatCurrency(newSale.total)})`, 'success');
      }
    });

    // 9. View Details Modal Close
    elements.closeViewModalBtn.addEventListener('click', closeReceiptModal);
    elements.closeViewModalBtn2.addEventListener('click', closeReceiptModal);
    elements.printReceiptBtn.addEventListener('click', () => {
      window.print();
    });

    // 10. Close modals when clicking backdrop
    elements.saleModalBackdrop.addEventListener('click', (e) => {
      if (e.target === elements.saleModalBackdrop) closeSaleModal();
    });
    elements.viewModalBackdrop.addEventListener('click', (e) => {
      if (e.target === elements.viewModalBackdrop) closeReceiptModal();
    });

    // 11. Global Actions: CSV Export & Reset Data
    elements.exportCsvBtn.addEventListener('click', exportToCSV);
    elements.resetDataBtn.addEventListener('click', resetDataToDefault);

    // 12. ESC key to close open modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeSaleModal();
        closeReceiptModal();
      }
    });
  }

  // --- Application Initialization ---
  function init() {
    state.sales = loadFromStorage();
    setupEventListeners();
    renderAll();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

