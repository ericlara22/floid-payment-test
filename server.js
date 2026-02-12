require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Endpoint para crear un nuevo payment_token
app.post('/api/create-payment', async (req, res) => {
  const token = process.env.FLOID_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'FLOID_TOKEN no está configurado en .env' });
  }

  try {
    const body = req.body.amount && req.body.bank
      ? req.body
      : { amount: '1', bank: 'banco_estado_personas' };

    const response = await fetch('https://api.floid.app/cl/payments/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Error al crear el payment',
        details: data,
      });
    }

    // La API puede devolver 'id', 'payment_token' o similar
    const paymentToken = data.id || data.payment_token || data.token;
    if (!paymentToken) {
      return res.status(500).json({
        error: 'La API no devolvió un payment_token',
        details: data,
      });
    }

    res.json({ payment_token: paymentToken, ...data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log('Abre index.html en el navegador para usar la app');
});
