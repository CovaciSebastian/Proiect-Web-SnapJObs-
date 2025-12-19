const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); 

const prisma = require('./prismaClient');

// STATIC, RELIABLE IMAGES LIST
const images = {
    eveniment: [
        'https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&w=800&q=80', // Concert
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80', // Party crowd
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=800&q=80', // Club
        'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800&q=80', // Festival
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80'  // Event party
    ],
    fizic: [
        'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80', // Construction worker
        'https://images.unsplash.com/photo-1535732759880-bbd5c7265e3f?auto=format&fit=crop&w=800&q=80', // Moving boxes
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80', // Warehouse
        'https://images.unsplash.com/photo-1581094794329-cd56b50d7118?auto=format&fit=crop&w=800&q=80', // Factory
        'https://images.unsplash.com/photo-1595814433015-e6f5ce69614e?auto=format&fit=crop&w=800&q=80'  // Painter
    ],
    online: [
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80', // Laptop coding
        'https://images.unsplash.com/photo-1593642532400-2682810df593?auto=format&fit=crop&w=800&q=80', // Office setup
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80', // Home office
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', // Team online
        'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=800&q=80'  // Laptop glasses
    ]
};

const updateJobImages = async () => {
    try {
        if (!process.env.DATABASE_URL) {
            console.error("Error: DATABASE_URL is not defined.");
            return;
        }

        const jobs = await prisma.job.findMany();
        console.log(`Found ${jobs.length} jobs to update.`);

        for (const job of jobs) {
            let pool = images.online; // Default
            if (job.type === 'eveniment') pool = images.eveniment;
            if (job.type === 'fizic') pool = images.fizic;

            // Pick a random image from the THEMATIC pool
            const randomIndex = Math.floor(Math.random() * pool.length);
            const newImageUrl = pool[randomIndex];

            await prisma.job.update({
                where: { id: job.id },
                data: { image_url: newImageUrl }
            });
            console.log(`Updated job ${job.id} (${job.type}) -> ${newImageUrl.substring(0, 40)}...`);
        }

        console.log('All jobs updated with THEMATIC Unsplash URLs.');
    } catch (error) {
        console.error('Error updating jobs:', error);
    } finally {
        await prisma.$disconnect();
    }
};

updateJobImages();
