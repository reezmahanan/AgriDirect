const validateLot = (req, res, next) => {
  const { crop, category, quantityKg, basePricePerKg } = req.body;
  const errors = [];

  if (!crop || typeof crop !== 'string' || crop.trim().length < 2) {
    errors.push('Crop name is required (minimum 2 characters).');
  }

  const validCategories = ['vegetables', 'fruits', 'spices', 'tubers', 'grains'];
  if (!category || !validCategories.includes(category.toLowerCase())) {
    errors.push(`Category must be one of: ${validCategories.join(', ')}.`);
  }

  if (quantityKg === undefined || isNaN(Number(quantityKg)) || Number(quantityKg) < 1) {
    errors.push('Quantity must be a positive number of at least 1 kg.');
  }

  if (basePricePerKg === undefined || isNaN(Number(basePricePerKg)) || Number(basePricePerKg) < 1) {
    errors.push('Base reserve price per kg must be at least 1 LKR.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateBid = (req, res, next) => {
  const { offeredPricePerKg, bidderName, buyerOrganization } = req.body;
  const errors = [];

  if (offeredPricePerKg === undefined || isNaN(Number(offeredPricePerKg)) || Number(offeredPricePerKg) < 1) {
    errors.push('Offered price per kg must be a positive number.');
  }

  if (!bidderName || typeof bidderName !== 'string' || bidderName.trim().length < 2) {
    errors.push('Bidder contact name is required.');
  }

  if (!buyerOrganization || typeof buyerOrganization !== 'string' || buyerOrganization.trim().length < 2) {
    errors.push('Buyer organization or business name is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Bid validation failed',
      errors
    });
  }

  next();
};

module.exports = { validateLot, validateBid };
