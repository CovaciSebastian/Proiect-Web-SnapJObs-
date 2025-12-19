const prisma = require('../prismaClient');
const { getThematicImage } = require('../utils/imageHelper');

const getJobs = async (req, res) => {
    try {
        const { type } = req.query;
        
        const where = {};
        if (type && type !== 'all') {
            where.type = type;
        }

        const jobs = await prisma.job.findMany({
            where,
            include: {
                _count: {
                    select: { applications: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        // Map to include a more friendly field name
        const jobsWithCount = jobs.map(job => ({
            ...job,
            applicantsCount: job._count.applications
        }));

        res.json(jobsWithCount);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getJobById = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await prisma.job.findUnique({
            where: { id: parseInt(id) },
            include: { employer: { select: { name: true, email: true } } }
        });

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        res.json(job);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const createJob = async (req, res) => {
    try {
        // Protected route, req.user exists
        if (req.user.role !== 'employer') {
            return res.status(403).json({ success: false, message: 'Only employers can post jobs' });
        }

        const { title, company, type, salary, location, lat, lng, description, image_url, date } = req.body;

        const finalImageUrl = image_url || getThematicImage(title, description, type);

        const job = await prisma.job.create({
            data: {
                employer_id: req.user.id,
                title,
                company,
                type,
                salary,
                location,
                lat,
                lng,
                description,
                image_url: finalImageUrl,
                date
            }
        });

        res.status(201).json({ success: true, data: job });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, company, type, salary, location, lat, lng, description, image_url, date } = req.body;

        // 1. Check if job exists
        const job = await prisma.job.findUnique({ where: { id: parseInt(id) } });
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // 2. Check ownership
        if (job.employer_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to edit this job' });
        }

        // 3. Update
        const updatedJob = await prisma.job.update({
            where: { id: parseInt(id) },
            data: {
                title,
                company,
                type,
                salary,
                location,
                lat,
                lng,
                description,
                image_url: image_url || job.image_url,
                date
            }
        });

        res.json({ success: true, data: updatedJob });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Check if job exists
        const job = await prisma.job.findUnique({ where: { id: parseInt(id) } });
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // 2. Check ownership
        if (job.employer_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
        }

        // 3. Delete job (Prisma's CASCADE will delete applications)
        await prisma.job.delete({
            where: { id: parseInt(id) }
        });

        res.json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getJobs, getJobById, createJob, updateJob, deleteJob };
