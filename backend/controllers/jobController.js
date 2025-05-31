const Job = require('../models/Job');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// Create new job
const createJob = async (req, res) => {
    try {
        const jobData = { ...req.body };

        // Handle attachments upload
        if (req.files && req.files.attachments) {
            const files = Array.isArray(req.files.attachments) 
                ? req.files.attachments 
                : [req.files.attachments];

            const uploadedFiles = await Promise.all(
                files.map(async (file) => {
                    const result = await uploadToCloudinary(
                        file.tempFilePath,
                        'job-attachments'
                    );
                    return {
                        name: file.name,
                        url: result.secure_url
                    };
                })
            );

            jobData.attachments = uploadedFiles;
        }

        // Parse salary range if provided as strings
        if (jobData.salaryOffered) {
            jobData.salaryOffered = {
                min: parseFloat(jobData.salaryOffered.min),
                max: parseFloat(jobData.salaryOffered.max),
                currency: jobData.salaryOffered.currency || 'USD'
            };
        }

        // Parse dates
        if (jobData.dates) {
            jobData.dates = {
                posted: new Date(),
                deadline: new Date(jobData.dates.deadline)
            };
        }

        // Add creator information
        jobData.createdBy = [{
            id: req.user._id,
            role: req.user.role
        }];

        const job = new Job(jobData);
        await job.save();

        res.status(201).json({
            success: true,
            message: 'Job created successfully',
            job
        });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating job',
            error: error.message
        });
    }
};

// Get all jobs with filters
const getAllJobs = async (req, res) => {
    try {
        const {
            status,
            role,
            salaryMin,
            salaryMax,
            deadline,
            sortBy = 'dates.posted',
            sortOrder = -1
        } = req.query;

        // Build query
        const query = {};
        
        if (status) query.status = status;
        if (role) query.role = new RegExp(role, 'i');
        if (salaryMin || salaryMax) {
            query.salaryOffered = {};
            if (salaryMin) query.salaryOffered.min = { $gte: parseFloat(salaryMin) };
            if (salaryMax) query.salaryOffered.max = { $lte: parseFloat(salaryMax) };
        }
        if (deadline) query['dates.deadline'] = { $gte: new Date(deadline) };

        // Execute query with sorting
        const jobs = await Job.find(query)
            .sort({ [sortBy]: parseInt(sortOrder) })
            .populate('createdBy.id', 'username email');

        res.status(200).json({
            success: true,
            count: jobs.length,
            jobs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching jobs',
            error: error.message
        });
    }
};

// Get job by ID
const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('createdBy.id', 'username email');

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        res.status(200).json({
            success: true,
            job
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching job',
            error: error.message
        });
    }
};

// Update job
const updateJob = async (req, res) => {
    try {
        const jobData = { ...req.body };
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Handle attachments upload
        if (req.files && req.files.attachments) {
            // Delete old attachments from cloudinary
            if (job.attachments && job.attachments.length > 0) {
                await Promise.all(
                    job.attachments.map(async (attachment) => {
                        const publicId = attachment.url.split('/').slice(-2).join('/').split('.')[0];
                        await deleteFromCloudinary(publicId);
                    })
                );
            }

            // Upload new attachments
            const files = Array.isArray(req.files.attachments) 
                ? req.files.attachments 
                : [req.files.attachments];

            const uploadedFiles = await Promise.all(
                files.map(async (file) => {
                    const result = await uploadToCloudinary(
                        file.tempFilePath,
                        'job-attachments'
                    );
                    return {
                        name: file.name,
                        url: result.secure_url
                    };
                })
            );

            jobData.attachments = uploadedFiles;
        }

        // Update salary if provided
        if (jobData.salaryOffered) {
            jobData.salaryOffered = {
                min: parseFloat(jobData.salaryOffered.min),
                max: parseFloat(jobData.salaryOffered.max),
                currency: jobData.salaryOffered.currency || job.salaryOffered.currency
            };
        }

        // Update deadline if provided
        if (jobData.dates && jobData.dates.deadline) {
            jobData.dates = {
                ...job.dates,
                deadline: new Date(jobData.dates.deadline)
            };
        }

        // Add to createdBy array if not already present
        const creatorExists = job.createdBy.some(
            creator => creator.id.toString() === req.user._id.toString()
        );
        
        if (!creatorExists) {
            jobData.createdBy = [
                ...job.createdBy,
                {
                    id: req.user._id,
                    role: req.user.role
                }
            ];
        }

        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            { $set: jobData },
            { new: true }
        ).populate('createdBy.id', 'username email');

        res.status(200).json({
            success: true,
            message: 'Job updated successfully',
            job: updatedJob
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating job',
            error: error.message
        });
    }
};

// Delete job
const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Delete attachments from cloudinary
        if (job.attachments && job.attachments.length > 0) {
            await Promise.all(
                job.attachments.map(async (attachment) => {
                    const publicId = attachment.url.split('/').slice(-2).join('/').split('.')[0];
                    await deleteFromCloudinary(publicId);
                })
            );
        }

        await Job.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Job deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting job',
            error: error.message
        });
    }
};

module.exports = {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob
}; 