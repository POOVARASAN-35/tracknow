const Delivery = require('../models/Delivery');
const Driver = require('../models/Driver');
const User = require('../models/User');
const { getCachedReport, cacheReport } = require('../services/redisService');

/**
 * @desc    Get dashboard summary statistics (cached in Redis)
 * @route   GET /api/analytics/dashboard
 * @access  Private (Admin/Superadmin)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const cacheKey = 'dashboard_metrics';
    const cachedStats = await getCachedReport(cacheKey);

    if (cachedStats) {
      return res.status(200).json({ success: true, data: cachedStats });
    }

    // 1. Deliveries statistics
    const totalDeliveries = await Delivery.countDocuments();
    const activeDeliveries = await Delivery.countDocuments({
      status: { $in: ['assigned', 'picked_up', 'in_transit'] }
    });
    const completedDeliveries = await Delivery.countDocuments({ status: 'delivered' });
    const cancelledDeliveries = await Delivery.countDocuments({ status: 'cancelled' });
    const pendingDeliveries = await Delivery.countDocuments({ status: 'pending' });

    // 2. Drivers statistics
    const activeDrivers = await Driver.countDocuments({ status: { $ne: 'offline' } });
    const totalDrivers = await Driver.countDocuments();

    // 3. Delayed deliveries count (ETA in past & not finished)
    const now = new Date();
    const delayedDeliveries = await Delivery.countDocuments({
      status: { $in: ['assigned', 'picked_up', 'in_transit'] },
      eta: { $lt: now }
    });

    // 4. Financial / Analytics computations
    const Order = require('../models/Order');
    const completedOrders = await Order.find({ status: 'Delivered' });
    const totalRevenue = completedOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);

    const deliveriesWithDistance = await Delivery.find(
      { status: 'delivered' },
      'route.distance'
    );
    let totalDistanceKm = 0;
    deliveriesWithDistance.forEach((d) => {
      totalDistanceKm += d.route?.distance || 0;
    });

    const fuelCostEstimate = totalDistanceKm * 0.12; // $0.12 average fuel cost per km

    // 5. Driver efficiency stats
    // Query drivers and calculate performance score
    const drivers = await Driver.find().populate('user', 'name');
    const driverPerformance = drivers.map((d) => ({
      name: d.user?.name || 'Unknown',
      rating: d.rating,
      performanceScore: d.performanceScore
    }));

    // 6. Monthly delivery breakdown (for graphs)
    // Aggregation query grouping delivered orders by month
    const monthlyAggregate = await Order.aggregate([
      { $match: { status: 'Delivered' } },
      {
        $group: {
          _id: { $month: '$updatedAt' },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyReports = monthlyAggregate.map((item) => ({
      month: months[item._id - 1] || `Month ${item._id}`,
      deliveries: item.count,
      revenue: +item.revenue.toFixed(2)
    }));

    const stats = {
      summary: {
        totalDeliveries,
        activeDeliveries,
        completedDeliveries,
        cancelledDeliveries,
        pendingDeliveries,
        activeDrivers,
        totalDrivers,
        delayedDeliveries,
        totalDistanceKm: +totalDistanceKm.toFixed(1),
        totalRevenue: +totalRevenue.toFixed(2),
        fuelCostEstimate: +fuelCostEstimate.toFixed(2)
      },
      driverPerformance,
      monthlyReports
    };

    // Cache the aggregated payload for 5 minutes (300 seconds)
    await cacheReport(cacheKey, stats, 300);

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
