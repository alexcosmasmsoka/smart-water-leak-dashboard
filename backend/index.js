
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const knex = require('knex');
const knexConfig = require('./knexfile');

const app = express();
const PORT = process.env.PORT || 3001;
const db = knex(knexConfig[process.env.NODE_ENV || 'development']);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/sensor-data', async (req, res) => {
  try {
    const { zone_name, flow_rate, pressure, status, leak_detected } = req.body;
    if (!zone_name || flow_rate == null || pressure == null || !status || leak_detected == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const [inserted] = await db('sensor_readings').insert({
      zone_name,
      flow_rate: parseFloat(flow_rate),
      pressure: parseFloat(pressure),
      status,
      leak_detected
    }).returning('*');
    res.status(201).json(inserted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/sensor-data/latest', async (req, res) => {
  try {
    const latestReadings = await db('sensor_readings')
      .select('*')
      .whereIn('id', function() {
        this.select(db.raw('max(id)'))
          .from('sensor_readings')
          .groupBy('zone_name');
      });
    res.json(latestReadings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/sensor-data/history', async (req, res) => {
  try {
    const { zone, limit = 50 } = req.query;
    if (!zone) {
      return res.status(400).json({ error: 'Missing zone parameter' });
    }
    const history = await db('sensor_readings')
      .where({ zone_name: zone })
      .orderBy('created_at', 'desc')
      .limit(parseInt(limit));
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

