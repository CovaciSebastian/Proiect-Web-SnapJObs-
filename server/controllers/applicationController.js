const prisma = require('../prismaClient');

const applyToJob = async (req, res) => {
    try {
        const { jobId } = req.body;
        const studentId = req.user.id; // from authMiddleware

        // Check if job exists
        const job = await prisma.job.findUnique({ where: { id: parseInt(jobId) } });
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Check if already applied
        const existingApplication = await prisma.application.findUnique({
            where: {
                job_id_student_id: {
                    job_id: parseInt(jobId),
                    student_id: studentId
                }
            }
        });

        if (existingApplication) {
            return res.status(400).json({ success: false, message: 'Already applied to this job' });
        }

        // Create application
        await prisma.application.create({
            data: {
                job_id: parseInt(jobId),
                student_id: studentId
            }
        });

        res.status(201).json({ success: true, message: 'Application successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getMyApplications = async (req, res) => {
    try {
        const applications = await prisma.application.findMany({
            where: { student_id: req.user.id },
            include: { job: true }
        });

        res.json(applications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { applyToJob, getMyApplications };
