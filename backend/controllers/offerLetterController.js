const OfferLetter = require('../models/OfferLetter');
const Candidate = require('../models/Candidate');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'khanbasha7777777@gmail.com',
        pass: 'hpdi qrqk plrn blzz'
    }
});

// Helper function to generate PDF offer letter
const generateOfferLetterPDF = async (offerData) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            const filePath = `./uploads/offer_letter_${Date.now()}.pdf`;
            const writeStream = fs.createWriteStream(filePath);

            doc.pipe(writeStream);

            // Add company logo if available
            // if (companyLogo) {
            //     doc.image(companyLogo, 50, 50, { width: 100 });
            // }

            // Add content to PDF
            doc.fontSize(20).text('Offer Letter', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Date: ${new Date(offerData.offerDate).toLocaleDateString()}`);
            doc.moveDown();
            doc.text(`Dear ${offerData.candidate.name},`);
            doc.moveDown();
            doc.text('We are pleased to offer you the position of:');
            doc.fontSize(14).text(offerData.offerDetails.position, { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Location: ${offerData.offerDetails.location}`);
            doc.text(`Annual Salary: ${offerData.offerDetails.salary}`);
            doc.moveDown();
            doc.text('Benefits:');
            offerData.offerDetails.benefits.forEach(benefit => {
                doc.text(`• ${benefit}`);
            });
            doc.moveDown();
            doc.text(`Joining Date: ${new Date(offerData.joiningDate).toLocaleDateString()}`);
            doc.moveDown();
            doc.text('Please confirm your acceptance by signing and returning this offer letter.');
            doc.moveDown(2);
            doc.text('Best regards,');
            doc.text('HR Team');

            doc.end();

            writeStream.on('finish', () => {
                resolve(filePath);
            });

            writeStream.on('error', reject);
        } catch (error) {
            reject(error);
        }
    });
};

// Helper function to send offer letter email
const sendOfferLetterEmail = async (candidate, offerLetterUrl, offerDetails) => {
    const mailOptions = {
        from: 'khanbasha7777777@gmail.com',
        to: candidate.email,
        subject: 'Job Offer Letter',
        text: `
Dear ${candidate.name},

We are pleased to offer you the position of ${offerDetails.position} at our organization.

Position: ${offerDetails.position}
Location: ${offerDetails.location}
Annual Salary: ${offerDetails.salary}
Joining Date: ${new Date(offerDetails.joiningDate).toLocaleDateString()}

Please find your offer letter attached. To accept this offer, please sign and return the offer letter.

Best regards,
HR Team
        `,
        attachments: [{
            filename: 'OfferLetter.pdf',
            path: offerLetterUrl
        }]
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Offer letter email sent successfully');
    } catch (error) {
        console.error('Error sending offer letter email:', error);
        throw error;
    }
};

// Create new offer letter
const createOfferLetter = async (req, res) => {
    try {
        const offerLetterData = { ...req.body };

        // Find candidate
        const candidate = await Candidate.findById(offerLetterData.candidate.id);
        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found'
            });
        }

        // Generate PDF
        const pdfPath = await generateOfferLetterPDF({
            ...offerLetterData,
            candidate: {
                name: candidate.name,
                email: candidate.email
            }
        });

        // Upload PDF to Cloudinary
        const result = await uploadToCloudinary(pdfPath, 'offer-letters');
        offerLetterData.offerLetterUrl = result.secure_url;

        // Delete local PDF file
        fs.unlinkSync(pdfPath);

        // Add creator information
        offerLetterData.createdBy = [{
            id: req.user._id,
            role: req.user.role
        }];

        // Create offer letter
        const offerLetter = new OfferLetter(offerLetterData);
        await offerLetter.save();

        // Update candidate's job application
        const jobApplication = candidate.jobsApplied.find(
            app => app.job.toString() === offerLetterData.jobId
        );

        if (jobApplication) {
            jobApplication.offerLetter = offerLetter._id;
            await candidate.save();
        }

        // Send email
        await sendOfferLetterEmail(candidate, offerLetterData.offerLetterUrl, offerLetterData.offerDetails);

        res.status(201).json({
            success: true,
            message: 'Offer letter created and sent successfully',
            offerLetter
        });
    } catch (error) {
        console.error('Error creating offer letter:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating offer letter',
            error: error.message
        });
    }
};

// Get all offer letters
const getAllOfferLetters = async (req, res) => {
    try {
        const offerLetters = await OfferLetter.find()
            .populate('candidate.id', 'name email')
            .populate('createdBy.id', 'username email');

        res.status(200).json({
            success: true,
            offerLetters
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching offer letters',
            error: error.message
        });
    }
};

// Get offer letter by ID
const getOfferLetterById = async (req, res) => {
    try {
        const offerLetter = await OfferLetter.findById(req.params.id)
            .populate('candidate.id', 'name email')
            .populate('createdBy.id', 'username email');

        if (!offerLetter) {
            return res.status(404).json({
                success: false,
                message: 'Offer letter not found'
            });
        }

        res.status(200).json({
            success: true,
            offerLetter
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching offer letter',
            error: error.message
        });
    }
};

// Update offer letter status
const updateOfferLetterStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const offerLetter = await OfferLetter.findById(req.params.id);

        if (!offerLetter) {
            return res.status(404).json({
                success: false,
                message: 'Offer letter not found'
            });
        }

        offerLetter.status = status;
        await offerLetter.save();

        // Update candidate's application status
        const candidate = await Candidate.findById(offerLetter.candidate.id);
        if (candidate) {
            const jobApplication = candidate.jobsApplied.find(
                app => app.offerLetter?.toString() === offerLetter._id.toString()
            );
            if (jobApplication) {
                jobApplication.status = status === 'accepted' ? 'selected' : 'rejected';
                await candidate.save();
            }
        }

        res.status(200).json({
            success: true,
            message: 'Offer letter status updated successfully',
            offerLetter
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating offer letter status',
            error: error.message
        });
    }
};

// Delete offer letter
const deleteOfferLetter = async (req, res) => {
    try {
        const offerLetter = await OfferLetter.findById(req.params.id);

        if (!offerLetter) {
            return res.status(404).json({
                success: false,
                message: 'Offer letter not found'
            });
        }

        // Delete PDF from Cloudinary
        if (offerLetter.offerLetterUrl) {
            const publicId = offerLetter.offerLetterUrl.split('/').slice(-2).join('/').split('.')[0];
            await deleteFromCloudinary(publicId);
        }

        // Remove offer letter reference from candidate
        const candidate = await Candidate.findById(offerLetter.candidate.id);
        if (candidate) {
            const jobApplication = candidate.jobsApplied.find(
                app => app.offerLetter?.toString() === offerLetter._id.toString()
            );
            if (jobApplication) {
                jobApplication.offerLetter = undefined;
                await candidate.save();
            }
        }

        await OfferLetter.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Offer letter deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting offer letter',
            error: error.message
        });
    }
};

module.exports = {
    createOfferLetter,
    getAllOfferLetters,
    getOfferLetterById,
    updateOfferLetterStatus,
    deleteOfferLetter
}; 