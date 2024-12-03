const Address = require('../models/address.model');


exports.createAddress = async (req, res) => {
    try {
      const { userId, street, city, state, country, postalCode, isDefault } = req.body;
  
      // Ensure that userId is provided
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
      }
  
      const newAddress = new Address({
        userId,         // Ensure userId is included
        street,
        city,
        state,
        country,
        postalCode,
        isDefault
      });
  
      await newAddress.save();
  
      res.status(201).json({ success: true, address: newAddress });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error creating address' });
    }
  };
  
exports.updateAddress = async (req, res) => {
    try {
      const { addressId } = req.params;
      const { street, city, state, country, postalCode, isDefault } = req.body;
  
      // Ensure that there is only one default address per user
      if (isDefault) {
        await Address.updateMany({ userId: req.body.userId, isDefault: true }, { isDefault: false });
      }
  
      const updatedAddress = await Address.findByIdAndUpdate(addressId, { street, city, state, country, postalCode, isDefault }, { new: true });
      if (!updatedAddress) {
        return res.status(404).json({ success: false, message: 'Address not found' });
      }
      res.status(200).json({ success: true, message: 'Address updated successfully', address: updatedAddress });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Error updating address', error: err.message });
    }
  };

  exports.deleteAddress = async (req, res) => {
    try {
      const { addressId } = req.params;
      const deletedAddress = await Address.findByIdAndDelete(addressId);
  
      if (!deletedAddress) {
        return res.status(404).json({ success: false, message: 'Address not found' });
      }
  
      res.status(200).json({ success: true, message: 'Address deleted successfully', address: deletedAddress });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Error deleting address', error: err.message });
    }
  };


  exports.getUserAddresses = async (req, res) => {
    try {
      const { userId } = req.params;
      const addresses = await Address.find({ userId });
  
      if (addresses.length === 0) {
        return res.status(404).json({ success: false, message: 'No addresses found for this user' });
      }
  
      res.status(200).json({ success: true, addresses });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Error fetching addresses', error: err.message });
    }
  };
  
  
  exports.getDefaultAddress = async (req, res) => {
    try {
      const { userId } = req.params;
      const address = await Address.findOne({ userId, isDefault: true });
  
      if (!address) {
        return res.status(404).json({ success: false, message: 'No default address found for this user' });
      }
  
      res.status(200).json({ success: true, address });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Error fetching default address', error: err.message });
    }
  };
  