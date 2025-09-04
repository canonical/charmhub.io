# Local Redis for Development

This setup provides a local Redis instance for development and testing purposes.

## Getting Started

1. Ensure Docker is installed.
2. ```cd cache``` and run ```docker compose up```

3. Ensure redis-cli is installed, in your terminal, run
   ```
   redis-cli -h localhost -p 6379
   ```
   Then you can interact with the redis server, to check all saved keys use:
   ```
   KEYS *
   ```
4. To exit the interactive promt, run
   ```
   exit
   ```
5. To stop the container, run:
   ```
   docker compose down
   ```
For more Redis CLI commands, check the docs at https://redis.io/learn/howtos/quick-start/cheat-sheet
