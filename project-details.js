// Project Details Data
const projectsData = {
    'faisal-town-phase-1': {
        title: 'Faisal Town Phase 1 (F-18)',
        location: 'Rawalpindi-Kohat Road, Near M-1 Motorway',
        status: 'RDA Approved',
        developer: 'Faisal Town (Pvt) Ltd',
        totalArea: '15,000 Kanals',
        description: 'Faisal Town Phase 1 is a fully developed premium housing society with world-class amenities and excellent connectivity. Located strategically on Rawalpindi-Kohat Road near M-1 Motorway, it offers a perfect blend of modern living and convenience.',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        features: [
            'NOC Approved by RDA',
            '4 Developed Blocks (A, B, B1, C)',
            'Commercial Areas Available',
            'Direct GT Road Access',
            'Developed Infrastructure',
            '24/7 Security',
            'Mosque & Community Center',
            'Parks & Green Areas'
        ],
        plotSizes: {
            residential: [
                { size: '5 Marla', price: 'PKR 25-30 Lac', dimensions: '25x45 ft' },
                { size: '8 Marla', price: 'PKR 40-50 Lac', dimensions: '30x60 ft' },
                { size: '10 Marla', price: 'PKR 55-70 Lac', dimensions: '35x70 ft' },
                { size: '1 Kanal', price: 'PKR 1.2-1.5 Crore', dimensions: '50x90 ft' }
            ],
            commercial: [
                { size: 'Shop (Marla)', price: 'PKR 60-80 Lac', dimensions: '20x40 ft' },
                { size: 'Plaza Plot', price: 'PKR 1.5-2 Crore', dimensions: '40x80 ft' }
            ]
        },
        paymentPlan: {
            duration: '54 Months (4.5 Years)',
            downPayment: '20%',
            installments: 'Quarterly',
            discount: '20% Lump Sum Discount Available'
        },
        amenities: [
            'Gated Community',
            'Wide Roads (60-120 ft)',
            'Underground Electricity',
            'Water Supply System',
            'Sewerage System',
            'Street Lights',
            'Boundary Wall',
            'Main Gate with Security'
        ],
        connectivity: [
            'GT Road - 2 minutes',
            'M-1 Motorway - 5 minutes',
            'Islamabad Airport - 45 minutes',
            'Rawalpindi City - 20 minutes',
            'Peshawar - 2 hours via Motorway'
        ]
    },
    'faisal-town-phase-2': {
        title: 'Faisal Town Phase 2',
        location: 'Near Thalian Interchange, M-2 Motorway',
        status: 'New Launch',
        developer: 'Zedem International',
        totalArea: '30,000 Kanals',
        description: 'Faisal Town Phase 2 is a premium housing project featuring residential and commercial opportunities with modern infrastructure and excellent connectivity to major highways.',
        image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        features: [
            'Under Development',
            '270ft Main Boulevard',
            'Near Airport (2 minutes)',
            'Green Belt Areas',
            'Modern Infrastructure',
            'Commercial Markaz',
            'Educational Facilities',
            'Healthcare Center'
        ],
        plotSizes: {
            residential: [
                { size: '5 Marla', price: 'PKR 34.75 Lac', dimensions: '25x45 ft' },
                { size: '8 Marla', price: 'PKR 46.45 Lac', dimensions: '30x60 ft' },
                { size: '10 Marla', price: 'PKR 60.45 Lac', dimensions: '35x70 ft' },
                { size: '14 Marla', price: 'PKR 75.65 Lac', dimensions: '35x90 ft' },
                { size: '1 Kanal', price: 'PKR 1.01 Crore', dimensions: '50x90 ft' },
                { size: '2 Kanal', price: 'PKR 2.02 Crore', dimensions: '100x90 ft' }
            ],
            commercial: [
                { size: 'Main Boulevard (50x60)', price: 'PKR 85 Lac', dimensions: '50x60 ft' },
                { size: 'Commercial Markaz (50x60)', price: 'PKR 75 Lac', dimensions: '50x60 ft' },
                { size: 'Type C Commercial (50x40)', price: 'PKR 65 Lac', dimensions: '50x40 ft' }
            ]
        },
        paymentPlan: {
            duration: '48 Months (4 Years)',
            downPayment: '20%',
            installments: 'Flexible Monthly/Quarterly',
            discount: 'No Hidden Charges'
        },
        amenities: [
            'Wide Roads & Boulevards',
            'Underground Utilities',
            'Central Park',
            'Shopping Complex',
            'Educational Institute',
            'Hospital',
            'Mosque',
            'Community Center'
        ],
        connectivity: [
            'New Islamabad Airport - 2 minutes',
            'M-2 Motorway - Direct Access',
            'Thalian Interchange - Adjacent',
            'Islamabad - 30 minutes',
            'Lahore - 2.5 hours via Motorway'
        ]
    },
    'eighteen-luxury': {
        title: 'Eighteen Islamabad',
        location: 'Islamabad, Pakistan',
        status: 'Luxury',
        developer: 'Ora Developers, Saif Group, Kohistan Builders & Developers',
        totalArea: 'Premium Development',
        description: 'Eighteen Islamabad is an ultra-luxury residential and commercial project featuring an 18-hole championship golf course, premium villas, and world-class amenities. Developed by renowned international and local developers, it sets new standards for luxury living in Pakistan.',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        features: [
            '18-Hole Championship Golf Course',
            'Luxury Villas',
            'Golf Course Apartments',
            'International Standards',
            'CDA Approved',
            'Premium Location',
            'World-Class Architecture',
            'Exclusive Community'
        ],
        plotSizes: {
            residential: [
                { size: 'Luxury Villas', price: 'Premium Pricing', dimensions: 'Various Sizes' },
                { size: 'Golf Course Apartments', price: 'Exclusive Rates', dimensions: 'Multiple Options' },
                { size: 'Penthouse Suites', price: 'Ultra Luxury', dimensions: 'Premium Sizes' },
                { size: 'Residential Plots', price: 'Prime Location Pricing', dimensions: 'Custom Sizes' }
            ],
            commercial: [
                { size: 'Retail Spaces', price: 'High-end Shopping', dimensions: 'Various' },
                { size: 'Business Center', price: 'Corporate Hub', dimensions: 'Multiple Options' }
            ],
            hospitality: [
                { size: 'Hotel & Resort', price: '5-Star Hospitality', dimensions: 'Luxury Accommodation' },
                { size: 'Clubhouse', price: 'Exclusive Membership', dimensions: 'Premium Facilities' }
            ]
        },
        paymentPlan: {
            duration: 'Flexible Options',
            downPayment: 'Contact for Details',
            installments: 'Customized Plans',
            discount: 'Premium Investment Opportunity'
        },
        amenities: [
            '18-Hole Golf Course',
            'Luxury Hotel',
            'Medical Center',
            'Clubhouse',
            'Retail Spaces',
            'Business Center',
            'Premium Villas',
            'Golf Course Apartments'
        ],
        connectivity: [
            'Islamabad City Center - Easy Access',
            'Major Highways - Connected',
            'Airport - Convenient Location',
            'Business Districts - Prime Access',
            'Educational Institutions - Nearby'
        ]
    },
    'kingdom-valley': {
        title: 'Kingdom Valley',
        location: 'Near M-2 Motorway, Chakri Road Rawalpindi',
        status: 'New Launch',
        developer: 'Kingdom Group',
        totalArea: '25,000 Kanals',
        description: 'Kingdom Valley is a modern housing society with innovative design and comprehensive facilities, offering a royal lifestyle with excellent connectivity to major highways.',
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        features: [
            'Kingdom Villas',
            'Green Spaces',
            'Motorway Access',
            'Healthcare Facilities',
            'Educational Institute',
            'Commercial Areas',
            'Theme Park',
            'Golf Course'
        ],
        plotSizes: {
            residential: [
                { size: '3.5 Marla', price: 'PKR 15-18 Lac', dimensions: '20x40 ft' },
                { size: '5 Marla', price: 'PKR 22-28 Lac', dimensions: '25x45 ft' },
                { size: '7 Marla', price: 'PKR 30-38 Lac', dimensions: '28x55 ft' },
                { size: '10 Marla', price: 'PKR 45-55 Lac', dimensions: '35x70 ft' },
                { size: '1 Kanal', price: 'PKR 85-1.1 Crore', dimensions: '50x90 ft' }
            ],
            villas: [
                { size: 'Villa Plots (1 Kanal)', price: 'PKR 1.2 Crore', dimensions: '50x90 ft' },
                { size: 'Premium Villas (2 Kanal)', price: 'PKR 2.5 Crore', dimensions: '100x90 ft' }
            ],
            commercial: [
                { size: '4 Marla Commercial', price: 'PKR 30 Lac', dimensions: '20x45 ft' },
                { size: '8 Marla Commercial', price: 'PKR 55 Lac', dimensions: '30x60 ft' }
            ]
        },
        paymentPlan: {
            duration: '60 Months (5 Years)',
            downPayment: '15%',
            installments: 'Quarterly',
            discount: 'Flexible Terms Available'
        },
        amenities: [
            'Central Theme Park',
            'Golf Course',
            'Hospital',
            'Educational Facilities',
            'Shopping Mall',
            'Mosque',
            'Community Center',
            'Sports Complex'
        ],
        connectivity: [
            'M-2 Motorway - 5 minutes',
            'Chakri Road - Direct Access',
            'New Islamabad Airport - 20 minutes',
            'Rawalpindi - 30 minutes',
            'Lahore - 2 hours via Motorway'
        ]
    },
    'bahria-town-phase-8': {
        title: 'Bahria Town Phase 8',
        location: 'Rawalpindi',
        status: 'Premium',
        developer: 'Bahria Town (Pvt) Ltd',
        totalArea: 'Extensive Development',
        description: 'Bahria Town Phase 8 is a prestigious development with luxury amenities and excellent investment potential in Pakistan\'s most trusted housing society.',
        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        features: [
            'Premium Quality',
            'Shopping Centers',
            'High ROI',
            'Secure Community',
            'International Standards',
            'Golf Course',
            'Theme Park',
            'Hospital'
        ],
        plotSizes: {
            residential: [
                { size: '5 Marla', price: 'PKR 45-55 Lac', dimensions: '25x45 ft' },
                { size: '8 Marla', price: 'PKR 70-85 Lac', dimensions: '30x60 ft' },
                { size: '10 Marla', price: 'PKR 95-1.2 Crore', dimensions: '35x70 ft' },
                { size: '1 Kanal', price: 'PKR 2-2.5 Crore', dimensions: '50x90 ft' }
            ]
        },
        paymentPlan: {
            duration: 'As per Bahria Policy',
            downPayment: 'Contact for Details',
            installments: 'Flexible Options',
            discount: 'Contact for Current Offers'
        },
        amenities: [
            'Golf Course',
            'Theme Park',
            'Shopping Mall',
            'Hospital',
            'Schools & Colleges',
            'Mosque',
            'Community Centers',
            'Sports Facilities'
        ],
        connectivity: [
            'GT Road - Direct Access',
            'Islamabad - 30 minutes',
            'Airport - 45 minutes',
            'Lahore - 3 hours',
            'Major Highways - Easy Access'
        ]
    },

    // New Faisal Town Projects
    'faisal-town-ft': {
        title: 'Faisal Town (FT)',
        location: 'Near Tarnol Interchange, Motorway M-1',
        status: 'Active',
        developer: 'Faisal Town',
        totalArea: 'Multiple Phases',
        description: 'Faisal Town, RDA-approved, is located near Tarnol Interchange, Motorway M-1. Its grand gates reflect Gandhara and Mughal architecture.',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        features: [
            'RDA-approved project',
            'Gandhara and Mughal architecture',
            'Strategic location near Motorway M-1',
            'Grand entrance gates',
            'Easy access to Islamabad'
        ],
        plotSizes: {
            residential: [
                { size: '5 Marla', price: 'Contact for pricing', dimensions: '25x45 ft' },
                { size: '10 Marla', price: 'Contact for pricing', dimensions: '35x70 ft' },
                { size: '1 Kanal', price: 'Contact for pricing', dimensions: '50x90 ft' }
            ]
        },
        paymentPlan: {
            duration: 'Flexible Plans Available',
            downPayment: 'Contact for details',
            installments: 'Available',
            discount: 'Special offers available'
        },
        amenities: [
            'Modern infrastructure',
            'Security system',
            'Utilities available',
            'Road network',
            'Commercial areas'
        ],
        connectivity: [
            'Motorway M-1 - Direct access',
            'Tarnol Interchange - 2 minutes',
            'Islamabad - 20 minutes',
            'Airport - 30 minutes'
        ]
    },

    'faisal-hills-fh': {
        title: 'Faisal Hills (FH)',
        location: 'Near Margalla Hills, Islamabad',
        status: 'Active',
        developer: 'Faisal Town',
        totalArea: 'Premium Development',
        description: 'Faisal Hills offers luxury living near the scenic Margalla Hills, blending modern design with premium facilities in a secure, gated community close to Islamabad.',
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        features: [
            'Luxury gated community',
            'Near scenic Margalla Hills',
            'Modern design architecture',
            'Premium facilities',
            'Secure environment',
            'Close to Islamabad'
        ],
        plotSizes: {
            residential: [
                { size: '5 Marla', price: 'Contact for pricing', dimensions: '25x45 ft' },
                { size: '8 Marla', price: 'Contact for pricing', dimensions: '30x60 ft' },
                { size: '10 Marla', price: 'Contact for pricing', dimensions: '35x70 ft' },
                { size: '1 Kanal', price: 'Contact for pricing', dimensions: '50x90 ft' }
            ]
        },
        paymentPlan: {
            duration: 'Flexible payment options',
            downPayment: 'Contact for details',
            installments: 'Available',
            discount: 'Early bird discounts'
        },
        amenities: [
            'Luxury amenities',
            'Gated security',
            'Premium infrastructure',
            'Landscaped areas',
            'Community facilities'
        ],
        connectivity: [
            'Margalla Hills - Adjacent',
            'Islamabad - 15 minutes',
            'Airport - 25 minutes',
            'Major roads - Easy access'
        ]
    },

    'faisal-villas-fv': {
        title: 'Faisal Villas (FV)',
        location: 'Prime location in Islamabad region',
        status: 'Active',
        developer: 'Faisal Town',
        totalArea: 'Exclusive Villa Community',
        description: 'Faisal Villas represents the pinnacle of luxury living with exclusive villa plots and premium amenities in a prestigious location.',
        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        features: [
            'Exclusive villa community',
            'Premium location',
            'Luxury amenities',
            'High-end infrastructure',
            'Prestigious neighborhood',
            'Modern facilities'
        ],
        plotSizes: {
            residential: [
                { size: '10 Marla Villa', price: 'Contact for pricing', dimensions: '35x70 ft' },
                { size: '1 Kanal Villa', price: 'Contact for pricing', dimensions: '50x90 ft' },
                { size: '2 Kanal Villa', price: 'Contact for pricing', dimensions: '70x126 ft' }
            ]
        },
        paymentPlan: {
            duration: 'Premium payment plans',
            downPayment: 'Contact for details',
            installments: 'Flexible options',
            discount: 'VIP member benefits'
        },
        amenities: [
            'Villa-style living',
            'Premium security',
            'Luxury facilities',
            'Exclusive community',
            'High-end amenities'
        ],
        connectivity: [
            'Prime location access',
            'Major highways nearby',
            'City center connectivity',
            'Airport accessibility'
        ]
    },

    'sea-square': {
        title: 'SEA Square',
        location: 'Strategic commercial location',
        status: 'Active',
        developer: 'Faisal Town',
        totalArea: 'Commercial Development',
        description: 'SEA Square is a modern commercial development offering prime business opportunities with state-of-the-art facilities and strategic location.',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        features: [
            'Commercial development',
            'Strategic location',
            'Modern facilities',
            'Business opportunities',
            'Prime investment',
            'Professional environment'
        ],
        plotSizes: {
            commercial: [
                { size: 'Shop', price: 'Contact for pricing', dimensions: 'Various sizes' },
                { size: 'Office Space', price: 'Contact for pricing', dimensions: 'Flexible layouts' },
                { size: 'Commercial Plot', price: 'Contact for pricing', dimensions: 'Custom sizes' }
            ]
        },
        paymentPlan: {
            duration: 'Commercial payment plans',
            downPayment: 'Contact for details',
            installments: 'Business-friendly terms',
            discount: 'Early investor benefits'
        },
        amenities: [
            'Commercial facilities',
            'Business center',
            'Modern infrastructure',
            'Parking facilities',
            'Security systems'
        ],
        connectivity: [
            'Business district access',
            'Major roads connectivity',
            'Public transport',
            'Commercial hubs nearby'
        ]
    },

    'faisal-margalla-city-fmc': {
        title: 'Faisal Margalla City (FMC)',
        location: 'Near Margalla Hills, Islamabad',
        status: 'Active',
        developer: 'Faisal Town',
        totalArea: 'Integrated City Development',
        description: 'Faisal Margalla City is an integrated development near the beautiful Margalla Hills, offering a complete lifestyle with residential, commercial, and recreational facilities.',
        image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        features: [
            'Integrated city development',
            'Near Margalla Hills',
            'Complete lifestyle',
            'Mixed-use development',
            'Modern planning',
            'Scenic location'
        ],
        plotSizes: {
            residential: [
                { size: '5 Marla', price: 'Contact for pricing', dimensions: '25x45 ft' },
                { size: '10 Marla', price: 'Contact for pricing', dimensions: '35x70 ft' },
                { size: '1 Kanal', price: 'Contact for pricing', dimensions: '50x90 ft' }
            ],
            commercial: [
                { size: 'Commercial Plot', price: 'Contact for pricing', dimensions: 'Various sizes' }
            ]
        },
        paymentPlan: {
            duration: 'City development plans',
            downPayment: 'Contact for details',
            installments: 'Long-term options',
            discount: 'Foundation member benefits'
        },
        amenities: [
            'City-level amenities',
            'Recreational facilities',
            'Educational institutions',
            'Healthcare facilities',
            'Shopping centers'
        ],
        connectivity: [
            'Margalla Hills - Adjacent',
            'Islamabad city - Connected',
            'Major highways - Access',
            'Airport - Convenient'
        ]
    },

    'faisal-residencia-fr': {
        title: 'Faisal Residencia (FR)',
        location: 'Premium residential area',
        status: 'Active',
        developer: 'Faisal Town',
        totalArea: 'Residential Community',
        description: 'Faisal Residencia offers premium residential living with modern amenities and excellent connectivity in a well-planned community environment.',
        image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        features: [
            'Premium residential community',
            'Modern amenities',
            'Well-planned layout',
            'Family-friendly environment',
            'Quality infrastructure',
            'Peaceful location'
        ],
        plotSizes: {
            residential: [
                { size: '3 Marla', price: 'Contact for pricing', dimensions: '20x37.5 ft' },
                { size: '5 Marla', price: 'Contact for pricing', dimensions: '25x45 ft' },
                { size: '8 Marla', price: 'Contact for pricing', dimensions: '30x60 ft' },
                { size: '10 Marla', price: 'Contact for pricing', dimensions: '35x70 ft' }
            ]
        },
        paymentPlan: {
            duration: 'Residential payment plans',
            downPayment: 'Contact for details',
            installments: 'Family-friendly terms',
            discount: 'Resident benefits'
        },
        amenities: [
            'Residential amenities',
            'Community center',
            'Parks and playgrounds',
            'Security services',
            'Utility services'
        ],
        connectivity: [
            'Residential area access',
            'Schools and hospitals nearby',
            'Shopping areas',
            'Public transport'
        ]
    },

    'faisal-tower': {
        title: 'Faisal Tower',
        location: 'Commercial district',
        status: 'Active',
        developer: 'Faisal Town',
        totalArea: 'High-rise Development',
        description: 'Faisal Tower is a prestigious high-rise development offering premium office spaces and commercial opportunities in a prime location.',
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        features: [
            'High-rise tower',
            'Premium office spaces',
            'Commercial opportunities',
            'Prime location',
            'Modern architecture',
            'Professional environment'
        ],
        plotSizes: {
            commercial: [
                { size: 'Office Suite', price: 'Contact for pricing', dimensions: 'Various layouts' },
                { size: 'Floor Space', price: 'Contact for pricing', dimensions: 'Full floor options' },
                { size: 'Retail Space', price: 'Contact for pricing', dimensions: 'Ground floor' }
            ]
        },
        paymentPlan: {
            duration: 'Commercial tower plans',
            downPayment: 'Contact for details',
            installments: 'Professional terms',
            discount: 'Corporate benefits'
        },
        amenities: [
            'High-rise amenities',
            'Professional facilities',
            'Modern elevators',
            'Parking garage',
            'Security systems'
        ],
        connectivity: [
            'Commercial district',
            'Business centers nearby',
            'Major roads access',
            'Public transport'
        ]
    },

    'faisal-town-phase-ii': {
        title: 'Faisal Town Phase II',
        location: 'Extension of Faisal Town',
        status: 'Active',
        developer: 'Faisal Town',
        totalArea: 'Phase II Development',
        description: 'Faisal Town Phase II continues the legacy of quality development with enhanced features and modern planning for contemporary living.',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        features: [
            'Phase II development',
            'Enhanced features',
            'Modern planning',
            'Quality construction',
            'Improved amenities',
            'Contemporary design'
        ],
        plotSizes: {
            residential: [
                { size: '5 Marla', price: 'Contact for pricing', dimensions: '25x45 ft' },
                { size: '8 Marla', price: 'Contact for pricing', dimensions: '30x60 ft' },
                { size: '10 Marla', price: 'Contact for pricing', dimensions: '35x70 ft' },
                { size: '1 Kanal', price: 'Contact for pricing', dimensions: '50x90 ft' }
            ]
        },
        paymentPlan: {
            duration: 'Phase II payment plans',
            downPayment: 'Contact for details',
            installments: 'Flexible options',
            discount: 'Phase launch benefits'
        },
        amenities: [
            'Phase II amenities',
            'Enhanced infrastructure',
            'Modern facilities',
            'Community services',
            'Quality utilities'
        ],
        connectivity: [
            'Phase I connectivity',
            'Extended road network',
            'Improved access',
            'Transportation links'
        ]
    }
};

// Get project ID from URL parameters
function getProjectId() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('project');
    console.log('Project ID from URL:', projectId);
    return projectId;
}

// Load project details
function loadProjectDetails() {
    console.log('loadProjectDetails called');
    const projectId = getProjectId();
    console.log('Looking for project:', projectId);
    const project = projectsData[projectId];
    console.log('Found project:', project);
    
    if (!project) {
        console.log('Project not found, available projects:', Object.keys(projectsData));
        document.getElementById('detail-content').innerHTML = `
            <div class="error-message">
                <h2>Project Not Found</h2>
                <p>The requested project details could not be found.</p>
                <p>Available projects: ${Object.keys(projectsData).join(', ')}</p>
                <a href="index.html#projects" class="btn-primary">Back to Projects</a>
            </div>
        `;
        return;
    }
    
    // Update page title
    document.getElementById('project-title').textContent = project.title;
    document.title = `${project.title} - Estate Nama`;
    
    // Generate detailed content
    const content = `
        <div class="project-hero">
            <div class="project-hero-image">
                <img src="${project.image}" alt="${project.title}" loading="lazy">
                <div class="project-status-badge">${project.status}</div>
            </div>
            <div class="project-hero-info">
                <h1>${project.title}</h1>
                <p class="location"><i class="fas fa-map-marker-alt"></i> ${project.location}</p>
                <p class="developer"><i class="fas fa-building"></i> Developer: ${project.developer}</p>
                <p class="area"><i class="fas fa-expand-arrows-alt"></i> Total Area: ${project.totalArea}</p>
                <p class="description">${project.description}</p>
            </div>
        </div>
        
        <div class="detail-sections">
            <div class="detail-section">
                <h2><i class="fas fa-home"></i> Plot Sizes & Pricing</h2>
                ${generatePlotSizesHTML(project.plotSizes)}
            </div>
            
            <div class="detail-section">
                <h2><i class="fas fa-credit-card"></i> Payment Plan</h2>
                <div class="payment-details">
                    <div class="payment-item">
                        <strong>Duration:</strong> ${project.paymentPlan.duration}
                    </div>
                    <div class="payment-item">
                        <strong>Down Payment:</strong> ${project.paymentPlan.downPayment}
                    </div>
                    <div class="payment-item">
                        <strong>Installments:</strong> ${project.paymentPlan.installments}
                    </div>
                    <div class="payment-item">
                        <strong>Special Offer:</strong> ${project.paymentPlan.discount}
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h2><i class="fas fa-star"></i> Key Features</h2>
                <div class="features-grid">
                    ${project.features.map(feature => `<div class="feature-item"><i class="fas fa-check"></i> ${feature}</div>`).join('')}
                </div>
            </div>
            
            <div class="detail-section">
                <h2><i class="fas fa-building"></i> Amenities</h2>
                <div class="amenities-grid">
                    ${project.amenities.map(amenity => `<div class="amenity-item"><i class="fas fa-check-circle"></i> ${amenity}</div>`).join('')}
                </div>
            </div>
            
            <div class="detail-section">
                <h2><i class="fas fa-route"></i> Connectivity</h2>
                <div class="connectivity-list">
                    ${project.connectivity.map(connection => `<div class="connectivity-item"><i class="fas fa-road"></i> ${connection}</div>`).join('')}
                </div>
            </div>
        </div>
        
        <div class="contact-section">
            <h2>Interested in this Project?</h2>
            <p>Contact our expert team for site visits, detailed brochures, and personalized assistance.</p>
            <div class="contact-buttons">
                <button class="btn-primary" onclick="openWhatsApp('I am interested in ${project.title}. Please provide me with complete details and arrange a site visit.')">
                    <i class="fab fa-whatsapp"></i> WhatsApp for Details
                </button>
                <a href="tel:03195547788" class="btn-secondary">
                    <i class="fas fa-phone"></i> Call Now
                </a>
                <a href="mailto:info@estatenama.com?subject=Inquiry about ${project.title}" class="btn-outline">
                    <i class="fas fa-envelope"></i> Email Us
                </a>
            </div>
        </div>
    `;
    
    document.getElementById('detail-content').innerHTML = content;
}

// Generate plot sizes HTML
function generatePlotSizesHTML(plotSizes) {
    let html = '';
    
    if (plotSizes.residential) {
        html += `
            <div class="plot-category">
                <h3><i class="fas fa-home"></i> Residential Plots</h3>
                <div class="plot-table">
                    <div class="plot-header">
                        <div>Plot Size</div>
                        <div>Price Range</div>
                        <div>Dimensions</div>
                    </div>
                    ${plotSizes.residential.map(plot => `
                        <div class="plot-row">
                            <div class="plot-size">${plot.size}</div>
                            <div class="plot-price">${plot.price}</div>
                            <div class="plot-dimensions">${plot.dimensions}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    if (plotSizes.commercial) {
        html += `
            <div class="plot-category">
                <h3><i class="fas fa-building"></i> Commercial Plots</h3>
                <div class="plot-table">
                    <div class="plot-header">
                        <div>Plot Size</div>
                        <div>Price Range</div>
                        <div>Dimensions</div>
                    </div>
                    ${plotSizes.commercial.map(plot => `
                        <div class="plot-row">
                            <div class="plot-size">${plot.size}</div>
                            <div class="plot-price">${plot.price}</div>
                            <div class="plot-dimensions">${plot.dimensions}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    if (plotSizes.villas) {
        html += `
            <div class="plot-category">
                <h3><i class="fas fa-crown"></i> Villa Plots</h3>
                <div class="plot-table">
                    <div class="plot-header">
                        <div>Villa Type</div>
                        <div>Price Range</div>
                        <div>Dimensions</div>
                    </div>
                    ${plotSizes.villas.map(plot => `
                        <div class="plot-row">
                            <div class="plot-size">${plot.size}</div>
                            <div class="plot-price">${plot.price}</div>
                            <div class="plot-dimensions">${plot.dimensions}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    if (plotSizes.farmhouses) {
        html += `
            <div class="plot-category">
                <h3><i class="fas fa-tree"></i> Farmhouse Plots</h3>
                <div class="plot-table">
                    <div class="plot-header">
                        <div>Farmhouse Size</div>
                        <div>Price Range</div>
                        <div>Dimensions</div>
                    </div>
                    ${plotSizes.farmhouses.map(plot => `
                        <div class="plot-row">
                            <div class="plot-size">${plot.size}</div>
                            <div class="plot-price">${plot.price}</div>
                            <div class="plot-dimensions">${plot.dimensions}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    return html;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadProjectDetails();
    
    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: true
        });
    }
});