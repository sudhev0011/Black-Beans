const Address = require('../../models/addressModel');
const User = require('../../models/userModel');

// Show all addresses for a user
const showAddresses = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (userId !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const addresses = await Address.find({ user: userId, isListed: true });
    res.json({ success: true, addresses });
  } catch (error) {
    console.error("Show addresses error:", error);
    res.status(500).json({ success: false, message: "Something went wrong", error });
  }
};

// Add a new address
const addAddress = async (req, res) => {
  const {
    fullname,
    phone,
    email,
    addressLine,
    city,
    state,
    country,
    pincode,
    addressType,
    isDefault,
  } = req.body;

  try {
    const userId = req.user.id;

    // If setting as default, unset other defaults
    if (isDefault) {
      await Address.updateMany({ user: userId, isDefault: true }, { isDefault: false });
    }

    const newAddress = await Address.create({
      user: userId,
      fullname,
      phone,
      email,
      addressLine,
      city,
      state,
      country,
      pincode,
      addressType,
      isDefault: isDefault || false,
    });

    res.status(201).json({ success: true, message: "Address added successfully", address: newAddress });
  } catch (error) {
    console.error("Add address error:", error);
    res.status(500).json({ success: false, message: "Something went wrong", error });
  }
};

// Edit an address
const editAddress = async (req, res) => {
  const { addressId } = req.params;
  
  const {
    fullname,
    phone,
    email,
    addressLine,
    city,
    state,
    country,
    pincode,
    addressType,
    isDefault,
  } = req.body;

  try {
    const address = await Address.findById(addressId);
    if (!address || address.user.toString() !== req.user.id.toString()) {
      return res.status(404).json({ success: false, message: "Address not found or unauthorized" });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await Address.updateMany(
        { user: req.user.id, isDefault: true, _id: { $ne: addressId } },
        { isDefault: false }
      );
    }

    address.fullname = fullname || address.fullname;
    address.phone = phone || address.phone;
    address.email = email || address.email;
    address.addressLine = addressLine || address.addressLine;
    address.city = city || address.city;
    address.state = state || address.state;
    address.country = country || address.country;
    address.pincode = pincode || address.pincode;
    address.addressType = addressType || address.addressType;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    await address.save();

    res.json({ success: true, message: "Address updated successfully", address });
  } catch (error) {
    console.error("Edit address error:", error);
    res.status(500).json({ success: false, message: "Something went wrong", error });
  }
};

// Delete an address (soft delete by setting isListed to false)
const deleteAddress = async (req, res) => {
  const { addressId } = req.params;

  try {
    const address = await Address.findById(addressId);
    if (!address || address.user.toString() !== req.user.id.toString()) {
      return res.status(404).json({ success: false, message: "Address not found or unauthorized" });
    }

    if (address.isDefault) {
      return res.status(400).json({ success: false, message: "Cannot delete default address" });
    }

    address.isListed = false;
    await address.save();

    res.json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({ success: false, message: "Something went wrong", error });
  }
};

module.exports = {
  showAddresses,
  addAddress,
  editAddress,
  deleteAddress,
};