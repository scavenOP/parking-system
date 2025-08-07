import UserModel from '../Models/User-Model.js';

export async function getUserById(userId) {
    const user = await UserModel.findById(userId);

    // Create a VM object with UserId and other details
        const userVM = {
            UserId: user._id,
            Name: user.Name,
            Email: user.Email,
            DateOfBirth: user.DateOfBirth,
            Address: user.Address,
            // Do not send password for security
        };
    return userVM;
}

export async function createUser(userData) {
    const newUser = new UserModel(userData);
    return await newUser.save();
}