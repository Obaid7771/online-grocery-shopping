"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const argon2 = require("argon2");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting FreshCart database seeding...');
    const defaultPassword = 'Password123!';
    const hashedPassword = await argon2.hash(defaultPassword, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
    });
    console.log('👤 Seeding Users with Argon2id...');
    const superAdmin = await prisma.user.upsert({
        where: { email: 'superadmin@freshcart.io' },
        update: {},
        create: {
            email: 'superadmin@freshcart.io',
            phone: '+14155550001',
            passwordHash: hashedPassword,
            firstName: 'Alexander',
            lastName: 'Vance',
            role: client_1.Role.SUPER_ADMIN,
            isActive: true,
            isEmailVerified: true,
            isPhoneVerified: true,
        },
    });
    const storeAdmin = await prisma.user.upsert({
        where: { email: 'admin@freshcart.io' },
        update: {},
        create: {
            email: 'admin@freshcart.io',
            phone: '+14155550002',
            passwordHash: hashedPassword,
            firstName: 'Sarah',
            lastName: 'Jenkins',
            role: client_1.Role.ADMIN,
            isActive: true,
            isEmailVerified: true,
        },
    });
    const dispatcher = await prisma.user.upsert({
        where: { email: 'dispatcher@freshcart.io' },
        update: {},
        create: {
            email: 'dispatcher@freshcart.io',
            phone: '+14155550003',
            passwordHash: hashedPassword,
            firstName: 'Marcus',
            lastName: 'Ray',
            role: client_1.Role.DISPATCHER,
            isActive: true,
            isEmailVerified: true,
        },
    });
    const customer = await prisma.user.upsert({
        where: { email: 'customer@freshcart.io' },
        update: {},
        create: {
            email: 'customer@freshcart.io',
            phone: '+14155550004',
            passwordHash: hashedPassword,
            firstName: 'Emily',
            lastName: 'Chen',
            role: client_1.Role.CUSTOMER,
            isActive: true,
            isEmailVerified: true,
        },
    });
    console.log('📍 Seeding Address...');
    await prisma.address.create({
        data: {
            userId: customer.id,
            label: 'Home',
            recipientName: 'Emily Chen',
            phone: '+14155550004',
            street: '742 Evergreen Terrace',
            apartment: 'Apt 4B',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94102',
            country: 'USA',
            latitude: 37.7749,
            longitude: -122.4194,
            isDefault: true,
            deliveryInstructions: 'Ring buzzer 4B, leave at front door if not answering.',
        },
    });
    console.log('🚚 Seeding Delivery Zones...');
    const sfZone = await prisma.deliveryZone.create({
        data: {
            name: 'San Francisco Central',
            postalCodes: ['94102', '94103', '94104', '94105', '94107', '94108', '94109', '94110'],
            baseFee: 3.99,
            minOrderAmount: 20.00,
            freeDeliveryThreshold: 60.00,
            estimatedMinutes: 45,
            isActive: true,
        },
    });
    console.log('⏰ Seeding Delivery Slots...');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const slotTimes = [
        { start: '08:00', end: '10:00' },
        { start: '10:00', end: '12:00' },
        { start: '13:00', end: '15:00' },
        { start: '15:00', end: '17:00' },
        { start: '18:00', end: '20:00' },
    ];
    for (const date of [today, tomorrow]) {
        for (const time of slotTimes) {
            await prisma.deliverySlot.create({
                data: {
                    slotDate: date,
                    startTime: time.start,
                    endTime: time.end,
                    maxCapacity: 25,
                    bookedCount: 0,
                    isActive: true,
                },
            });
        }
    }
    console.log('🥦 Seeding Categories...');
    const produceCat = await prisma.category.create({
        data: {
            name: 'Fresh Produce',
            slug: 'fresh-produce',
            description: 'Farm-fresh organic fruits, vegetables, and leafy greens.',
            imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
            sortOrder: 1,
            isActive: true,
        },
    });
    const dairyCat = await prisma.category.create({
        data: {
            name: 'Dairy & Eggs',
            slug: 'dairy-and-eggs',
            description: 'Organic milk, artisan cheeses, yogurts, and free-range eggs.',
            imageUrl: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80',
            sortOrder: 2,
            isActive: true,
        },
    });
    const bakeryCat = await prisma.category.create({
        data: {
            name: 'Bakery & Bread',
            slug: 'bakery-and-bread',
            description: 'Artisan sourdough, fresh bagels, baguettes, and morning pastries.',
            imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
            sortOrder: 3,
            isActive: true,
        },
    });
    const meatCat = await prisma.category.create({
        data: {
            name: 'Meat & Seafood',
            slug: 'meat-and-seafood',
            description: 'Grass-fed beef, organic poultry, wild-caught salmon and shrimp.',
            imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80',
            sortOrder: 4,
            isActive: true,
        },
    });
    const beverageCat = await prisma.category.create({
        data: {
            name: 'Beverages',
            slug: 'beverages',
            description: 'Cold-pressed juices, sparkling waters, specialty coffees, and teas.',
            imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80',
            sortOrder: 5,
            isActive: true,
        },
    });
    console.log('🍎 Seeding Products with Prices & Stock...');
    const products = [
        {
            categoryId: produceCat.id,
            name: 'Organic Honeycrisp Apples',
            slug: 'organic-honeycrisp-apples',
            description: 'Crisp, extraordinarily sweet and juicy organic apples picked fresh from local Washington orchards.',
            sku: 'PRD-APL-001',
            barcode: '012345678901',
            price: 3.99,
            discountPrice: 2.99,
            unit: client_1.ProductUnit.KG,
            unitStep: 0.5,
            stockQuantity: 120,
            minStockThreshold: 15,
            isFeatured: true,
            imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
        },
        {
            categoryId: produceCat.id,
            name: 'Organic Hass Avocados',
            slug: 'organic-hass-avocados',
            description: 'Creamy, perfectly ripe avocados packed with healthy heart fats.',
            sku: 'PRD-AVO-002',
            barcode: '012345678902',
            price: 5.49,
            discountPrice: 4.49,
            unit: client_1.ProductUnit.PACK,
            unitStep: 1.0,
            stockQuantity: 80,
            minStockThreshold: 10,
            isFeatured: true,
            imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80',
        },
        {
            categoryId: dairyCat.id,
            name: 'Organic Whole Milk (1 Gallon)',
            slug: 'organic-whole-milk-1-gallon',
            description: 'Grade A pasture-raised whole milk with Vitamin D3.',
            sku: 'DRY-MLK-001',
            barcode: '012345678903',
            price: 5.99,
            discountPrice: null,
            unit: client_1.ProductUnit.PIECE,
            unitStep: 1.0,
            stockQuantity: 65,
            minStockThreshold: 10,
            isFeatured: true,
            imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
        },
        {
            categoryId: dairyCat.id,
            name: 'Pasture-Raised Large Brown Eggs (Dozen)',
            slug: 'pasture-raised-large-brown-eggs',
            description: 'Certified humane pasture-raised eggs with rich golden yolks.',
            sku: 'DRY-EGG-002',
            barcode: '012345678904',
            price: 6.49,
            discountPrice: 5.79,
            unit: client_1.ProductUnit.BOX,
            unitStep: 1.0,
            stockQuantity: 90,
            minStockThreshold: 12,
            isFeatured: true,
            imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
        },
        {
            categoryId: bakeryCat.id,
            name: 'San Francisco Artisan Sourdough Batard',
            slug: 'sf-artisan-sourdough-batard',
            description: 'Slow-fermented wild yeast sourdough with a blistered crust and tangy crumb.',
            sku: 'BKR-SDR-001',
            barcode: '012345678905',
            price: 6.99,
            discountPrice: null,
            unit: client_1.ProductUnit.PIECE,
            unitStep: 1.0,
            stockQuantity: 40,
            minStockThreshold: 8,
            isFeatured: true,
            imageUrl: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
        },
        {
            categoryId: meatCat.id,
            name: 'Wild-Caught Alaskan Sockeye Salmon Fillet',
            slug: 'wild-caught-alaskan-sockeye-salmon',
            description: 'Sustainably harvested vibrant red salmon fillets rich in Omega-3.',
            sku: 'MET-SLM-001',
            barcode: '012345678906',
            price: 18.99,
            discountPrice: 16.49,
            unit: client_1.ProductUnit.KG,
            unitStep: 0.5,
            stockQuantity: 30,
            minStockThreshold: 5,
            isFeatured: true,
            imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
        },
    ];
    for (const prod of products) {
        const createdProduct = await prisma.product.create({
            data: {
                categoryId: prod.categoryId,
                name: prod.name,
                slug: prod.slug,
                description: prod.description,
                sku: prod.sku,
                barcode: prod.barcode,
                price: prod.price,
                discountPrice: prod.discountPrice,
                unit: prod.unit,
                unitStep: prod.unitStep,
                stockQuantity: prod.stockQuantity,
                minStockThreshold: prod.minStockThreshold,
                isFeatured: prod.isFeatured,
                isActive: true,
                images: {
                    create: [
                        {
                            url: prod.imageUrl,
                            isPrimary: true,
                            sortOrder: 0,
                            altText: prod.name,
                        },
                    ],
                },
            },
        });
        await prisma.inventoryLog.create({
            data: {
                productId: createdProduct.id,
                changeType: 'PURCHASE_RECEIPT',
                quantityChanged: prod.stockQuantity,
                previousQuantity: 0,
                newQuantity: prod.stockQuantity,
                reason: 'Initial system inventory seed',
                performedByUserId: storeAdmin.id,
            },
        });
    }
    console.log('🏷️ Seeding Promo Coupons...');
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    await prisma.coupon.create({
        data: {
            code: 'FRESH20',
            description: '20% off your entire fresh grocery basket on orders over $35',
            discountType: client_1.DiscountType.PERCENTAGE,
            discountValue: 20.00,
            minOrderAmount: 35.00,
            maxDiscountAmount: 25.00,
            startDate: new Date(),
            endDate: nextMonth,
            usageLimitTotal: 500,
            usageLimitPerUser: 1,
            isActive: true,
        },
    });
    console.log('✅ FreshCart database seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('Admin Account:    admin@freshcart.io / Password123!');
    console.log('Customer Account: customer@freshcart.io / Password123!');
    console.log('----------------------------------------------------');
}
main()
    .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map