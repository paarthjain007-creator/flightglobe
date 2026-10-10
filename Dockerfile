# Start with the official Node 20 image (Debian Bookworm)
FROM node:20

# Update package lists and install Python
RUN apt-get update -y && \
    apt-get install -y python3 python3-pip python3-venv && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy ALL files first so Prisma can find its schema during installation
COPY . .

# Install Node dependencies
# Note: --legacy-peer-deps prevents strict version conflicts, and we avoid --production 
# so Prisma CLI can generate the database client.
RUN npm install --legacy-peer-deps

# Create a virtual environment and install Python requirements
ENV VIRTUAL_ENV=/app/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

RUN pip install --no-cache-dir -r requirements.txt

# Expose the Render assigned port
EXPOSE $PORT

# Make the start script executable and run it
RUN chmod +x render-start.sh
CMD ["./render-start.sh"]
