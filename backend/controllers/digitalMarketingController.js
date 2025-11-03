const DigitalMarketingRole = require('../models/digitalMarketingRole');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');
const CalendarEvent = require('../models/calendarEvent');
const Holiday = require('../models/Holiday');
const nodemailer = require('nodemailer');

// Register a new digital marketing role
const register = async (req, res) => {
    try {
        const { username, password, email, skills } = req.body;
        
        // Check if user already exists
        const existingUser = await DigitalMarketingRole.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'User with this email or username already exists' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Handle image upload if present
        let imageUrl = null;
        if (req.file) {
            const result = await uploadToCloudinary(req.file.path, 'digital-marketing-profiles');
            imageUrl = result.secure_url;
        }

        // Create new user
        const newUser = new DigitalMarketingRole({
            username,
            password: hashedPassword,
            email,
            skills: skills || [],
            image: imageUrl
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: 'Digital Marketing Role created successfully',
            data: {
                username: newUser.username,
                email: newUser.email,
                skills: newUser.skills,
                image: newUser.image
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating digital marketing role',
            error: error.message
        });
    }
};

// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await DigitalMarketingRole.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, userRole: 'digital-marketing', username: user.username, role: 'digital-marketing' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                userRole: 'digital-marketing',
                email: user.email,
                skills: user.skills,
                image: user.image
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error during login',
            error: error.message
        });
    }
};

// Update profile
const updateProfile = async (req, res) => {
    try {
        const { username, email, skills } = req.body;
        const userId = req.marketingUser._id;

        const user = await DigitalMarketingRole.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Handle image update if present
        if (req.file) {
            // Delete old image if exists
            if (user.image) {
                const publicId = user.image.split('/').pop().split('.')[0];
                await deleteFromCloudinary(publicId);
            }
            
            // Upload new image
            const result = await uploadToCloudinary(req.file.path, 'digital-marketing-profiles');
            user.image = result.secure_url;
        }

        // Update other fields
        if (username) user.username = username;
        if (email) user.email = email;
        if (skills) user.skills = skills;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                username: user.username,
                email: user.email,
                skills: user.skills,
                image: user.image
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

// Get profile
const getProfile = async (req, res) => {
    try {
        const userId = req.marketingUser._id;
        
        const user = await DigitalMarketingRole.findById(userId)
            .select('-password'); // Exclude password

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
};

// Delete profile
const deleteProfile = async (req, res) => {
    try {
        const userId = req.marketingUser._id;

        const user = await DigitalMarketingRole.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete profile image from cloudinary if exists
        if (user.image) {
            const publicId = user.image.split('/').pop().split('.')[0];
            await deleteFromCloudinary(publicId);
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Profile deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting profile',
            error: error.message
        });
    }
};

const fetchNotifications = async (req, res) => {
    try {
        const userId = req.marketingUser._id;

        const notifications = await Notification.find({
            recipient: userId
        }).sort({ date: -1 }); // Sort by date descending (newest first)

        if (notifications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No notifications found'
            });
        }

        res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications',
            error: error.message
        });
    }
};

const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.marketingUser._id;

        await Notification.updateMany(
            { 
                recipient: userId,
                read: false 
            },
            { read: true }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error marking notifications as read',
            error: error.message
        });
    }
};
// Fetch all digital marketing members
const getAllMembers = async (req, res) => {
    try {
        const members = await DigitalMarketingRole.find({}, {
            password: 0, // Exclude password from response
            __v: 0 // Exclude version key
        });

        if (members.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No digital marketing members found'
            });
        }

        res.status(200).json({
            success: true,
            data: members
        });

    } catch (error) {
        res.status(500).json({
            success: false, 
            message: 'Error fetching digital marketing members',
            error: error.message
        });
    }
};

// Admin delete digital marketing user
const adminDeleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await DigitalMarketingRole.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete profile image from cloudinary if exists
        if (user.image) {
            const publicId = user.image.split('/').pop().split('.')[0];
            await deleteFromCloudinary(publicId);
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Digital marketing user deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting digital marketing user',
            error: error.message
        });
    }
};

// Fetch meetings where the marketing user is a participant
const getParticipatingMeetings = async (req, res) => {
    try {
        const userId = req.marketingUser._id;

        const meetings = await CalendarEvent.find({
            'participants': {
                $elemMatch: {
                    participantId: { $exists: true, $ne: null }, // Only get non-null participants
                    onModel: 'DigitalMarketingRole'
                }
            },
            eventType: 'Meeting'
        })
        .populate({
            path: 'createdBy',
            select: 'username email',
            refPath: 'onModel'
        })
        .populate({
            path: 'participants.participantId',
            select: 'username email',
            refPath: 'participants.onModel'
        })
        .sort({ eventDate: 1 });

        // Filter out any meetings with null participants
        const validMeetings = meetings.map(meeting => {
            const validParticipants = meeting.participants.filter(p => p.participantId != null);
            return {
                ...meeting.toObject(),
                participants: validParticipants
            };
        });

        if (validMeetings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No meetings found'
            });
        }

        res.status(200).json({
            success: true,
            data: validMeetings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching meetings',
            error: error.message
        });
    }
};

// Fetch all events for marketing user
const getMarketingEvents = async (req, res) => {
    try {
        const userId = req.marketingUser._id;

        // Find events where the marketing user is either the creator or a participant
        const events = await CalendarEvent.find({
            $or: [
                { 
                    'participants': {
                        $elemMatch: {
                            participantId: userId,
                            onModel: 'DigitalMarketingRole'
                        }
                    }
                },
                {
                    createdBy: userId,
                    onModel: 'DigitalMarketingRole'
                }
            ]
        })
        .populate({
            path: 'createdBy',
            select: 'username email _id', // Include _id in the select
            refPath: 'onModel'
        })
        .populate({
            path: 'participants.participantId',
            select: 'username email _id', // Include _id in the select
            refPath: 'participants.onModel'
        })
        .populate({
            path: 'projectId',
            select: 'title description -_id'
        })
        .sort({ eventDate: 1 }); // Sort by date ascending

        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No events found'
            });
        }

        res.status(200).json({
            success: true,
            data: events
        });
    } catch (error) {
        console.error('Error fetching marketing events:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching events',
            error: error.message
        });
    }
};

// Apply for holiday/leave
const applyForHoliday = async (req, res) => {
    const { startDate, endDate, reason } = req.body;
    const marketingId = req.marketingUser._id;
    const marketingName = req.marketingUser.username;

    try {
        const newHoliday = new Holiday({
            developer: marketingId,
            developerName: marketingName,
            startDate,
            endDate,
            reason,
            role: 'DigitalMarketingRole'
        });
        await newHoliday.save();

        // Create a corresponding calendar event
        const newEvent = new CalendarEvent({
            title: "Holiday",
            description: reason,
            eventDate: startDate,
            createdBy: marketingId,
            onModel: 'DigitalMarketingRole',
            eventType: 'Holiday',
            endDate: endDate,
            projectId: newHoliday._id,
            participants: [{ participantId: marketingId, onModel: 'DigitalMarketingRole' }]
        });
        await newEvent.save();

        // Create notification for admin
        const notification = new Notification({
            recipient: null,
            content: `Holiday request from ${marketingName} (Digital Marketing)`,
            type: 'Holiday',
            relatedId: newHoliday._id,
            read: false
        });
        await notification.save();

        res.status(201).json({
            success: true,
            message: 'Holiday request submitted successfully',
            data: {
                holiday: newHoliday,
                event: newEvent
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error submitting holiday request',
            error: error.message
        });
    }
};

// Withdraw holiday request
const withdrawHoliday = async (req, res) => {
    const holidayId = req.params.holidayId;
    const marketingId = req.marketingUser._id;

    try {
        // Update the holiday request to 'Withdrawn'
        const updatedHoliday = await Holiday.findOneAndUpdate(
            { 
                _id: holidayId, 
                developer: marketingId,
                role: 'DigitalMarketingRole',
                status: { $ne: 'Approved' } 
            },
            { status: 'Withdrawn' },
            { new: true }
        );

        if (!updatedHoliday) {
            return res.status(404).json({
                success: false,
                message: 'Holiday request not found or already approved'
            });
        }

        // Update the corresponding calendar event
        const updatedEvent = await CalendarEvent.findOneAndUpdate(
            { projectId: holidayId },
            { status: 'Not-Active', title: 'Withdrawn Holiday' },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Holiday withdrawn successfully',
            data: {
                holiday: updatedHoliday,
                event: updatedEvent
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error withdrawing holiday',
            error: error.message
        });
    }
};

// Fetch all holidays for the marketing user
const fetchHolidays = async (req, res) => {
    const marketingId = req.marketingUser._id;

    try {
        const holidays = await Holiday.find({ 
            developer: marketingId,
            role: 'DigitalMarketingRole'
        });
        
        res.status(200).json({
            success: true,
            data: holidays
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching holiday requests',
            error: error.message
        });
    }
};

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'khanbasha7777777@gmail.com',
        pass: 'hpdi qrqk plrn blzz'
    }
});

// Initiate password reset for digital marketing
const initiatePasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await DigitalMarketingRole.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiration = new Date();
    otpExpiration.setMinutes(otpExpiration.getMinutes() + 10);
    user.resetPasswordOTP = { code: otp, expiresAt: otpExpiration };
    await user.save();
    const mailOptions = {
      from: 'khanbasha7777777@gmail.com',
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}\nThis OTP will expire in 10 minutes.`
    };
    transporter.sendMail(mailOptions, function(error, info) {
      if (error) { console.log('Error sending email:', error); }
    });
    res.status(200).json({ message: 'OTP has been sent to your email', email });
  } catch (error) {
    res.status(500).json({ message: 'Error initiating password reset', error: error.message });
  }
};

// Reset password for digital marketing
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await DigitalMarketingRole.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.resetPasswordOTP || user.resetPasswordOTP.code !== otp || new Date() > user.resetPasswordOTP.expiresAt) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 8);
    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    await user.save();
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};

module.exports = {
    register,
    login,
    updateProfile,
    getProfile,
    deleteProfile,
    fetchNotifications,
    markAllNotificationsAsRead,
    getAllMembers,
    adminDeleteUser,
    getParticipatingMeetings,
    getMarketingEvents,
    applyForHoliday,
    withdrawHoliday,
    fetchHolidays,
    initiatePasswordReset,
    resetPassword
};
