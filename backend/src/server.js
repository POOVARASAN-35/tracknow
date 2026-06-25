require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const driverRoutes = require('./routes/driverRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const zoneRoutes = require('./routes/zoneRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const customerRoutes = require('./routes/customerRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const billingRoutes = require('./routes/billingRoutes');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Connect to Database
connectDB();

// Global Middlewares
app.use(helmet({
  contentSecurityPolicy: false // Disabled to avoid issue with loading assets/maps in prototyping
}));
app.use(cors({
  origin: '*', // Allow all origins for dev/sandbox environment
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

// Apply rate limiting to all standard APIs
app.use('/api', apiLimiter);

// Bind Routes
app.use('/api/auth', authRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/billing', billingRoutes);

// Static uploads directory serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Static Google Login page serving
app.use('/google-login', express.static(path.join(__dirname, 'public/google-login')));

// Base route
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'TrackNow Logistics & Tracking API running' });
});

// Central Error Handler
app.use(errorHandler);

// Initialize WebSockets
initSocket(server);

// Centralized Seed Data on startup
const seedAccounts = async () => {
  try {
    const User = require('./models/User');
    const Driver = require('./models/Driver');
    const Vehicle = require('./models/Vehicle');
    const SupportTicket = require('./models/SupportTicket');
    const AuditLog = require('./models/AuditLog');

    // Seed products
    const { seedProducts } = require('./controllers/productController');
    await seedProducts();

    // 1. Seed Super Admin
    const adminEmail = 'superadmin@tracknow.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: 'Password123',
        role: 'superadmin'
      });
      console.log('Seeded default superadmin: superadmin@tracknow.com / Password123');
    }

    // 2. Seed Admin
    const managerEmail = 'admin@tracknow.com';
    const existingManager = await User.findOne({ email: managerEmail });
    if (!existingManager) {
      await User.create({
        name: 'Operations Admin',
        email: managerEmail,
        password: 'Password123',
        role: 'admin'
      });
      console.log('Seeded default admin: admin@tracknow.com / Password123');
    }

    // 3. Seed Customer & Billing
    const customerEmail = 'customer@tracknow.com';
    let customerUser = await User.findOne({ email: customerEmail });
    if (!customerUser) {
      customerUser = await User.create({
        name: 'Jane Customer',
        email: customerEmail,
        password: 'Password123',
        role: 'customer'
      });
      console.log('Seeded default customer: customer@tracknow.com / Password123');
    }

    // Seed Billing details for this customer if none exist
    const Invoice = require('./models/Invoice');
    const Transaction = require('./models/Transaction');
    const Refund = require('./models/Refund');
    const CustomerWallet = require('./models/CustomerWallet');
    const PaymentMethod = require('./models/PaymentMethod');
    const Coupon = require('./models/Coupon');
    const Order = require('./models/Order');

    const invoicesCount = await Invoice.countDocuments({ customer: customerUser._id });
    if (invoicesCount === 0) {
      console.log('Seeding customer billing, invoices, transactions, refunds...');

      // Ensure we have some orders first so we can link them
      let orders = await Order.find({ customer: customerUser._id });
      if (orders.length === 0) {
        // Let's seed a couple of orders
        const order1 = await Order.create({
          orderId: 'TRK-98124801',
          customer: customerUser._id,
          recipientName: 'Robert Smith',
          phone: '+1 555-0199',
          items: [
            { product: { name: 'Express Freight Shipping Pack', price: 45.00 }, quantity: 1 }
          ],
          totalAmount: 45.00,
          paymentMethod: 'Credit Card',
          pickupAddress: { text: 'KA-Hub Bengaluru Central Warehouse', coordinates: [77.5946, 12.9716] },
          deliveryAddress: { text: 'Electronic City Tech Hub Phase 1', coordinates: [77.6727, 12.8452] },
          status: 'Delivered',
          otpCode: '8839'
        });

        const order2 = await Order.create({
          orderId: 'TRK-98124802',
          customer: customerUser._id,
          recipientName: 'David Lee',
          phone: '+1 555-0211',
          items: [
            { product: { name: 'Standard Logistics Parcel Box', price: 25.00 }, quantity: 2 }
          ],
          totalAmount: 50.00,
          paymentMethod: 'UPI',
          pickupAddress: { text: 'KA-Hub Bengaluru Central Warehouse', coordinates: [77.5946, 12.9716] },
          deliveryAddress: { text: 'Koramangala 4th Block, Bengaluru', coordinates: [77.6245, 12.9348] },
          status: 'Delivered',
          otpCode: '1245'
        });

        const order3 = await Order.create({
          orderId: 'TRK-98124803',
          customer: customerUser._id,
          recipientName: 'Alice Green',
          phone: '+1 555-0144',
          items: [
            { product: { name: 'Eco-friendly Document Sleeve', price: 15.00 }, quantity: 1 }
          ],
          totalAmount: 15.00,
          paymentMethod: 'UPI',
          pickupAddress: { text: 'KA-Hub Bengaluru Central Warehouse', coordinates: [77.5946, 12.9716] },
          deliveryAddress: { text: 'Indiranagar 100 Feet Rd, Bengaluru', coordinates: [77.6412, 12.9718] },
          status: 'Cancelled',
          otpCode: '4399'
        });

        orders = [order1, order2, order3];
      }

      // Now seed Invoices
      const inv1 = await Invoice.create({
        invoiceId: 'INV-2026-001',
        order: orders[0]._id,
        customer: customerUser._id,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        status: 'Paid',
        subtotal: 40.00,
        tax: 3.00,
        deliveryCharge: 2.00,
        discount: 0,
        totalAmount: 45.00,
        paymentMethod: 'Credit Card',
        transactionId: 'TXN-9821739281',
        trackingId: orders[0].orderId,
        billingAddress: { text: 'Jane Customer, Prestige Shantiniketan, Whitefield, Bengaluru' },
        deliveryAddress: { text: orders[0].deliveryAddress.text }
      });

      const inv2 = await Invoice.create({
        invoiceId: 'INV-2026-002',
        order: orders[1]._id,
        customer: customerUser._id,
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        dueDate: new Date(Date.now()),
        status: 'Paid',
        subtotal: 42.00,
        tax: 4.00,
        deliveryCharge: 4.00,
        discount: 0,
        totalAmount: 50.00,
        paymentMethod: 'UPI',
        transactionId: 'TXN-1209382103',
        trackingId: orders[1].orderId,
        billingAddress: { text: 'Jane Customer, Prestige Shantiniketan, Whitefield, Bengaluru' },
        deliveryAddress: { text: orders[1].deliveryAddress.text }
      });

      const inv3 = await Invoice.create({
        invoiceId: 'INV-2026-003',
        order: orders[2]._id,
        customer: customerUser._id,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        dueDate: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
        status: 'Cancelled',
        subtotal: 10.00,
        tax: 2.00,
        deliveryCharge: 3.00,
        discount: 0,
        totalAmount: 15.00,
        paymentMethod: 'UPI',
        transactionId: '',
        trackingId: orders[2].orderId,
        billingAddress: { text: 'Jane Customer, Prestige Shantiniketan, Whitefield, Bengaluru' },
        deliveryAddress: { text: orders[2].deliveryAddress.text }
      });

      // Add a pending invoice
      const inv4 = await Invoice.create({
        invoiceId: 'INV-2026-004',
        customer: customerUser._id,
        date: new Date(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'Pending',
        subtotal: 35.00,
        tax: 3.00,
        deliveryCharge: 2.00,
        discount: 5.00,
        couponCode: 'SAVE5',
        totalAmount: 35.00,
        paymentMethod: 'UPI',
        transactionId: '',
        trackingId: 'TRK-PENDING-04',
        billingAddress: { text: 'Jane Customer, Prestige Shantiniketan, Whitefield, Bengaluru' },
        deliveryAddress: { text: 'Outer Ring Rd, Marathahalli, Bengaluru' }
      });

      // Add a failed invoice
      const inv5 = await Invoice.create({
        invoiceId: 'INV-2026-005',
        customer: customerUser._id,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'Failed',
        subtotal: 80.00,
        tax: 7.00,
        deliveryCharge: 5.00,
        discount: 0,
        totalAmount: 92.00,
        paymentMethod: 'Credit Card',
        transactionId: 'TXN-FAILED-05',
        trackingId: 'TRK-FAILED-05',
        billingAddress: { text: 'Jane Customer, Prestige Shantiniketan, Whitefield, Bengaluru' },
        deliveryAddress: { text: 'Jayanagar 3rd Block, Bengaluru' }
      });

      // Seed Transactions
      await Transaction.create([
        { transactionId: 'TXN-9821739281', invoice: inv1._id, customer: customerUser._id, amount: 45.00, status: 'Success', paymentMethod: 'Credit Card', date: inv1.date, type: 'payment' },
        { transactionId: 'TXN-1209382103', invoice: inv2._id, customer: customerUser._id, amount: 50.00, status: 'Success', paymentMethod: 'UPI', date: inv2.date, type: 'payment' },
        { transactionId: 'TXN-FAILED-05', invoice: inv5._id, customer: customerUser._id, amount: 92.00, status: 'Failed', paymentMethod: 'Credit Card', date: inv5.date, type: 'payment' }
      ]);

      // Seed Refunds
      const rfd1 = await Refund.create({
        refundId: 'RFD-90217491',
        orderId: 'TRK-98124803',
        customer: customerUser._id,
        reason: 'Shipment cancellation request approved by admin',
        amount: 15.00,
        status: 'Success',
        expectedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        method: 'UPI Wallet'
      });

      // Add refund transaction log
      await Transaction.create({
        transactionId: 'TXN-REFUND-9021',
        customer: customerUser._id,
        amount: 15.00,
        status: 'Success',
        paymentMethod: 'UPI Wallet',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        type: 'refund'
      });

      // Seed Customer Wallet
      await CustomerWallet.create({
        customer: customerUser._id,
        balance: 245.50,
        cashback: 35.00,
        history: [
          { type: 'credit', amount: 25.00, description: 'Cashback reward for order TRK-98124801', date: inv1.date },
          { type: 'credit', amount: 10.00, description: 'Cashback reward for order TRK-98124802', date: inv2.date },
          { type: 'credit', amount: 15.00, description: 'Refund credited to wallet', date: rfd1.createdAt }
        ]
      });

      // Seed Payment Methods
      await PaymentMethod.create([
        {
          customer: customerUser._id,
          type: 'card',
          details: {
            cardBrand: 'visa',
            last4: '4242',
            expiryMonth: '12',
            expiryYear: '2028',
            cardholderName: 'Jane Customer'
          },
          isDefault: true
        },
        {
          customer: customerUser._id,
          type: 'upi',
          details: {
            upiId: 'janecustomer@okaxis'
          },
          isDefault: false
        }
      ]);

      // Seed Coupons
      await Coupon.create([
        { code: 'SAVE5', discountType: 'fixed', discountValue: 5.00, minPurchase: 20.00, expiryDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000), isActive: true },
        { code: 'TRK20', discountType: 'percentage', discountValue: 20, minPurchase: 50.00, expiryDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000), isActive: true }
      ]);
      console.log('Seeded default billing database records successfully');
    }

    // 4. Seed Driver
    const driverEmail = 'driver@tracknow.com';
    const existingDriver = await User.findOne({ email: driverEmail });
    if (!existingDriver) {
      const driverUser = await User.create({
        name: 'Courier Driver',
        email: driverEmail,
        password: 'Password123',
        role: 'driver'
      });
      await Driver.create({
        user: driverUser._id,
        licenseNumber: 'LIC-999999',
        status: 'available'
      });
      console.log('Seeded default driver: driver@tracknow.com / Password123');
    }

    // 5. Seed Vehicles
    const vehiclesCount = await Vehicle.countDocuments();
    if (vehiclesCount === 0) {
      const driverUser = await User.findOne({ email: 'driver@tracknow.com' });
      await Vehicle.create([
        { vehicleNumber: 'KA-51-MB-9876', model: 'Tata Ace Gold Cargo', type: 'van', status: 'active', assignedDriver: driverUser ? driverUser._id : null },
        { vehicleNumber: 'KA-03-MX-1234', model: 'Mahindra Supro Pickup', type: 'truck', status: 'active', assignedDriver: null },
        { vehicleNumber: 'KA-04-EY-5566', model: 'Hero Super Splendor Bike', type: 'bike', status: 'active', assignedDriver: null }
      ]);
      console.log('Seeded fleet vehicles in DB');
    }

    // 6. Seed Support Tickets
    const ticketsCount = await SupportTicket.countDocuments();
    if (ticketsCount === 0) {
      await SupportTicket.create([
        { name: 'John Customer', email: 'john@gmail.com', subject: 'Late delivery packages request', description: 'My order TRK-9817 has been stuck at the sorting center. Please update.', status: 'open', category: 'Customer Complaint' },
        { name: 'Courier Driver', email: 'driver@tracknow.com', subject: 'API Lag on GPS tracking', description: 'The coordinates telemetry streams are lagging. Please verify Redis caching latency.', status: 'pending', category: 'Driver Complaint' }
      ]);
      console.log('Seeded support tickets in DB');
    }

    // 7. Seed Audit Logs
    const logsCount = await AuditLog.countDocuments();
    if (logsCount === 0) {
      const superadmin = await User.findOne({ email: 'superadmin@tracknow.com' });
      if (superadmin) {
        await AuditLog.create([
          { user: superadmin._id, userName: superadmin.name, action: 'Initial system seeding login check', ipAddress: '127.0.0.1', status: 'Success' },
          { user: superadmin._id, userName: superadmin.name, action: 'Superadmin account initialized', ipAddress: '192.168.1.1', status: 'Success' }
        ]);
        console.log('Seeded audit logs in DB');
      }
    }
  } catch (error) {
    console.error('Error seeding default accounts:', error.message);
  }
};
seedAccounts();

// Listen port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server executing in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
