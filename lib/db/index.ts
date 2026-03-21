/**
 * lib/db — database access boundary.
 * All server code imports from here instead of lib/prisma directly.
 */
export { prisma, prisma as db } from '../prisma';
