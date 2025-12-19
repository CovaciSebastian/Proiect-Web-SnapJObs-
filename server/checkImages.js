const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); 
const prisma = require('./prismaClient');

const checkImages = async () => {
    try {
        const jobs = await prisma.job.findMany();
        console.log("--- JOB IMAGES REPORT ---");
        jobs.forEach(job => {
            console.log(`ID: ${job.id} | Type: ${job.type} | Image: ${job.image_url}`);
        });
        console.log("-------------------------");
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
};

checkImages();