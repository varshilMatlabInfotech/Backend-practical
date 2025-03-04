const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const model = require('./usermodel');
const friendRequestmodel = require("./friendrequestmodel");

// Add new User
const Adduser = async (req, res) => {
    const { fname, lname, mobileNo, email, password } = req.body;

    try {
        let user = await model.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const RegistrationData = new model({
            fname, lname, mobileNo, email, password: hashedPassword,
        });

        await RegistrationData.save();

        const token = jwt.sign(
            { userId: RegistrationData._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } 
        );

        res.status(201).json({ msg: "User Registration Successfully", token });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// Login User
const Login = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await model.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({ fname: user.fname, lname: user.lname, _id: user._id, token });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// Get All Users
const Getuser = async (req, res) => {
    try {
        const users = await model.find({});
        res.status(200).json(users);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// get one user
const GetuserById = async (req, res) => {
    try {
        const { _id } = req.params;
        const userData = await model.findById(_id);
        if (!userData) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(200).json({ userData });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// delete user
const Deleteuser = async (req, res) => {
    try {
        const data = await model.deleteOne(req.params._id);
        if (!data) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(200).json({ msg: 'User deleted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// update user
const Updateuser = async (req, res) => {
    const {
        fname, lname, mobileNo, email, password
    } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const data = await model.updateOne(
            req.params._id,
            {
                fname, lname, mobileNo, email, 
                password: hashedPassword,
            },
            { new: true }
        );

        if (!data) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.status(200).json({ msg: 'Data updated successfully', data });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};


// Send Friend Request and if friend request is already sent
const sendFriendRequest = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.user.userId;

        if (!senderId) {
            return res.status(401).json({ message: "Unauthorized: No user data" });
        }

        if (senderId === receiverId) {
            return res.status(400).json({ message: "You cannot send a friend request to yourself" });
        }

        const existingRequest = await friendRequestmodel.findOne({ sender: senderId, receiver: receiverId });
        if (existingRequest) {
            return res.status(400).json({ message: "Friend request already sent" });
        }

        const newFriendRequest = new friendRequestmodel({ sender: senderId, receiver: receiverId });
        await newFriendRequest.save();

        res.status(201).json({ message: "Friend request sent" });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// Accept or Reject Friend Request
const acceptRejectRequest = async (req, res) => {
    try {
        const { id } = req.params; 
        const { status } = req.body;

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const friendRequest = await friendRequestmodel.findById(id);
        if (!friendRequest) {
            return res.status(404).json({ message: "Friend request not found" });
        }

    
        friendRequest.status = status;
        await friendRequest.save();


        if (status === "accepted") {
            const sender = await UserModel.findById(friendRequest.sender);
            const receiver = await UserModel.findById(friendRequest.receiver);

            if (!sender || !receiver) {
                return res.status(400).json({ message: "User not found" });
            }


            sender.friends.push(receiver._id);
            receiver.friends.push(sender._id);

            await sender.save();
            await receiver.save();
        }

        res.json({ message: `Friend request is ${status}` });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
};

// Display Friend List
const displayFriendList = async (req, res) => {
    try {
        const user = await model.findById(req.user.userId).populate("friends", "fname lname email");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user.friends);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// List Incoming Friend Requests
const incomingFriendRequestList = async (req, res) => {
    try {
        const requests = await friendRequestmodel.find({ receiver: req.user.userId, status: "pending" })
            .populate("sender", "fname lname email");
        res.json(requests);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {Adduser,Login,Getuser,sendFriendRequest,acceptRejectRequest,displayFriendList,incomingFriendRequestList,GetuserById,Deleteuser,Updateuser};
