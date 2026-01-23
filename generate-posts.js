const fs = require('fs');
const path = require('path');

const blogPosts = [
    {
        id: 1,
        title: "Houses for Sale Near Me: Complete Guide to Finding Your Dream Home",
        excerpt: "Discover the best houses for sale in your area with our comprehensive guide. Learn about market trends, pricing, and how to find the perfect property.",
        content: "Finding houses for sale near you has never been easier. Our expert real estate agents help you navigate the local market, compare prices, and find properties that match your budget and preferences.",
        category: "Buying Guide",
        date: "2024-01-15",
        image: "images/homepage/home1.png",
        keywords: ["houses for sale near me", "real estate", "property", "homes for sale"]
    },
    {
        id: 2,
        title: "Commercial Property for Sale: Investment Opportunities in 2024",
        excerpt: "Explore lucrative commercial property investments. From office buildings to retail spaces, discover the best commercial real estate opportunities.",
        content: "Commercial property for sale offers excellent investment potential. Our portfolio includes prime commercial locations with high ROI potential and strategic advantages.",
        category: "Investment",
        date: "2024-01-20",
        image: "images/homepage/home2.png",
        keywords: ["commercial property for sale", "investment", "commercial real estate"]
    },
    {
        id: 3,
        title: "Land for Sale Near Me: Prime Plots for Development",
        excerpt: "Find the best land for sale in prime locations. Perfect for residential development, commercial projects, or investment purposes.",
        content: "Our land for sale portfolio includes RDA approved plots in Bahria Town, Ruden Enclave, and Faisal Town. All properties come with clear titles and development potential.",
        category: "Land",
        date: "2024-01-25",
        image: "images/homepage/home1.png",
        keywords: ["land for sale near me", "plots", "development", "investment"]
    },
    {
        id: 4,
        title: "Real Estate Agent Services: Your Trusted Property Partner",
        excerpt: "Professional real estate agent services for buying, selling, and investing in property. Expert guidance for all your real estate needs.",
        content: "Our experienced real estate agents provide comprehensive services including property valuation, market analysis, legal assistance, and investment advice.",
        category: "Services",
        date: "2024-02-01",
        image: "images/homepage/home2.png",
        keywords: ["real estate agent", "property services", "realtors near me"]
    },
    {
        id: 5,
        title: "Installment Plans: Easy Property Payment Options",
        excerpt: "Flexible installment plans make property ownership accessible. Learn about our easy payment schemes and financing options.",
        content: "We offer attractive installment plans for all our properties. With flexible payment schedules and competitive rates, owning your dream property is now within reach.",
        category: "Financing",
        date: "2024-02-05",
        image: "images/homepage/home1.png",
        keywords: ["installments", "payment plans", "property financing"]
    },
    {
        id: 6,
        title: "New Homes Near Me: Latest Residential Projects",
        excerpt: "Discover new homes and residential projects in prime locations. Modern amenities, contemporary designs, and excellent connectivity.",
        content: "Our new homes feature modern architecture, premium amenities, and strategic locations. From luxury villas to affordable housing, find your perfect home.",
        category: "New Projects",
        date: "2024-02-10",
        image: "images/homepage/home2.png",
        keywords: ["new homes near me", "residential projects", "modern homes"]
    },
    {
        id: 7,
        title: "Property for Sale: Comprehensive Real Estate Listings",
        excerpt: "Browse our extensive property for sale listings. Residential, commercial, and investment properties in prime locations.",
        content: "Our property portfolio includes verified listings with detailed information, high-quality images, and competitive pricing. Find your ideal property today.",
        category: "Listings",
        date: "2024-02-15",
        image: "images/homepage/home1.png",
        keywords: ["property for sale", "real estate listings", "property search"]
    },
    {
        id: 8,
        title: "Buy House: Step-by-Step Home Buying Guide",
        excerpt: "Complete guide to buying a house. From property search to legal documentation, we guide you through every step.",
        content: "Buying a house is a major decision. Our experts help you with property selection, price negotiation, legal verification, and smooth transaction completion.",
        category: "Buying Guide",
        date: "2024-02-20",
        image: "images/homepage/home2.png",
        keywords: ["buy house", "home buying", "property purchase"]
    },
    {
        id: 9,
        title: "Mansions for Sale: Luxury Properties in Prime Locations",
        excerpt: "Exclusive mansions for sale in prestigious neighborhoods. Luxury living with premium amenities and architectural excellence.",
        content: "Our luxury mansion portfolio features exclusive properties with premium amenities, spacious layouts, and prime locations in elite neighborhoods.",
        category: "Luxury",
        date: "2024-02-25",
        image: "images/homepage/home1.png",
        keywords: ["mansions for sale", "luxury properties", "premium homes"]
    },
    {
        id: 10,
        title: "Real Estate Near Me: Local Property Market Analysis",
        excerpt: "Comprehensive analysis of local real estate markets. Property trends, pricing insights, and investment opportunities in your area.",
        content: "Stay informed about real estate trends in your area. Our market analysis helps you make informed decisions about buying, selling, or investing.",
        category: "Market Analysis",
        date: "2024-03-01",
        image: "images/homepage/home2.png",
        keywords: ["real estate near me", "market analysis", "property trends"]
    },
    {
        id: 11,
        title: "Apartments for Sale: Urban Living Solutions",
        excerpt: "Modern apartments for sale in prime urban locations. Perfect for young professionals and small families.",
        content: "Our apartment portfolio includes modern units with contemporary amenities, strategic locations, and excellent connectivity to business districts.",
        category: "Apartments",
        date: "2024-03-05",
        image: "images/homepage/home1.png",
        keywords: ["apartments for sale", "urban living", "modern apartments"]
    },
    {
        id: 12,
        title: "Rental Properties Near Me: Investment Income Opportunities",
        excerpt: "Discover rental properties with excellent income potential. High-demand locations with guaranteed rental yields.",
        content: "Invest in rental properties with strong income potential. Our portfolio includes properties in high-demand areas with excellent rental yields.",
        category: "Rental Investment",
        date: "2024-03-10",
        image: "images/homepage/home2.png",
        keywords: ["rental properties near me", "rental investment", "income property"]
    },
    {
        id: 13,
        title: "Investment Property for Sale: Build Your Real Estate Portfolio",
        excerpt: "Strategic investment properties for portfolio diversification. High ROI potential with professional property management.",
        content: "Build wealth through real estate investment. Our investment properties offer excellent ROI potential with professional management services.",
        category: "Investment",
        date: "2024-03-15",
        image: "images/homepage/home1.png",
        keywords: ["investment property for sale", "real estate investment", "property portfolio"]
    },
    {
        id: 14,
        title: "Realtors Near Me: Professional Real Estate Services",
        excerpt: "Connect with professional realtors in your area. Expert guidance for all your property needs and transactions.",
        content: "Our professional realtors provide expert guidance for buying, selling, and investing in real estate. Local market expertise and personalized service.",
        category: "Professional Services",
        date: "2024-03-20",
        image: "images/homepage/home2.png",
        keywords: ["realtors near me", "real estate professionals", "property experts"]
    },
    {
        id: 15,
        title: "Commercial Real Estate: Business Property Solutions",
        excerpt: "Commercial real estate opportunities for businesses. Office spaces, retail locations, and industrial properties.",
        content: "Find the perfect commercial space for your business. Our commercial real estate portfolio includes office buildings, retail spaces, and industrial properties.",
        category: "Commercial",
        date: "2024-03-25",
        image: "images/homepage/home1.png",
        keywords: ["commercial real estate", "business property", "office spaces"]
    },
    {
        id: 16,
        title: "Homes for Sale: Family-Friendly Residential Properties",
        excerpt: "Family-friendly homes for sale in safe neighborhoods. Quality construction, modern amenities, and excellent schools nearby.",
        content: "Our homes for sale feature family-friendly designs, safe neighborhoods, quality construction, and proximity to schools and amenities.",
        category: "Family Homes",
        date: "2024-03-30",
        image: "images/homepage/home2.png",
        keywords: ["homes for sale", "family homes", "residential properties"]
    },
    {
        id: 17,
        title: "Property Market Trends 2024: Expert Analysis and Predictions",
        excerpt: "Comprehensive analysis of property market trends for 2024. Price predictions, investment opportunities, and market insights.",
        content: "Stay ahead with our 2024 property market analysis. Expert insights on price trends, investment opportunities, and market predictions.",
        category: "Market Trends",
        date: "2024-04-01",
        image: "images/homepage/home1.png",
        keywords: ["property market trends", "real estate analysis", "market predictions"]
    },
    {
        id: 18,
        title: "Bahria Town Phase 8: Premium Residential Development",
        excerpt: "Explore Bahria Town Phase 8 - a premium residential development with world-class amenities and infrastructure.",
        content: "Bahria Town Phase 8 offers premium residential plots with modern infrastructure, security, and amenities. RDA approved with excellent investment potential.",
        category: "Featured Projects",
        date: "2024-04-05",
        image: "images/homepage/home2.png",
        keywords: ["bahria town phase 8", "premium development", "residential plots"]
    },
    {
        id: 19,
        title: "Ruden Enclave: Premium Residential Development",
        excerpt: "Ruden Enclave - A premium residential society offering modern amenities and excellent connectivity.",
        content: "Ruden Enclave is a well-planned residential development featuring modern infrastructure, green spaces, and comprehensive facilities for comfortable living.",
        category: "Residential",
        date: "2024-04-10",
        image: "images/homepage/home1.png",
        keywords: ["ruden enclave", "residential plots", "premium development"]
    },
    {
        id: 20,
        title: "Faisal Town: Established Community with Growth Potential",
        excerpt: "Faisal Town offers established infrastructure with excellent growth potential. Perfect for both living and investment.",
        content: "Faisal Town combines established infrastructure with growth potential. Excellent connectivity, amenities, and investment opportunities.",
        category: "Established Communities",
        date: "2024-04-15",
        image: "images/homepage/home2.png",
        keywords: ["faisal town", "established community", "growth potential"]
    }
];

const processedPosts = blogPosts.map(post => ({
    ...post,
    slug: post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    status: 'published',
    createdAt: new Date(post.date).toISOString()
}));

fs.writeFileSync(path.join(__dirname, 'admin-data', 'posts.json'), JSON.stringify(processedPosts, null, 2));
console.log('posts.json created successfully');
