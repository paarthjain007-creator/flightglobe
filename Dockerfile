# Start with the official Node 20 image (Debian Bookworm)
FROM node:20

# Update package lists and install Python
RUN apt-get update -y && \
    apt-get install -y python3 python3-pip python3-venv && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package files and install Node dependencies
COPY package.json ./
RUN npm install --production

# Create a virtual environment and install Python requirements
ENV VIRTUAL_ENV=/app/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the Render assigned port
EXPOSE $PORT

# Make the start script executable and run it
RUN chmod +x render-start.sh
CMD ["./render-start.sh"]
