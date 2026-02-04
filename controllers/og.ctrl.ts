
import { Request, Response } from 'express';

const OgController = {
    /**
     * POST /api/og/generate
     * Generate an SVG Open Graph image (Dependency-free)
     */
    generateOg: async (req: Request, res: Response) => {
        try {
            const { title = 'Portfolio', description = '', theme = 'dark', siteName = 'nagarjun-avala.com' } = req.body;

            const width = 1200;
            const height = 630;

            // Colors
            const isDark = theme === 'dark';
            const bgColor = isDark ? '#0f172a' : '#ffffff';
            const textColor = isDark ? '#f8fafc' : '#0f172a';
            const secondaryColor = isDark ? '#94a3b8' : '#64748b';
            const accentColor = '#3b82f6';
            const gridColor = isDark ? '#1e293b' : '#e2e8f0';

            // Text Wrapping Logic (Approximate for SVG)
            const wrapText = (text: string, maxCharsPerLine: number) => {
                const words = text.split(' ');
                const lines = [];
                let currentLine = words[0];

                for (let i = 1; i < words.length; i++) {
                    if (currentLine.length + 1 + words[i].length <= maxCharsPerLine) {
                        currentLine += " " + words[i];
                    } else {
                        lines.push(currentLine);
                        currentLine = words[i];
                    }
                }
                lines.push(currentLine);
                return lines;
            };

            const titleLines = wrapText(title, 25); // Large font, fewer chars
            const descLines = wrapText(description || '', 50); // Smaller font

            // SVG Construction
            const svg = `
            <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="bg" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stop-color="${bgColor}"/>
                        <stop offset="100%" stop-color="${isDark ? '#020617' : '#f1f5f9'}"/>
                    </linearGradient>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${gridColor}" stroke-width="1"/>
                    </pattern>
                </defs>

                <!-- Background -->
                <rect width="${width}" height="${height}" fill="url(#bg)"/>
                <rect width="${width}" height="${height}" fill="url(#grid)"/>
                
                <!-- Accent Bar -->
                <rect width="${width}" height="8" fill="${accentColor}"/>

                <!-- Content Container -->
                <g transform="translate(${width / 2}, ${height / 2})" text-anchor="middle">
                    
                    <!-- Title -->
                    <text y="-${(titleLines.length * 35) + (descLines.length > 0 ? 20 : -20)}" 
                          font-family="'Inter', sans-serif" 
                          font-weight="bold" 
                          font-size="72" 
                          fill="${textColor}">
                        ${titleLines.map((line, i) =>
                `<tspan x="0" dy="${i === 0 ? 0 : 85}">${line}</tspan>`
            ).join('')}
                    </text>

                    <!-- Description -->
                    <text y="${(titleLines.length * 10) + 40}" 
                          font-family="'Inter', sans-serif" 
                          font-size="32" 
                          fill="${secondaryColor}">
                        ${descLines.slice(0, 3).map((line, i) => // Limit to 3 lines
                `<tspan x="0" dy="${i === 0 ? 0 : 45}">${line}</tspan>`
            ).join('')}
                    </text>
                </g>

                <!-- Footer -->
                <text x="${width / 2}" y="${height - 50}" 
                      text-anchor="middle"
                      font-family="'Inter', sans-serif" 
                      font-weight="bold" 
                      font-size="24" 
                      fill="${accentColor}">
                    ${siteName}
                </text>
            </svg>
            `;

            // Convert to Base64
            const base64 = Buffer.from(svg).toString('base64');
            const dataUri = `data:image/svg+xml;base64,${base64}`;

            res.json({ success: true, image: dataUri, svg: svg });

        } catch (error) {
            console.error('OG Generation Error:', error);
            res.status(500).json({ success: false, message: 'Failed to generate image' });
        }
    }
};

export default OgController;
