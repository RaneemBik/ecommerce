import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from './config/env';
import { Customer } from './models/customer.model';
import { Product } from './models/product.model';
import { Order } from './models/order.model';
import { User } from './models/user.model';

async function runSeed() {
    await mongoose.connect(env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');

    const adminEmail = 'admin@novadash.com';
    const adminPassword = 'Admin@123';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
        const passwordHash = await bcrypt.hash(adminPassword, 10);
        await User.create({
            name: 'Nova Admin',
            email: adminEmail,
            passwordHash,
            isAdmin: true,
        });
        console.log(`✅ Admin user created: ${adminEmail} / ${adminPassword}`);
    } else {
        console.log(`ℹ️ Admin user already exists: ${adminEmail}`);
    }

    await Order.deleteMany({});
    await Customer.deleteMany({});
    await Product.deleteMany({});

    const customers = await Customer.insertMany([
        { name: 'Sxherlock Holmes', email: 'sherlock@bakerstreet.com', phone: '+44-20-221B', address: '221B Baker Street, London' },
        { name: 'Sung Jinwoo', email: 'jinwoo@hunters.kr', phone: '+82-10-0000-0110', address: 'Seoul, South Korea' },
        { name: 'Levi Ackerman', email: 'levi@scouts.paradis', phone: '+00-104', address: 'Scouting Regiment HQ' },
        { name: 'Tony Stark', email: 'tony@starkindustries.com', phone: '+1-555-IRONMAN', address: 'Malibu, California' },
        { name: 'Mikasa Ackerman', email: 'mikasa@scouts.paradis', phone: '+00-105', address: 'Wall Rose District' },
    ]);

    const products = await Product.insertMany([
        { sku: 'IPHONE-15PM-001', name: 'iPhone 15 Pro Max', description: '6.7-inch Super Retina XDR display, A17 Pro chip, Titanium design, 256GB.', price: 1199.99, stock: 45, category: 'Smartphones' },
        { sku: 'GALAXY-S24U-002', name: 'Samsung Galaxy S24 Ultra', description: '6.8-inch Dynamic AMOLED, Snapdragon 8 Gen 3, S Pen included, 256GB.', price: 1299.99, stock: 38, category: 'Smartphones' },
        { sku: 'PIXEL-8PRO-003', name: 'Google Pixel 8 Pro', description: '6.7-inch LTPO OLED, Google Tensor G3, Best AI camera, 128GB.', price: 999.00, stock: 52, category: 'Smartphones' },
        { sku: 'ONEPLUS-12-004', name: 'OnePlus 12', description: '6.82-inch AMOLED 120Hz, Snapdragon 8 Gen 3, Fast charging 100W, 256GB.', price: 799.99, stock: 30, category: 'Smartphones' },
        { sku: 'XIAOMI-14PRO-005', name: 'Xiaomi 14 Pro', description: '6.73-inch AMOLED, Leica camera system, Snapdragon 8 Gen 3, 512GB.', price: 899.99, stock: 25, category: 'Smartphones' },
        { sku: 'XPERIA-1V-006', name: 'Sony Xperia 1 V', description: '6.5-inch 4K HDR OLED, Snapdragon 8 Gen 2, Pro camera features, 256GB.', price: 1099.00, stock: 18, category: 'Smartphones' },
    ]);

    const findCustomer = (email: string) => customers.find((customer) => customer.email === email)!;
    const findProduct = (sku: string) => products.find((product) => product.sku === sku)!;

    const orderDefinitions = [
        {
            customer: 'sherlock@bakerstreet.com',
            priority: 'high' as const,
            status: 'paid' as const,
            items: [
                { sku: 'IPHONE-15PM-001', quantity: 1 },
                { sku: 'XPERIA-1V-006', quantity: 1 },
            ],
        },
        {
            customer: 'jinwoo@hunters.kr',
            priority: 'high' as const,
            status: 'shipped' as const,
            items: [
                { sku: 'GALAXY-S24U-002', quantity: 2 },
            ],
        },
        {
            customer: 'tony@starkindustries.com',
            priority: 'medium' as const,
            status: 'pending' as const,
            items: [
                { sku: 'ONEPLUS-12-004', quantity: 1 },
                { sku: 'PIXEL-8PRO-003', quantity: 1 },
            ],
        },
        {
            customer: 'levi@scouts.paradis',
            priority: 'low' as const,
            status: 'delivered' as const,
            items: [
                { sku: 'XIAOMI-14PRO-005', quantity: 1 },
            ],
        },
    ];

    const ordersToInsert = orderDefinitions.map((definition) => {
        const customer = findCustomer(definition.customer);
        const items = definition.items.map(({ sku, quantity }) => {
            const product = findProduct(sku);
            return {
                productId: product._id,
                quantity,
                unitPrice: product.price,
                lineTotal: product.price * quantity,
            };
        });

        const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

        return {
            customerId: customer._id,
            priority: definition.priority,
            status: definition.status,
            items,
            total,
        };
    });

    await Order.insertMany(ordersToInsert);

    console.log(`✅ Seeded ${customers.length} customers, ${products.length} products, ${ordersToInsert.length} orders`);
    await mongoose.disconnect();
    console.log('✅ Seed complete');
}

runSeed().catch(async (error) => {
    console.error('❌ Seed failed', error);
    await mongoose.disconnect();
    process.exit(1);
});
