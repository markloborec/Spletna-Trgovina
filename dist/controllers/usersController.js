"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMe = updateMe;
const User_1 = require("../models/User");
async function updateMe(req, res) {
    try {
        // 1) brez userja v req = ni tokena / ni prijavljen
        if (!req.user) {
            return res.status(401).json({ error: "AUTH_NOT_LOGGED_IN" });
        }
        const userId = req.user.id;
        // 2) vzamemo dovoljene vrednosti iz body-ja
        const { firstName, lastName, email, deliveryAddress, phone } = req.body;
        const updateData = {};
        if (typeof firstName === "string") {
            updateData.firstName = firstName.trim();
        }
        if (typeof lastName === "string") {
            updateData.lastName = lastName.trim();
        }
        if (typeof deliveryAddress === "string") {
            updateData.deliveryAddress = deliveryAddress.trim();
        }
        if (typeof phone === "string") {
            updateData.phone = phone.trim();
        }
        if (typeof email === "string") {
            updateData.email = email.toLowerCase().trim();
        }
        // 3) če ni nobenega dovoljenega polja -> bad request
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "PROFILE_NO_FIELDS" });
        }
        // 4) če se email spreminja, preveri, da ga nima že kdo drug
        if (updateData.email) {
            const existing = await User_1.User.findOne({
                email: updateData.email,
                _id: { $ne: userId },
            });
            if (existing) {
                return res.status(409).json({ error: "PROFILE_EMAIL_EXISTS" });
            }
        }
        // 5) posodobi userja v bazi
        const updatedUser = await User_1.User.findByIdAndUpdate(userId, { $set: updateData }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ error: "USER_NOT_FOUND" });
        }
        // 6) vrni posodobljen profil (camelCase)
        return res.json({
            id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            deliveryAddress: updatedUser.deliveryAddress,
            phone: updatedUser.phone,
            is_admin: updatedUser.is_admin,
        });
    }
    catch (err) {
        console.error("UpdateMe error:", err);
        return res.status(500).json({ error: "PROFILE_UPDATE_FAILED" });
    }
}
