const Payslip = require('../models/Payslip');
const Developer = require('../models/Developer');
const DigitalMarketingRole = require('../models/digitalMarketingRole');
const ContentCreator = require('../models/contentCreator');
const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');
const { createNotification } = require('../utils/notificationHelper');

// Add email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'khanbasha7777777@gmail.com',
        pass: 'hpdi qrqk plrn blzz'
    }
});

// Helper function to send payslip email
const sendPayslipEmail = async (employeeEmail, payslipDetails) => {
    const mailOptions = {
        from: 'khanbasha7777777@gmail.com',
        to: employeeEmail,
        subject: 'New Payslip Generated',
        text: `
Dear Employee,

Your payslip has been generated with the following details:

Amount: ${payslipDetails.amount}
Date: ${new Date(payslipDetails.paidDate).toLocaleDateString()}
Description: ${payslipDetails.description}

Please log in to your account to view the complete details.

Best regards,
HR Department
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Payslip email sent successfully');
    } catch (error) {
        console.error('Error sending payslip email:', error);
    }
};

// Create a new payslip
const createPayslip = async (req, res) => {
    try {
        const { employeeId, amount, paidDate, description, employeeRole } = req.body;
        
        // Map role to correct model
        const modelMap = {
            'developer': Developer,
            'digital-marketing': DigitalMarketingRole,
            'content-creator': ContentCreator
        };

        const modelNameMap = {
            'developer': 'Developer',
            'digital-marketing': 'DigitalMarketingRole',
            'content-creator': 'ContentCreator'
        };

        // Find employee based on role
        const Model = modelMap[employeeRole];
        if (!Model) {
            return res.status(400).json({
                success: false,
                message: 'Invalid employee role'
            });
        }

        const employee = await Model.findById(employeeId);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        const payslip = new Payslip({
            paidTo: {
                id: employee._id,
                name: employee.username || employee.name,
                role: employeeRole,
                model: modelNameMap[employeeRole]
            },
            amount,
            paidDate: new Date(paidDate),
            description,
            createdBy: req.hr.id
        });

        await payslip.save();

        // Send email notification
        if (employee.email) {
            await sendPayslipEmail(employee.email, {
                amount,
                paidDate,
                description
            });
        }

        // Create notification for employee
        await createNotification(
            [employee._id],
            `New payslip generated for amount ${amount}`,
            'payslip',
            payslip._id
        );

        // Create notification for HR
        await createNotification(
            [req.hr.id],
            `Payslip generated for ${employee.username || employee.name} (${amount})`,
            'payslip_created',
            payslip._id
        );

        res.status(201).json({
            success: true,
            message: 'Payslip created successfully',
            data: payslip
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating payslip',
            error: error.message
        });
    }
};

// Get all payslips
const getAllPayslips = async (req, res) => {
    try {
        const payslips = await Payslip.find()
            .sort({ paidDate: -1 });

        res.status(200).json({
            success: true,
            data: payslips
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching payslips',
            error: error.message
        });
    }
};

// Get payslips by employee
const getPayslipsByEmployee = async (req, res) => {
    try {
        const { employeeId, role } = req.params;

        const payslips = await Payslip.find({
            'paidTo.id': employeeId,
            'paidTo.role': role
        }).sort({ paidDate: -1 });

        res.status(200).json({
            success: true,
            data: payslips
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching employee payslips',
            error: error.message
        });
    }
};

// Update payslip
const updatePayslip = async (req, res) => {
    try {
        const { payslipId } = req.params;
        const { amount, paidDate, description } = req.body;

        const payslip = await Payslip.findById(payslipId);
        if (!payslip) {
            return res.status(404).json({
                success: false,
                message: 'Payslip not found'
            });
        }

        // Update fields
        if (amount) payslip.amount = amount;
        if (paidDate) payslip.paidDate = new Date(paidDate);
        if (description) payslip.description = description;

        await payslip.save();

        // Create notification for employee
        await createNotification(
            [payslip.paidTo.id],
            `Your payslip has been updated (Amount: ${amount || payslip.amount})`,
            'payslip_updated',
            payslip._id
        );

        // Create notification for HR
        await createNotification(
            [req.hr.id],
            `Payslip updated for ${payslip.paidTo.name} (${amount || payslip.amount})`,
            'payslip_updated',
            payslip._id
        );

        res.status(200).json({
            success: true,
            message: 'Payslip updated successfully',
            data: payslip
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating payslip',
            error: error.message
        });
    }
};

// Delete payslip
const deletePayslip = async (req, res) => {
    try {
        const { payslipId } = req.params;

        const payslip = await Payslip.findById(payslipId);
        if (!payslip) {
            return res.status(404).json({
                success: false,
                message: 'Payslip not found'
            });
        }

        // Create notification for employee before deletion
        await createNotification(
            [payslip.paidTo.id],
            `A payslip dated ${new Date(payslip.paidDate).toLocaleDateString()} has been deleted`,
            'payslip_deleted',
            null
        );

        // Create notification for HR
        await createNotification(
            [req.hr.id],
            `Payslip deleted for ${payslip.paidTo.name}`,
            'payslip_deleted',
            null
        );

        await payslip.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Payslip deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting payslip',
            error: error.message
        });
    }
};

// Get payslip statistics
const getPayslipStats = async (req, res) => {
    try {
        const stats = await Payslip.aggregate([
            {
                $group: {
                    _id: '$paidTo.role',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 },
                    avgAmount: { $avg: '$amount' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching payslip statistics',
            error: error.message
        });
    }
};

module.exports = {
    createPayslip,
    getAllPayslips,
    getPayslipsByEmployee,
    updatePayslip,
    deletePayslip,
    getPayslipStats
}; 