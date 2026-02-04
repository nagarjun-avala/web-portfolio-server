/**
 * Calculate reading time from markdown content
 * @param content - The markdown content to analyze
 * @param wordsPerMinute - Average reading speed (default: 200 words/min)
 * @returns Reading time in minutes (rounded up)
 */
export function calculateReadingTime(content: string, wordsPerMinute: number = 200): number {
    if (!content || content.trim().length === 0) {
        return 0;
    }

    // Remove markdown syntax for more accurate word count
    const plainText = content
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/`[^`]*`/g, '') // Remove inline code
        .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
        .replace(/\[([^\]]*)\]\(.*?\)/g, '$1') // Replace links with text only
        .replace(/[#*_~]/g, '') // Remove markdown formatting
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

    const words = plainText.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);

    return Math.max(1, minutes); // Minimum 1 minute
}

/**
 * Format reading time for display
 * @param minutes - Reading time in minutes
 * @returns Formatted string like "5 min read"
 */
export function formatReadingTime(minutes: number): string {
    if (minutes === 0) return '< 1 min read';
    if (minutes === 1) return '1 min read';
    return `${minutes} min read`;
}
