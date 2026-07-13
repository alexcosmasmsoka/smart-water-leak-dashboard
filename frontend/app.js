
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
  }
}

function updateStatValue(elementId, newValue) {
  const el = document.getElementById(elementId);
  
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
  const gradientFlow = ctx.createLinearGradient(0, 0, 0, 400);
  gradientFlow.addColorStop(0, 'rgba(14, 165, 233, 0.4)');
  gradientFlow.addColorStop(1, 'rgba(14, 165, 233, 0)');
  
  const gradientPressure = ctx.createLinearGradient(0, 0, 0, 400);
  gradientPressure.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
  gradientPressure.addColorStop(1, 'rgba(139, 92, 246, 0)');

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
          borderColor: '#0ea5e9',
          backgroundColor: gradientFlow,
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 2
        },
        {
          label: 'Pressure (bar)',
          data: pressures,
          borderColor: '#8b5cf6',
          backgroundColor: gradientPressure,
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 2
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
            color: '#94a3b8',
            font: {
              family: 'Inter',
              size: 14
            },
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: '#1e293b',
          titleColor: '#f8fafc',
          bodyColor: '#94a3b8',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          usePointStyle: true
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#64748b',
            font: {
              family: 'Inter',
              size: 12
            }
          },
          grid: {
            color: 'rgba(51, 65, 85, 0.5)'
          }
        },
        y: {
          ticks: {
            color: '#64748b',
            font: {
              family: 'Inter',
              size: 12
            }
          },
          grid: {
            color: 'rgba(51, 65, 85, 0.5)'
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
}

// Initial load
refresh();
setInterval(refresh, 10000);
