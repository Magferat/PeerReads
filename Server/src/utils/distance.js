const haversineDistance = require("../utils/distance");

exports.getIncoming = async (req, res) => {
    const requests = await BorrowRequest.find({ lender: req.user._id })
        .populate("book")
        .populate("borrower", "name location")
        .lean();

    // Add distance if borrower has coords
    requests.forEach((r) => {
        if (
            r.borrower?.location?.coordinates &&
            req.user?.location?.coordinates
        ) {
            const { lat: lat1, lng: lon1 } = req.user.location.coordinates;
            const { lat: lat2, lng: lon2 } = r.borrower.location.coordinates;
            r.distance = haversineDistance(lat1, lon1, lat2, lon2).toFixed(1);
        }
    });

    res.json(requests);
};
