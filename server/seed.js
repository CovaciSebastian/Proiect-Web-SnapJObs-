const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    // 1. Create default employer
    const hashedPassword = await bcrypt.hash('employer123', 10);
    const employer = await prisma.user.upsert({
        where: { email: 'employer@snapjobs.com' },
        update: {},
        create: {
            email: 'employer@snapjobs.com',
            name: 'SnapJobs Official Employer',
            password_hash: hashedPassword,
            role: 'employer',
            title: 'Recruiting Team',
            about: 'The official recruiting account for initial job listings.'
        }
    });

    console.log('Employer created:', employer.id);

    // 2. Read jobs.json
    const jobsPath = path.join(__dirname, '../data/jobs.json');
    const jobsData = JSON.parse(fs.readFileSync(jobsPath, 'utf-8'));

    // 3. Insert jobs
    for (const job of jobsData) {
        await prisma.job.create({
            data: {
                employer_id: employer.id,
                title: job.title,
                company: job.company,
                type: job.type,
                salary: job.salary,
                location: job.location,
                lat: job.lat,
                lng: job.lng,
                date: job.date,
                description: job.description,
                image_url: job.image
            }
        });
    }

    console.log(`Seeded ${jobsData.length} jobs.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
