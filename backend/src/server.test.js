// backend/src/server.test.js
const request = require('supertest');
const app = require('./server');

describe('Currency Converter API', () => {
    
    it('should convert USD to EUR successfully', async () => {
        const response = await request(app).get('/api/convert?amount=100&base=USD&target=EUR');
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('convertedAmount');
        expect(response.body.convertedAmount).toBe(92.00);
    });

    it('should return 400 for missing amount', async () => {
        const response = await request(app).get('/api/convert?base=USD&target=EUR');
        
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for unsupported currencies', async () => {
        const response = await request(app).get('/api/convert?amount=100&base=GBP&target=JPY');
        
        expect(response.status).toBe(400);
    });
});