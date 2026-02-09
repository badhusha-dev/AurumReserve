
export const INITIAL_GOLD_RATE = {
  price24k: 7250.50,
  price22k: 6645.20,
  timestamp: new Date().toISOString()
};

export const MOCK_HISTORY = [
  { day: '2024-01-01', price: 6100 },
  { day: '2024-01-15', price: 6250 },
  { day: '2024-02-01', price: 6400 },
  { day: '2024-02-15', price: 6350 },
  { day: '2024-03-01', price: 6800 },
  { day: '2024-03-15', price: 6950 },
  { day: '2024-04-01', price: 7250 },
];

export const MOCK_TRANSACTIONS = [
  { id: '1', date: '2024-01-05', amount: 5000, grams: 0.82, type: 'BUY', status: 'COMPLETED', rate: 6100 },
  { id: '2', date: '2024-02-05', amount: 5000, grams: 0.78, type: 'BUY', status: 'COMPLETED', rate: 6400 },
  { id: '3', date: '2024-03-05', amount: 5000, grams: 0.74, type: 'BUY', status: 'COMPLETED', rate: 6800 },
];
