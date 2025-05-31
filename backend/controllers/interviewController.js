const Interview = require('../models/Interview');
const Candidate = require('../models/Candidate');
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'khanbasha7777777@gmail.com',
        pass: 'hpdi qrqk plrn blzz'
    }
});

// Helper function to send interview emails
const sendInterviewEmail = async (candidate, interviewDetails) => {
    const mailOptions = {
        from: 'khanbasha7777777@gmail.com',
        to: candidate.email,
        subject: `Interview Scheduled - ${interviewDetails.name}`,
        text: `
Dear ${candidate.name},

Your interview has been scheduled with the following details:

Interview Name: ${interviewDetails.name}
Date & Time: ${new Date(interviewDetails.interviewDate).toLocaleString()}
${interviewDetails.interviewLink ? `Interview Link: ${interviewDetails.interviewLink}` : ''}

Please make sure to be available at the scheduled time.

Additional Notes:
- Please keep your resume handy
- Ensure you have a stable internet connection
- Test your audio and video before the interview
${interviewDetails.additionalNotes ? `\nSpecial Instructions: ${interviewDetails.additionalNotes}` : ''}

Best regards,
HR Team
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Interview email sent successfully');
    } catch (error) {
        console.error('Error sending interview email:', error);
        throw error;
    }
};

// Create new interview
const createInterview = async (req, res) => {
    try {
        const interviewData = { ...req.body };

        // Find candidate to get email
        const candidate = await Candidate.findById(interviewData.candidate.id);
        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found'
            });
        }

        // Add creator information
        interviewData.createdBy = [{
            id: req.user._id,
            role: req.user.role
        }];

        // Create interview
        const interview = new Interview(interviewData);
        await interview.save();

        // Update candidate's job application with interview details
        const jobApplication = candidate.jobsApplied.find(
            app => app.job.toString() === interviewData.jobId
        );

        if (jobApplication) {
            jobApplication.interviewDetails = interview._id;
            jobApplication.status = 'interviewed';
            await candidate.save();
        }

        // Send interview email
        await sendInterviewEmail(candidate, interviewData);

        res.status(201).json({
            success: true,
            message: 'Interview scheduled successfully',
            interview
        });
    } catch (error) {
        console.error('Error creating interview:', error);
        res.status(500).json({
            success: false,
            message: 'Error scheduling interview',
            error: error.message
        });
    }
};

// Get all interviews
const getAllInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find()
            .populate('candidate.id', 'name email')
            .populate('createdBy.id', 'username email');

        res.status(200).json({
            success: true,
            interviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching interviews',
            error: error.message
        });
    }
};

// Get interview by ID
const getInterviewById = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id)
            .populate('candidate.id', 'name email')
            .populate('createdBy.id', 'username email');

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: 'Interview not found'
            });
        }

        res.status(200).json({
            success: true,
            interview
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching interview',
            error: error.message
        });
    }
};

// Update interview
const updateInterview = async (req, res) => {
    try {
        const interviewData = { ...req.body };
        const interview = await Interview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: 'Interview not found'
            });
        }

        // Find candidate to send update email
        const candidate = await Candidate.findById(interview.candidate.id);
        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found'
            });
        }

        // Add to createdBy array if not already present
        const creatorExists = interview.createdBy.some(
            creator => creator.id.toString() === req.user._id.toString()
        );
        
        if (!creatorExists) {
            interviewData.createdBy = [
                ...interview.createdBy,
                {
                    id: req.user._id,
                    role: req.user.role
                }
            ];
        }

        const updatedInterview = await Interview.findByIdAndUpdate(
            req.params.id,
            { $set: interviewData },
            { new: true }
        ).populate('candidate.id', 'name email');

        // Send update email
        if (interviewData.interviewDate || interviewData.interviewLink) {
            await sendInterviewEmail(candidate, {
                ...interview.toObject(),
                ...interviewData
            });
        }

        res.status(200).json({
            success: true,
            message: 'Interview updated successfully',
            interview: updatedInterview
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating interview',
            error: error.message
        });
    }
};

// Update interview status
const updateInterviewStatus = async (req, res) => {
    try {
        const { status, feedback } = req.body;
        const interview = await Interview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: 'Interview not found'
            });
        }

        interview.interviewStatus = status;
        if (feedback) {
            interview.feedback = feedback;
        }

        await interview.save();

        // Update candidate's application status if interview is completed
        if (status === 'completed') {
            const candidate = await Candidate.findById(interview.candidate.id);
            if (candidate) {
                const jobApplication = candidate.jobsApplied.find(
                    app => app.interviewDetails?.toString() === interview._id.toString()
                );
                if (jobApplication) {
                    jobApplication.status = feedback?.rating >= 3 ? 'selected' : 'rejected';
                    await candidate.save();
                }
            }
        }

        res.status(200).json({
            success: true,
            message: 'Interview status updated successfully',
            interview
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating interview status',
            error: error.message
        });
    }
};

// Delete interview
const deleteInterview = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: 'Interview not found'
            });
        }

        // Remove interview reference from candidate's job application
        const candidate = await Candidate.findById(interview.candidate.id);
        if (candidate) {
            const jobApplication = candidate.jobsApplied.find(
                app => app.interviewDetails?.toString() === interview._id.toString()
            );
            if (jobApplication) {
                jobApplication.interviewDetails = undefined;
                jobApplication.status = 'shortlisted'; // Revert status
                await candidate.save();
            }
        }

        await Interview.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Interview deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting interview',
            error: error.message
        });
    }
};

module.exports = {
    createInterview,
    getAllInterviews,
    getInterviewById,
    updateInterview,
    updateInterviewStatus,
    deleteInterview
}; 