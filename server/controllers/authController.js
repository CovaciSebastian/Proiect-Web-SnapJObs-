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
        req.login(user, { session: false }, (err) => {
            if (err) return next(err);

            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            return res.json({
                success: true,
                token,
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
    if (userRole === 'EMPLOYER') {
        res.redirect('/pages/employer/dashboard.html');
    } else {
        res.redirect('/pages/student/dashboard.html');
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
            },
        });
    } else {
        res.json({ isAuthenticated: false, user: null });
    }
};


module.exports = { register, login, googleCallback, logout, status };
