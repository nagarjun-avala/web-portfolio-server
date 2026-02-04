// Script to fix certifications with null names
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function fixCertifications() {
    try {
        console.log('🔍 Finding certifications with null names...');

        const nullNameCerts = await db.certification.findMany({
            where: {
                name: null
            }
        });

        console.log(`Found ${nullNameCerts.length} certifications with null names`);

        if (nullNameCerts.length === 0) {
            console.log('✅ No certifications to fix!');
            return;
        }

        console.log('\n📋 Certifications with null names:');
        nullNameCerts.forEach((cert, index) => {
            console.log(`${index + 1}. ID: ${cert.id}`);
            console.log(`   Organization: ${cert.organization}`);
            console.log(`   Title (legacy): ${(cert as any).title || 'N/A'}`);
            console.log('');
        });

        console.log('\n🔧 Fixing certifications...');

        for (const cert of nullNameCerts) {
            // Use title if available, otherwise use organization name + "Certification"
            const newName = (cert as any).title || `${cert.organization} Certification`;

            await db.certification.update({
                where: { id: cert.id },
                data: { name: newName }
            });

            console.log(`✅ Fixed: ${cert.id} -> "${newName}"`);
        }

        console.log(`\n✨ Successfully fixed ${nullNameCerts.length} certifications!`);

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await db.$disconnect();
    }
}

fixCertifications();
