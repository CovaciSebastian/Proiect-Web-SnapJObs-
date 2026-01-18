const thematicImages = [
    {
        keywords: ['muzic', 'festival', 'concert', 'scen', 'spectacol'],
        url: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=800'
    },
    {
        keywords: ['date', 'laptop', 'online', 'remote', 'moderator', 'it', 'calculator', 'software', 'tehnologie'],
        url: 'https://images.unsplash.com/photo-1499951360447-879944800'
    },
    {
        keywords: ['mutări', 'mobilă', 'depozit', 'marfă', 'manipulant', 'logistics', 'curier', 'livrare', 'pachet'],
        url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800'
    },
    {
        keywords: ['hostess', 'corporate', 'hotel', 'receptie', 'eveniment', 'protocol', 'conferinta'],
        url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800'
    },
    {
        keywords: ['foto', 'video', 'nuntă', 'eveniment', 'cameră', 'fotograf', 'filmare'],
        url: 'https://images.unsplash.com/photo-1516035069341-3491d889c6f7?q=80&w=800'
    },
    {
        keywords: ['carte', 'târg', 'stand', 'bibliotecă', 'librărie', 'book', 'lectura'],
        url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800'
    },
    {
        keywords: ['maraton', 'sport', 'alergar', 'hidratare', 'fitness', 'antrenor', 'atlet'],
        url: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=800'
    },
    {
        keywords: ['sampling', 'promo', 'mall', 'vânzări', 'comercial', 'magazin', 'promovare'],
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800'
    },
    {
        keywords: ['chelner', 'ospatar', 'barman', 'restaurant', 'cafenea', 'bucatar', 'catering', 'servire'],
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800'
    },
    {
        keywords: ['curatenie', 'menaj', 'housekeeping', 'igienizare'],
        url: 'https://images.unsplash.com/photo-1581578731522-a0044583216a?q=80&w=800'
    }
];

const defaultImages = {
    'online': 'https://images.unsplash.com/photo-1486312338219-ce6d44800',
    'fizic': 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=800',
    'eveniment': 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=800',
    'generic': 'https://images.unsplash.com/photo-1487528278747-ba99ed528ebc?q=80&w=800'
};

function getThematicImage(title, description, type) {
    const searchString = `${title} ${description}`.toLowerCase();

    for (const theme of thematicImages) {
        const match = theme.keywords.some(keyword => {
            const regex = new RegExp(`\b${keyword}\b`, 'i');
            return regex.test(searchString);
        });
        if (match) {
            return theme.url;
        }
    }

    // Fallback to type
    return defaultImages[type] || defaultImages['generic'];
}

module.exports = { getThematicImage };
