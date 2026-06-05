const Razorpay = require('razorpay');

const rzp = new Razorpay({
  key_id: 'rzp_live_Sxuhmk2KLWNZx5',
  key_secret: '0XjyIUAtjCmUa29O0JowbV2J'
});

rzp.orders.create({
  amount: 100, // 1 INR in paise
  currency: 'INR',
  receipt: 'test_receipt_' + Date.now()
}).then(order => {
  console.log('SUCCESS: Order created successfully!', order);
}).catch(err => {
  console.error('ERROR creating order:', err);
});
