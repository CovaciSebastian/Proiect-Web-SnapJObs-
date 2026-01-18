const prisma = require('../prismaClient');

const applyToJob = async (req, res) => {
    try {
        // req.user is populated by Passport's session middleware
        if (req.user.role !== 'STUDENT') {
            return res.status(403).json({ success: false, message: 'Only students can apply to jobs.' });
        }

        const { jobId } = req.body;
        const studentId = req.user.id; // This is now a CUID string

        if (!jobId) {
            return res.status(400).json({ success: false, message: 'Job ID is required.' });
        }

        const job = await prisma.job.findUnique({ where: { id: parseInt(jobId) } });
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        const existingApplication = await prisma.application.findUnique({
            where: {
                job_id_student_id: {
                    job_id: parseInt(jobId),
                    student_id: studentId // studentId is a string
                }
            }
        });

        if (existingApplication) {
            return res.status(400).json({ success: false, message: 'Already applied to this job' });
        }

        await prisma.application.create({
            data: {
                job_id: parseInt(jobId),
                student_id: studentId
            }
        });

        res.status(201).json({ success: true, message: 'Application successful' });
    } catch (error) {
        console.error('Apply to job error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getMyApplications = async (req, res) => {
    try {
        const applications = await prisma.application.findMany({
            where: { student_id: req.user.id }, // req.user.id is correctly a string
            include: { 
                job: {
                    select: {
                        id: true,
                        title: true,
                        company: true,
                        location: true,
                        salary: true,
                        image_url: true
                    }
                }
            }
        });

        res.json(applications);
    } catch (error) {
        console.error('Get my applications error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const withdrawApplication = async (req, res) => {
    try {
        const jobId = parseInt(req.params.jobId);
        const studentId = req.user.id; // string

        await prisma.application.delete({
            where: {
                job_id_student_id: {
                    job_id: jobId,
                    student_id: studentId
                }
            }
        });

        res.json({ success: true, message: 'Application withdrawn' });
    } catch (error) {
        console.error('Withdraw application error:', error);
        res.status(500).json({ success: false, message: 'Server error or Application not found' });
    }
};

const getApplicantsByJob = async (req, res) => {
    try {
        const jobId = parseInt(req.params.jobId);

        // Verify job ownership
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }
        
        console.log(`Checking ownership for job ${jobId}:`);
        console.log(`Job Employer ID: ${job.employer_id} (Type: ${typeof job.employer_id})`);
        console.log(`Request User ID: ${req.user.id} (Type: ${typeof req.user.id})`);

        if (Number(job.employer_id) !== Number(req.user.id)) {
            return res.status(403).json({ success: false, message: 'Not authorized: You do not own this job' });
        }

        const applications = await prisma.application.findMany({
            where: { job_id: jobId },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        university: true,
                        about: true
                    }
                }
            }
        });

        res.json(applications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'accepted', 'rejected'

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const application = await prisma.application.findUnique({
            where: { id: parseInt(id) },
            include: { job: true }
        });

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // Check ownership
        if (Number(application.job.employer_id) !== Number(req.user.id)) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updated = await prisma.application.update({
            where: { id: parseInt(id) },
            data: { status }
        });

        res.json({ success: true, application: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { applyToJob, getMyApplications, withdrawApplication, getApplicantsByJob, updateApplicationStatus };
