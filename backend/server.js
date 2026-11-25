import express from 'express';
import cors from 'cors';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const app = express();
app.use(cors());
app.use(express.json());

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || 'APP_USR-TU-ACCESS-TOKEN-AQUI'
});

app.post('/create_preference', async (req, res) => {
  try {
    const { items } = req.body;

    const mpItems = items.map((item) => ({
      id: String(item.id),
      title: item.name,
      description: item.specs,
      quantity: 1,
      currency_id: 'MXN',
      unit_price: Number(item.price)
    }));

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: mpItems,
        back_urls: {
          success: 'http://localhost:5173/?status=approved',
          failure: 'http://localhost:5173/?status=failure',
          pending: 'http://localhost:5173/?status=pending'
        },
        auto_return: 'approved',
        statement_descriptor: 'RELOOT'
      }
    });

    res.json({
      id: result.id,
      init_point: result.init_point
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la preferencia de pago' });
  }
});

app.listen(3000, () => {
  console.log('Backend RELOOT Mercado Pago activo en http://localhost:3000');
});
