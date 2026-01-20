/**
 * Shared response utilities for all Workers
 */

import { corsHeaders } from './cors';

/**
 * Create a JSON response with CORS headers
 */
export function jsonResponse(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data, null, 2), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
        },
    });
}

/**
 * Create an error JSON response
 */
export function errorResponse(message: string, status = 400): Response {
    return jsonResponse({ success: false, error: message }, status);
}

/**
 * Create an HTML response
 */
export function htmlResponse(html: string): Response {
    return new Response(html, {
        headers: {
            'Content-Type': 'text/html;charset=UTF-8',
        },
    });
}

/**
 * Create an SVG response with caching
 */
export function svgResponse(svg: string, cacheSeconds = 86400): Response {
    return new Response(svg, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': `public, max-age=${cacheSeconds}`,
            ...corsHeaders,
        },
    });
}
