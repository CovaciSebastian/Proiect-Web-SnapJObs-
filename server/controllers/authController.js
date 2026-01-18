const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const register = async (req, res) => {
    try {
        const { name, email, password, accessCode } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        let assignedRole = 'STUDENT';
        const EMPLOYER_SECRET_CODE = 'SNAP-2025';

        if (accessCode) {
            if (accessCode === EMPLOYER_SECRET_CODE) {
                assignedRole = 'EMPLOYER';
            } else {
                return res.status(400).json({ success: false, message: 'Cod de angajator incorect.' });
            }
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: assignedRole,
                provider: 'email',
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
        if (!user || !user.password) { // Check if user exists and has a password
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Use req.login provided by Passport to establish a session
        req.login(user, (err) => {
            if (err) return next(err);

            return res.json({
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const googleCallback = (req, res) => {
    // Passport authentication is successful, user is attached to req.user
    // Now, redirect based on role.
    const userRole = req.user.role;

    // TODO: Use env var for frontend URL
    const FRONTEND_URL = 'http://localhost:8080'; 

    if (userRole === 'PENDING') {
        return res.redirect(`${FRONTEND_URL}/pages/select-role.html`);
    }

    if (userRole === 'EMPLOYER') {
        res.redirect(`${FRONTEND_URL}/pages/employer/dashboard.html`);
    } else {
        // Redirect students to Homepage (Acasă)
        res.redirect(`${FRONTEND_URL}/index.html`);
    }
};

const logout = (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Could not log out, please try again.' });
            }
            res.clearCookie('connect.sid'); // clear the session cookie
            res.status(200).json({ message: 'Logout successful' });
        });
    });
};

const status = (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            isAuthenticated: true,
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                phone: req.user.phone,
                city: req.user.city,
                university: req.user.university,
                about: req.user.about,
                title: req.user.title
            },
        });
    } else {
        res.json({ isAuthenticated: false, user: null });
    }
};


const setRole = async (req, res) => {
    try {
        const { role, accessCode } = req.body;
        
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        if (!['STUDENT', 'EMPLOYER'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        if (role === 'EMPLOYER') {
            const EMPLOYER_SECRET_CODE = 'SNAP-2025';
            if (accessCode !== EMPLOYER_SECRET_CODE) {
                return res.status(400).json({ success: false, message: 'Cod de angajator incorect.' });
            }
        }

        await prisma.user.update({
            where: { id: req.user.id },
            data: { role }
        });

        // Update the session user
        req.user.role = role;
        req.session.save(); // Ensure session is updated

        res.json({ success: true, message: 'Role updated successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, phone, city, university, about, title } = req.body;
        
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: { 
                name, 
                phone, 
                city, 
                university, 
                about, 
                title 
            }
        });

        // Update session
        // Note: Passport session user is deserialized from DB on every request usually, 
        // but if we want immediate reflection without refresh in some setups, we update req.user.
        // However, deserializeUser usually fetches fresh data.
        
        res.json({ success: true, message: 'Profile updated', user: updatedUser });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { register, login, googleCallback, logout, status, setRole, updateProfile };
