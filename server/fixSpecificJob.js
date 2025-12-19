const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); 
const prisma = require('./prismaClient');

const fixJob = async () => {
    try {
        // Fix ID 3
        const newImage = 'https://images.unsplash.com/photo-1535732759880-bbd5c7265e3f?auto=format&fit=crop&w=800&q=80'; // Moving boxes image
        await prisma.job.update({
            where: { id: 3 },
            data: { image_url: newImage }
        });
        console.log("Updated Job 3 with new image.");

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
};

fixJob();