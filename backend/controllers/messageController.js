const Message = require('../models/message');
const Admin = require('../models/Admin');
const Manager = require('../models/Manager');
const Developer = require('../models/Developer');
const ContentCreator = require('../models/contentCreator');
const DigitalMarketingRole = require('../models/digitalMarketingRole');
const Client = require('../models/Client');
const { sendMessageToUser } = require('../websocket/wsServer');

const getUserById = async (userId, role) => {
    switch (role) {
        case 'admin':
            return await Admin.findById(userId);
        case 'manager':
            return await Manager.findById(userId);
        case 'developer':
            return await Developer.findById(userId);
        case 'content-creator':
            return await ContentCreator.findById(userId);
        case 'digital-marketing':
            return await DigitalMarketingRole.findById(userId);
        case 'client':
            return await Client.findById(userId);
        default:
            return null;
    }
};

// Controller methods
const messageController = {
    sendMessage: async (req, res) => {
        try {
            const { receiverId, receiverRole, content } = req.body;
            const senderId = req.user._id;
            const senderRole = req.user.role;

            const messageData = {
                sender: { id: senderId, role: senderRole },
                receiver: { id: receiverId, role: receiverRole },
                content,
                createdAt: new Date()
            };

            const newMessage = new Message(messageData);
            await newMessage.save();

            sendMessageToUser(receiverId, {
                type: 'newMessage',
                data: newMessage
            });

            res.status(201).json(newMessage);
        } catch (error) {
            console.error('Error in sendMessage:', error);
            res.status(500).json({ message: 'Error sending message', error: error.message });
        }
    },

    getConversation: async (req, res) => {
        try {
            const userId = req.user._id;
            const { otherUserId } = req.params;

            const messages = await Message.find({
                $or: [
                    { 'sender.id': userId, 'receiver.id': otherUserId },
                    { 'sender.id': otherUserId, 'receiver.id': userId }
                ]
            }).sort({ createdAt: 1 });

            res.status(200).json(messages);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching conversation', error: error.message });
        }
    },

    markAsRead: async (req, res) => {
        try {
            const { messageId } = req.params;
            const userId = req.user._id;

            const message = await Message.findOneAndUpdate(
                {
                    _id: messageId,
                    'receiver.id': userId
                },
                { read: true },
                { new: true }
            );

            if (!message) {
                return res.status(404).json({ message: 'Message not found or unauthorized' });
            }

            res.status(200).json(message);
        } catch (error) {
            res.status(500).json({ message: 'Error marking message as read', error: error.message });
        }
    },

    getUnreadCount: async (req, res) => {
        try {
            const userId = req.user._id;
            const count = await Message.countDocuments({
                'receiver.id': userId,
                read: false
            });
            res.status(200).json({ unreadCount: count });
        } catch (error) {
            res.status(500).json({ message: 'Error getting unread count', error: error.message });
        }
    },

    getMessagedUsers: async (req, res) => {
        try {
            const userId = req.user._id;
            const userRole = req.user.role;

            // Find all unique users that the current user has interacted with
            const conversations = await Message.find({
                $or: [
                    { 'sender.id': userId },
                    { 'receiver.id': userId }
                ]
            }).sort({ createdAt: -1 });

            // Extract unique users from conversations
            const userMap = new Map();
            
            for (const message of conversations) {
                const otherUser = message.sender.id.toString() === userId.toString() 
                    ? {
                        id: message.receiver.id,
                        role: message.receiver.role
                    }
                    : {
                        id: message.sender.id,
                        role: message.sender.role
                    };

                if (!userMap.has(otherUser.id.toString())) {
                    // Get user details
                    const userDetails = await getUserById(otherUser.id, otherUser.role);
                    if (userDetails) {
                        userMap.set(otherUser.id.toString(), {
                            _id: otherUser.id,
                            username: userDetails.username,
                            email: userDetails.email,
                            role: otherUser.role,
                            lastMessage: {
                                content: message.content,
                                createdAt: message.createdAt,
                                read: message.read
                            }
                        });
                    }
                }
            }

            const messagedUsers = Array.from(userMap.values());

            res.status(200).json({
                success: true,
                data: messagedUsers
            });
        } catch (error) {
            console.error('Error in getMessagedUsers:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching messaged users',
                error: error.message
            });
        }
    }
};

module.exports = {
    sendMessage: messageController.sendMessage,
    getConversation: messageController.getConversation,
    markAsRead: messageController.markAsRead,
    getUnreadCount: messageController.getUnreadCount,
    getMessagedUsers: messageController.getMessagedUsers,
    getUserById: messageController.getUserById
};