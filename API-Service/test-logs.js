import { websiteLogger, jobLogger } from './Services/Logger.js';

// Test website logger
websiteLogger.info('Test website log entry', { action: 'test', user: 'admin' });
websiteLogger.warn('Test warning message', { warning: 'This is a test warning' });
websiteLogger.error('Test error message', { error: 'This is a test error', stack: 'Error stack trace here' });

// Test job logger
jobLogger.info('Test job log entry', { job: 'test-job', result: 'success' });
jobLogger.info('🕐 Starting scheduled jobs...');
jobLogger.info('⏰ Cancelled 2 bookings with expired payment holds');
jobLogger.info('✅ Completed 1 bookings that reached end time');

console.log('Test logs created successfully!');
console.log('Check /logs directory for website.log and jobs.log files');