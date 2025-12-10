const prisma = require('../prismaClient');

const getJobs = async (req, res) => {
    try {
        const { type } = req.query;
        
        const where = {};
        if (type && type !== 'all') {
            where.type = type;
        }

        const jobs = await prisma.job.findMany({
            where,
            orderBy: { created_at: 'desc' }
        });

        res.json(jobs);
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
                image_url,
                date
            }
        });

        res.status(201).json({ success: true, data: job });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getJobs, getJobById, createJob };
