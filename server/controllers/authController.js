const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const register = async (req, res) => {
    try {
        const { name, email, password, accessCode, phone, city, university, title, about } = req.body;

        // Basic validation
        if (!email || !password || !name) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Role determination logic
        let assignedRole = 'student';
        const EMPLOYER_SECRET_CODE = 'SNAP-2025';

        if (accessCode) {
            if (accessCode === EMPLOYER_SECRET_CODE) {
                assignedRole = 'employer';
            } else {
                return res.status(400).json({ success: false, message: 'Cod de angajator incorect.' });
            }
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password_hash: hashedPassword,
                role: assignedRole,
                phone,
                city,
                university,
                title,
                about
            }
        });

        res.status(201).json({ success: true, message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { register, login };
