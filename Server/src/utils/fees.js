exports.calcLendingFee = (originalPrice) => Number((originalPrice * 0.10).toFixed(2));
exports.calcPlatformFee = (originalPrice) => Number((originalPrice * (Number(process.env.PLATFORM_FEE_PCT || 0.05))).toFixed(2));
exports.deliveryEstimate = () => Number(process.env.DELIVERY_FLAT_ONE_WAY || 50);
