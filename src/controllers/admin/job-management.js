const { JobManagement } = require('../../models/admin/job-management');

// Add new job
const addJob = async (req, res) => {
    try {
        console.log('=== ADD JOB API CALLED ===');
        console.log('Request Body:', JSON.stringify(req.body, null, 2));
        console.log('Request Headers:', req.headers);
        console.log('User Info:', req.user);
        
        const {
            job_title,
            job_slug,
            job_description,
            company,
            location,
            job_type,
            employment_type,
            job_post_date,
            job_post_time,
            job_expire_date,
            job_expire_time,
            min_salary,
            max_salary,
            currency,
            salary_type,
            apply_link,
            title_and_description_json,
            // SEO fields
            seo_title,
            seo_description,
            seo_keywords,
            // OpenGraph fields
            og_title,
            og_description,
            og_image,
            og_image_width,
            og_image_height,
            og_image_alt,
            og_url,
            og_site_name,
            og_locale,
            og_type
        } = req.body;

        console.log('Extracted Data:');
        console.log('- Job Title:', job_title);
        console.log('- Job Slug:', job_slug);
        console.log('- Company:', company);
        console.log('- Location:', location);
        console.log('- Job Type:', job_type);
        console.log('- Employment Type:', employment_type);
        console.log('- Min Salary:', min_salary);
        console.log('- Max Salary:', max_salary);
        console.log('- Currency:', currency);
        console.log('- Title & Description JSON:', JSON.stringify(title_and_description_json, null, 2));

        // Combine date and time for job_post_date
        let combinedJobPostDate = null;
        if (job_post_date && job_post_time) {
            combinedJobPostDate = new Date(`${job_post_date}T${job_post_time}`);
            console.log('Combined Job Post Date:', combinedJobPostDate);
        } else if (job_post_date) {
            combinedJobPostDate = new Date(job_post_date);
            console.log('Job Post Date (date only):', combinedJobPostDate);
        }

        // Combine date and time for job_expire_date
        let combinedJobExpireDate = null;
        if (job_expire_date && job_expire_time) {
            combinedJobExpireDate = new Date(`${job_expire_date}T${job_expire_time}`);
            console.log('Combined Job Expire Date:', combinedJobExpireDate);
        } else if (job_expire_date) {
            combinedJobExpireDate = new Date(job_expire_date);
            console.log('Job Expire Date (date only):', combinedJobExpireDate);
        }

        // Create new job
        const jobData = {
            job_title,
            slug: job_slug,
            job_description,
            company,
            location,
            job_type,
            employment_type,
            job_post_date: combinedJobPostDate,
            job_post_time: job_post_time || null,
            job_expire_date: combinedJobExpireDate,
            job_expire_time: job_expire_time || null,
            min_salary: min_salary ? parseInt(min_salary) : null,
            max_salary: max_salary ? parseInt(max_salary) : null,
            currency: currency || 'INR',
            salary_type,
            apply_link,
            title_and_description_json: title_and_description_json || [],
            status: 'Draft',
            posted_by: req.user?.id || null, // Assuming user is available in req.user
            // SEO fields
            seo_title,
            seo_description,
            seo_keywords,
            // OpenGraph fields
            og_title,
            og_description,
            og_image,
            og_image_width: og_image_width ? parseInt(og_image_width) : 1200,
            og_image_height: og_image_height ? parseInt(og_image_height) : 630,
            og_image_alt,
            og_url,
            og_site_name,
            og_locale: og_locale || 'en_US',
            og_type: og_type || 'website'
        };

        console.log('Job Data to be saved:', JSON.stringify(jobData, null, 2));
        
        const newJob = new JobManagement(jobData);

        // Save the job
        console.log('Attempting to save job to database...');
        const savedJob = await newJob.save();
        console.log('Job saved successfully:', savedJob._id);

        console.log('Sending success response...');
        res.status(201).json({
            success: true,
            message: 'Job created successfully',
            data: savedJob
        });

    } catch (error) {
        console.error('=== ERROR IN ADD JOB ===');
        console.error('Error creating job:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errors
            });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            // Check which field caused the duplicate error
            const duplicateField = Object.keys(error.keyPattern)[0];
            let message = 'Duplicate entry found';
            
            if (duplicateField === 'slug') {
                message = 'A job with this slug already exists. Please use a different slug.';
            } else if (duplicateField === 'job_title') {
                message = 'A job with this title already exists. Please use a different title.';
            }
            
            return res.status(400).json({
                success: false,
                message: message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all jobs
const getJobs = async (req, res) => {
    try {
        console.log('=== GET JOBS API CALLED ===');
        console.log('Query Parameters:', req.query);
        
        const { 
            page = 1, 
            limit = 10, 
            status, 
            search, 
            job_type, 
            location, 
            employment_type 
        } = req.query;
        
        const skip = (page - 1) * limit;

        // Build filter object
        const filter = { is_deleted: false };
        
        // Status filter
        if (status && status !== 'all') {
            filter.status = status;
            console.log('Filter by status:', status);
        }

        // Job type filter
        if (job_type && job_type !== 'all') {
            filter.job_type = job_type;
            console.log('Filter by job_type:', job_type);
        }

        // Location filter
        if (location && location !== 'all') {
            filter.location = location;
            console.log('Filter by location:', location);
        }

        // Employment type filter
        if (employment_type && employment_type !== 'all') {
            filter.employment_type = employment_type;
            console.log('Filter by employment_type:', employment_type);
        }

        // Search filter
        if (search) {
            filter.$or = [
                { job_title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
                { job_description: { $regex: search, $options: 'i' } }
            ];
            console.log('Filter by search:', search);
        }

        console.log('Final filter object:', JSON.stringify(filter, null, 2));

        console.log('Fetching jobs from database...');
        const jobs = await JobManagement.find(filter)
            .populate('posted_by', 'name email')
            .populate('last_modified_by', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        console.log('Found jobs count:', jobs.length);
        const total = await JobManagement.countDocuments(filter);
        console.log('Total jobs in database:', total);

        res.status(200).json({
            success: true,
            data: jobs,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total: total
            }
        });

    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get job by ID
const getJobById = async (req, res) => {
    try {
        console.log('=== GET JOB BY ID API CALLED ===');
        const { id } = req.params;
        console.log('Job ID:', id);

        console.log('Fetching job from database...');
        const job = await JobManagement.findById(id)
            .populate('posted_by', 'name email')
            .populate('last_modified_by', 'name email');

        if (!job) {
            console.log('Job not found with ID:', id);
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        console.log('Job found:', job._id);

        res.status(200).json({
            success: true,
            data: job
        });

    } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// View job by ID (for detailed view)
const viewJobById = async (req, res) => {
    try {
        console.log('=== VIEW JOB BY ID API CALLED ===');
        const { id } = req.params;
        console.log('Job ID:', id);

        console.log('Fetching job details from database...');
        const job = await JobManagement.findById(id)
            .populate('posted_by', 'name email')
            .populate('last_modified_by', 'name email');

        if (!job) {
            console.log('Job not found with ID:', id);
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Increment view count
        await JobManagement.findByIdAndUpdate(id, { $inc: { views: 1 } });

        console.log('Job details found:', job._id);
        console.log('Job data:', JSON.stringify(job, null, 2));

        res.status(200).json({
            success: true,
            data: job
        });

    } catch (error) {
        console.error('Error fetching job details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update job
const updateJob = async (req, res) => {
    try {
        console.log('=== UPDATE JOB API CALLED ===');
        const { id } = req.params;
        const updateData = req.body;
        console.log('Job ID:', id);
        console.log('Update Data:', JSON.stringify(updateData, null, 2));

        // Handle date and time combination if provided
        if (updateData.job_post_date && updateData.job_post_time) {
            updateData.job_post_date = new Date(`${updateData.job_post_date}T${updateData.job_post_time}`);
        }

        if (updateData.job_expire_date && updateData.job_expire_time) {
            updateData.job_expire_date = new Date(`${updateData.job_expire_date}T${updateData.job_expire_time}`);
        }

        // Convert salary to numbers if provided
        if (updateData.min_salary) {
            updateData.min_salary = parseInt(updateData.min_salary);
        }
        if (updateData.max_salary) {
            updateData.max_salary = parseInt(updateData.max_salary);
        }

        updateData.last_modified_by = req.user?.id || null;
        console.log('Final update data:', JSON.stringify(updateData, null, 2));

        console.log('Updating job in database...');
        const job = await JobManagement.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('posted_by', 'name email')
         .populate('last_modified_by', 'name email');

        if (!job) {
            console.log('Job not found for update with ID:', id);
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        console.log('Job updated successfully:', job._id);
        res.status(200).json({
            success: true,
            message: 'Job updated successfully',
            data: job
        });

    } catch (error) {
        console.error('Error updating job:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete job (soft delete)
const deleteJob = async (req, res) => {
    try {
        console.log('=== DELETE JOB API CALLED ===');
        const { id } = req.params;
        console.log('Job ID to delete:', id);

        console.log('Soft deleting job...');
        const job = await JobManagement.findByIdAndUpdate(
            id,
            { 
                is_deleted: true,
                last_modified_by: req.user?.id || null
            },
            { new: true }
        );

        if (!job) {
            console.log('Job not found for deletion with ID:', id);
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        console.log('Job soft deleted successfully:', job._id);
        res.status(200).json({
            success: true,
            message: 'Job deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    addJob,
    getJobs,
    getJobById,
    viewJobById,
    updateJob,
    deleteJob
};
