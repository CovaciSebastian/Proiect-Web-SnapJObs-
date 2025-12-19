const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const images = {
    'eveniment': 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80',
    'fizic': 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    'online': 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80'
};

async function main() {
    console.log('Updating job images to Unsplash URLs...');
    
    const jobs = await prisma.job.findMany();
    
    for (const job of jobs) {
        const newImageUrl = images[job.type] || images['eveniment'];
        
        await prisma.job.update({
            where: { id: job.id },
            data: { image_url: newImageUrl }
        });
        
        console.log(`Updated job ${job.id} (${job.type})`);
    }
    
    console.log('All job images updated.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
