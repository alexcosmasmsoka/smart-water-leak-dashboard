
const API_BASE_URL = 'https://smart-water-backend-e6s6.onrender.com/api';
let historyChart = null;
let selectedZone = null;

// Initialize Lucide icons
lucide.createIcons();

async function fetchLatestData() {
  try {
    const res = await fetch(`${API_BASE_URL}/sensor-data/latest`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error fetching latest data:', err);
    return [];
  }
}

async function fetchHistoryData(zone, limit = 50) {
  try {
    const res = await fetch(`${API_BASE_URL}/sensor-data/history?zone=${encodeURIComponent(zone)}&limit=${limit}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error fetching history data:', err);
    return [];
  }
}

function updateUI(latestData) {
  const zoneSelect = document.getElementById('zoneSelect');
  const currentZones = latestData.map(d => d.zone_name);

  // Update zone select options if needed
  const existingZones = Array.from(zoneSelect.options).map(opt => opt.value);
  currentZones.forEach(zone => {
    if (!existingZones.includes(zone)) {
      const option = document.createElement('option');
      option.value = zone;
      option.textContent = zone;
      zoneSelect.appendChild(option);
    }
  });

  // If no zone selected, pick first one
  if (!selectedZone && latestData.length > 0) {
    selectedZone = latestData[0].zone_name;
    zoneSelect.value = selectedZone;
    loadHistoryForZone(selectedZone);
  }

  // Find data for selected zone
  const zoneData = latestData.find(d => d.zone_name === selectedZone);
  if (zoneData) {
    // Update stat values with fade-in transition
    updateStatValue('zoneName', zoneData.zone_name);
    updateStatValue('flowRate', `${zoneData.flow_rate.toFixed(2)} L/min`);
    updateStatValue('pressure', `${zoneData.pressure.toFixed(2)} bar`);
    
    // Update status
    const statusEl = document.getElementById('status');
    const statusCard = document.getElementById('statusCard');
    const statusIcon = document.getElementById('statusIcon');
    
    const isLeak = zoneData.status !== 'normal';
    
    statusEl.textContent = zoneData.status;
    statusCard.classList.remove('leak');
    if (isLeak) {
      statusCard.classList.add('leak');
      statusIcon.setAttribute('data-lucide', 'shield-alert');
    } else {
      statusIcon.setAttribute('data-lucide', 'shield-check');
    }
    
    // Re-render icons to update status icon
    lucide.createIcons();
  } else {
    // Empty state
    document.getElementById('zoneName').textContent = 'No data';
    document.getElementById('zoneName').classList.add('empty');
    document.getElementById('flowRate').textContent = 'No data';
    document.getElementById('flowRate').classList.add('empty');
    document.getElementById('pressure').textContent = 'No data';
    document.getElementById('pressure').classList.add('empty');
    document.getElementById('status').textContent = 'No data';
    document.getElementById('status').classList.add('empty');
  }
}

function updateStatValue(elementId, newValue) {
  const el = document.getElementById(elementId);
  el.classList.remove('empty');
  
  if (el.textContent !== newValue) {
    // Add updating class for fade-out
    el.classList.add('updating');
    
    setTimeout(() => {
      el.textContent = newValue;
      // Remove updating class to fade back in
      el.classList.remove('updating');
    }, 150);
  }
}

async function loadHistoryForZone(zone) {
  const historyData = await fetchHistoryData(zone);
  // Reverse to show oldest first on chart
  const reversed = [...historyData].reverse();
  
  const labels = reversed.map(d => new Date(d.created_at).toLocaleTimeString());
  const flowRates = reversed.map(d => d.flow_rate);
  const pressures = reversed.map(d => d.pressure);

  const ctx = document.getElementById('historyChart').getContext('2d');
  
  // Create gradients for chart
  const gradientFlow = ctx.createLinearGradient(0, 0, 0, 300);
  gradientFlow.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
  gradientFlow.addColorStop(1, 'rgba(6, 182, 212, 0)');
  
  const gradientPressure = ctx.createLinearGradient(0, 0, 0, 300);
  gradientPressure.addColorStop(0, 'rgba(245, 158, 11, 0.15)');
  gradientPressure.addColorStop(1, 'rgba(245, 158, 11, 0)');

  if (historyChart) {
    historyChart.destroy();
  }

  historyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Flow Rate (L/min)',
          data: flowRates,
          borderColor: '#06b6d4',
          backgroundColor: gradientFlow,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#06b6d4',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2,
          borderWidth: 2,
          yAxisID: 'y'
        },
        {
          label: 'Pressure (bar)',
          data: pressures,
          borderColor: '#f59e0b',
          backgroundColor: gradientPressure,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#f59e0b',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2,
          borderWidth: 2,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          labels: {
            color: '#9ca3af',
            font: {
              family: 'Inter',
              size: 13,
              weight: 500
            },
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: '#1a2332',
          titleColor: '#ffffff',
          bodyColor: '#9ca3af',
          borderColor: '#252f3f',
          borderWidth: 1,
          padding: 14,
          cornerRadius: 10,
          displayColors: true,
          usePointStyle: true,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#6b7280',
            font: {
              family: 'Inter',
              size: 12
            }
          },
          grid: {
            color: 'rgba(37, 47, 63, 0.5)',
            drawBorder: false
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Flow Rate (L/min)',
            color: '#06b6d4',
            font: {
              family: 'Inter',
              size: 12,
              weight: 600
            }
          },
          ticks: {
            color: '#06b6d4',
            font: {
              family: 'Inter',
              size: 12
            }
          },
          grid: {
            color: 'rgba(37, 47, 63, 0.5)',
            drawBorder: false
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Pressure (bar)',
            color: '#f59e0b',
            font: {
              family: 'Inter',
              size: 12,
              weight: 600
            }
          },
          ticks: {
            color: '#f59e0b',
            font: {
              family: 'Inter',
              size: 12
            }
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
}

document.getElementById('zoneSelect').addEventListener('change', async (e) => {
  selectedZone = e.target.value;
  const latestData = await fetchLatestData();
  updateUI(latestData);
  loadHistoryForZone(selectedZone);
});

async function refresh() {
  const latestData = await fetchLatestData();
  updateUI(latestData);
  if (selectedZone) {
    await loadHistoryForZone(selectedZone);
  }
}

// Initial load
refresh();
setInterval(refresh, 10000);

