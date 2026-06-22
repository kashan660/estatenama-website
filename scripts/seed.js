/**
 * Seed script — loads the current static homepage content into the database
 * so the now-dynamic site matches what visitors see today.
 * Idempotent-ish: upserts the hero section and projects by slug.
 * Usage: node scripts/seed.js   (requires POSTGRES_URL)
 */
const path = require('path');
const db = require(path.join(__dirname, '..', 'lib', 'db'));

const HERO_IMAGES = [
    'images/homepage/home1.png',
    'images/homepage/home2.png',
    'images/homepage/home3.png',
    'images/homepage/home4.png',
    'images/homepage/home5.png',
    'images/homepage/home6.png'
];

const PROJECTS = [
    {
        title: 'Faisal Town Phase 2',
        slug: 'faisal-town-phase-2',
        category: 'Faisal Town',
        badge: 'New Launch',
        location: 'Near Thalian Interchange, M-2 Motorway',
        type: 'mixed',
        featuredImage: 'images/homepage/home3.png',
        subtitle: 'Premium housing project with 30,000 Kanals area',
        description: 'Premium housing project with 30,000 Kanals area, featuring residential and commercial opportunities.',
        features: ['🏗️ Under Development', '🛣️ 270ft Main Boulevard', '✈️ Near Airport (2 min)', '🌿 Green Belts'],
        plots: [
            { label: '5 Marla - PKR 34.75 Lac', type: 'Residential' },
            { label: '8 Marla - PKR 46.45 Lac', type: 'Residential' },
            { label: '10 Marla - PKR 60.45 Lac', type: 'Residential' },
            { label: '14 Marla - PKR 75.65 Lac', type: 'Residential' },
            { label: '1 Kanal - PKR 1.01 Crore', type: 'Residential' },
            { label: '2 Kanal - PKR 2.02 Crore', type: 'Residential' },
            { label: 'Main Boulevard (50x60) - PKR 85 Lac', type: 'Commercial' },
            { label: 'Commercial Markaz (50x60) - PKR 75 Lac', type: 'Commercial' },
            { label: 'Type C Commercial (50x40) - PKR 65 Lac', type: 'Commercial' }
        ],
        paymentPlan: '48 Months (4 Years) | 20% Down Payment | Flexible Installments | No Hidden Charges'
    },
    {
        title: 'Eighteen Islamabad',
        slug: 'eighteen-luxury',
        category: 'Eighteen | The Luxury Society',
        badge: 'Luxury',
        location: 'Islamabad, Pakistan',
        type: 'mixed',
        featuredImage: 'images/homepage/home5.png',
        subtitle: 'Ultra-luxury society with an 18-hole championship golf course',
        description: 'Ultra-luxury residential and commercial project featuring an 18-hole championship golf course, premium villas, and world-class amenities by Ora Developers.',
        features: ['🏌️ 18-Hole Golf Course', '🏥 Medical Center', '🏨 Luxury Hotel', '🏛️ Clubhouse', '✅ CDA Approved', '🌟 International Standards'],
        plots: [
            { label: 'Luxury Villas - Premium Pricing', type: 'Residential' },
            { label: 'Golf Course Apartments - Exclusive', type: 'Residential' },
            { label: 'Penthouse Suites - Ultra Luxury', type: 'Residential' },
            { label: 'Residential Plots - Prime Location', type: 'Residential' },
            { label: 'Retail Spaces - High-end Shopping', type: 'Commercial' },
            { label: 'Business Center - Corporate Hub', type: 'Commercial' },
            { label: 'Hotel & Resort - 5-Star Hospitality', type: 'Commercial' }
        ],
        paymentPlan: 'Flexible Options | Contact for exclusive pricing and payment plans'
    },
    {
        title: 'Bahria Town Phase 8',
        slug: 'bahria-town-phase-8',
        category: 'Premium Projects',
        badge: 'Premium',
        location: 'Rawalpindi',
        type: 'mixed',
        featuredImage: 'images/homepage/home6.png',
        subtitle: "Prestigious development in Pakistan's most trusted housing society",
        description: 'Prestigious development with luxury amenities and excellent investment potential in Pakistan\'s most trusted housing society.',
        features: ['✅ Bahria Standards', '🏥 Hospitals', '🏫 Schools', '🛍️ Shopping Malls', '🌳 Parks'],
        plots: [],
        paymentPlan: 'Flexible installment plans available | Contact for current pricing'
    },
    {
        title: 'Ruden Enclave',
        slug: 'ruden-enclave',
        category: 'Premium Projects',
        badge: 'Investment',
        location: 'Rawalpindi, near Islamabad',
        type: 'plots',
        featuredImage: 'images/homepage/home2.png',
        subtitle: 'Affordable RDA-approved society with strong growth potential',
        description: 'RDA approved housing society offering affordable residential and commercial plots with flexible installment plans and strong investment potential.',
        features: ['✅ RDA Approved', '🛣️ Near Ring Road', '🌿 Green Belts', '💧 Water Filtration', '🔒 Gated Community'],
        plots: [],
        paymentPlan: 'Easy installment plans | Contact for current pricing'
    }
];

async function upsertProject(p, sortOrder) {
    const existing = await db.getProjectBySlug(p.slug);
    const data = Object.assign({ status: 'active', sortOrder }, p);
    if (existing && existing.id) {
        await db.updateProject(existing.id, data);
        console.log('  updated project:', p.slug);
    } else {
        await db.createProject(data);
        console.log('  created project:', p.slug);
    }
}

async function upsertHero() {
    const sections = await db.getSections();
    const hero = sections.find(s => s.type === 'hero');
    const data = { type: 'hero', title: 'Homepage Hero', images: HERO_IMAGES, status: 'published', sortOrder: 0 };
    if (hero && hero.id) {
        await db.updateSection(hero.id, data);
        console.log('  updated hero section');
    } else {
        await db.createSection(data);
        console.log('  created hero section');
    }
}

async function main() {
    console.log('Seeding hero...');
    await upsertHero();
    console.log('Seeding projects...');
    for (let i = 0; i < PROJECTS.length; i++) {
        await upsertProject(PROJECTS[i], i);
    }
    console.log('\n✅ Seed complete.');
    process.exit(0);
}

main().catch(err => {
    console.error('\n❌ Seed failed:', err.message);
    process.exit(1);
});
