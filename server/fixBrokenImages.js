const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); 
const prisma = require('./prismaClient');

const fixBrokenImages = async () => {
    try {
        // Safe, working image for Events
        const safeImage = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'; 

        // Find jobs with potentially broken images based on user feedback (Promoter, Hostess)
        const brokenJobs = await prisma.job.findMany({
            where: {
                OR: [
                    { title: { contains: 'Promoter', mode: 'insensitive' } },
                    { title: { contains: 'Hostess', mode: 'insensitive' } }
                ]
            }
        });

        console.log(`Found ${brokenJobs.length} jobs to fix.`);

        for (const job of brokenJobs) {
            await prisma.job.update({
                where: { id: job.id },
                data: { image_url: safeImage }
            });
            console.log(`Fixed job ${job.id} (${job.title}) -> ${safeImage}`);
        }

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
};

fixBrokenImages();