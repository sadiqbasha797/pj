const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// Create new candidate with job application
const createCandidate = async (req, res) => {
    try {
        // Parse stringified form data
        const candidateData = {};
        Object.keys(req.body).forEach(key => {
            try {
                candidateData[key] = JSON.parse(req.body[key]);
            } catch (e) {
                candidateData[key] = req.body[key];
            }
        });

        const { jobId } = candidateData;

        // Verify job exists and populate it
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Debug log to check job status and deadline
        console.log('Job Status:', job.status);
        console.log('Job Deadline:', job.dates?.deadline);
        console.log('Current Date:', new Date());

        // Check if job is active - modified condition
        if (job.status === 'closed' || (job.dates?.deadline && new Date(job.dates.deadline) < new Date())) {
            return res.status(400).json({
                success: false,
                message: 'This job posting is no longer active'
            });
        }

        // Handle resume upload
        if (req.files && req.files.resume && req.files.resume[0]) {
            const result = await uploadToCloudinary(
                req.files.resume[0].path,
                'candidate-resumes'
            );
            candidateData.resume = result.secure_url;
        }

        // Create job application entry
        candidateData.jobsApplied = [{
            job: jobId,
            appliedDate: new Date(),
            status: 'pending'
        }];

        // Add creator information
        candidateData.createdBy = [{
            id: req.user._id,
            role: req.user.role
        }];

        const candidate = new Candidate(candidateData);
        await candidate.save();

        // Populate job details in response
        await candidate.populate('jobsApplied.job');

        res.status(201).json({
            success: true,
            message: 'Candidate created successfully',
            candidate
        });
    } catch (error) {
        console.error('Error creating candidate:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating candidate',
            error: error.message
        });
    }
};

// Add new job application for existing candidate
const applyForJob = async (req, res) => {
    try {
        const { candidateId, jobId } = req.params;

        // Verify candidate exists
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found'
            });
        }

        // Verify job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check if job is still active
        if (job.status !== 'active' || new Date(job.dates.deadline) < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'This job posting is no longer active'
            });
        }

        // Check if candidate has already applied for this job
        const alreadyApplied = candidate.jobsApplied.some(
            application => application.job.toString() === jobId
        );

        if (alreadyApplied) {
            return res.status(400).json({
                success: false,
                message: 'Candidate has already applied for this job'
            });
        }

        // Add new job application
        candidate.jobsApplied.push({
            job: jobId,
            appliedDate: new Date(),
            status: 'pending'
        });

        await candidate.save();
        await candidate.populate('jobsApplied.job');

        res.status(200).json({
            success: true,
            message: 'Job application submitted successfully',
            candidate
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error applying for job',
            error: error.message
        });
    }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
    try {
        const { candidateId, jobId } = req.params;
        const { status } = req.body;

        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found'
            });
        }

        // Find and update the specific job application
        const application = candidate.jobsApplied.find(
            app => app.job.toString() === jobId
        );

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Job application not found'
            });
        }

        application.status = status;
        await candidate.save();
        await candidate.populate('jobsApplied.job');

        res.status(200).json({
            success: true,
            message: 'Application status updated successfully',
            candidate
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating application status',
            error: error.message
        });
    }
};

// Get all candidates
const getAllCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.find()
            .populate('jobsApplied.job')
            .populate('jobsApplied.interviewDetails')
            .populate('jobsApplied.offerLetter');

        res.status(200).json({
            success: true,
            candidates
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching candidates',
            error: error.message
        });
    }
};

// Get candidate by ID
const getCandidateById = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id)
            .populate('jobsApplied.job')
            .populate('jobsApplied.interviewDetails')
            .populate('jobsApplied.offerLetter');

        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found'
            });
        }

        res.status(200).json({
            success: true,
            candidate
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching candidate',
            error: error.message
        });
    }
};

// Update candidate
const updateCandidate = async (req, res) => {
    try {
        const candidateData = { ...req.body };
        const candidate = await Candidate.findById(req.params.id);

        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found'
            });
        }

        // Handle resume update
        if (req.files && req.files.resume) {
            // Delete old resume if exists
            if (candidate.resume) {
                const publicId = candidate.resume.split('/').slice(-2).join('/').split('.')[0];
                await deleteFromCloudinary(publicId);
            }

            const result = await uploadToCloudinary(
                req.files.resume.tempFilePath,
                'candidate-resumes'
            );
            candidateData.resume = result.secure_url;
        }

        // Handle additional documents update
        if (req.files && req.files.additionalDocuments) {
            const documents = Array.isArray(req.files.additionalDocuments) 
                ? req.files.additionalDocuments 
                : [req.files.additionalDocuments];

            const uploadedDocs = await Promise.all(
                documents.map(async (doc) => {
                    const result = await uploadToCloudinary(
                        doc.tempFilePath,
                        'candidate-documents'
                    );
                    return {
                        name: doc.name,
                        url: result.secure_url
                    };
                })
            );

            // Update documents for the specified job application
            if (candidateData.jobsApplied && candidateData.jobsApplied.length > 0) {
                candidateData.jobsApplied[0].additionalDocuments = uploadedDocs;
            }
        }

        const updatedCandidate = await Candidate.findByIdAndUpdate(
            req.params.id,
            { $set: candidateData },
            { new: true }
        ).populate('jobsApplied.job')
         .populate('jobsApplied.interviewDetails')
         .populate('jobsApplied.offerLetter');

        res.status(200).json({
            success: true,
            message: 'Candidate updated successfully',
            candidate: updatedCandidate
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating candidate',
            error: error.message
        });
    }
};

// Delete candidate
const deleteCandidate = async (req, res) => {
    try {
        // Role check is now handled in route middleware
        const candidate = await Candidate.findById(req.params.id);

        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found'
            });
        }

        // Delete resume from cloudinary
        if (candidate.resume) {
            const publicId = candidate.resume.split('/').slice(-2).join('/').split('.')[0];
            await deleteFromCloudinary(publicId);
        }

        // Delete additional documents from cloudinary
        for (const jobApplication of candidate.jobsApplied) {
            if (jobApplication.additionalDocuments) {
                for (const doc of jobApplication.additionalDocuments) {
                    const publicId = doc.url.split('/').slice(-2).join('/').split('.')[0];
                    await deleteFromCloudinary(publicId);
                }
            }
        }

        await Candidate.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Candidate deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting candidate',
            error: error.message
        });
    }
};

module.exports = {
    createCandidate,
    applyForJob,
    updateApplicationStatus,
    getAllCandidates,
    getCandidateById,
    updateCandidate,
    deleteCandidate
}; 