import { Command } from 'commander';
import chalk from 'chalk';
import app from '@apiclinic/server';
import { serve } from '@hono/node-server';

const program = new Command();

program
  .name('clinic')
  .description('CLI tool for running the clinic server locally')
  .version('1.0.0');

program
  .command('start')
  .description('Start the clinic server')
  .option('-p, --port <number>', 'Port to run the server on', '6978')
  .option('-e, --env <path>', 'Path to environment file', '.env')
  .action(async (options) => {
    try {
      const port = parseInt(options.port);
      const envPath = options.env;

      console.log(chalk.blue(`🚀 Starting clinic server...`));
      console.log(chalk.gray(`Port: ${port}`));
      console.log(chalk.gray(`Environment: ${envPath}`));

      // Set environment variables
      process.env.PORT = port.toString();
      process.env.NODE_ENV = 'development';

      // Start the server directly using the imported app
      console.log(chalk.blue(`🚀 Server running at http://localhost:${port}`));
      const server = serve({ 
        fetch: app.fetch, 
        port 
      });

      // Handle graceful shutdown
      process.on('SIGINT', () => {
        console.log(chalk.yellow('\n🛑 Shutting down server...'));
        server.close();
        process.exit(0);
      });

      process.on('SIGTERM', () => {
        console.log(chalk.yellow('\n🛑 Shutting down server...'));
        server.close();
        process.exit(0);
      });

    } catch (error) {
      console.error(chalk.red('❌ Error starting server:'), error);
      process.exit(1);
    }
  });

program.parse();
